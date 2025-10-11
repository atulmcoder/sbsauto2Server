const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2; // ✅ Cloudinary import
const streamifier = require("streamifier"); // ✅ for buffer upload

require("dotenv").config();

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";

// === Middleware: verify token ===
function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return res.status(401).json({ ok: false, error: "Authorization header missing" });

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ ok: false, error: "Invalid Authorization format" });
  }

  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}

// === Middleware: require admin ===
function requireAdmin(req, res, next) {
  if ((req.user && req.user.isAdmin) || (req.user && req.user.username === ADMIN_USERNAME)) {
    return next();
  }
  return res.status(403).json({ ok: false, error: "Not authorized (admin only)" });
}

// ✅ Helper: upload buffer to cloudinary
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    let cld_upload_stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
}

// === GET all products ===
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ ok: true, products });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// === GET single product ===
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ ok: false, message: "Product not found" });
    res.json({ ok: true, product });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// === Create product ===
router.post(
  "/",
  verifyToken,
  requireAdmin,
  upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "gallery", maxCount: 20 }]),
  async (req, res) => {
    try {
      const body = req.body.data ? JSON.parse(req.body.data) : req.body;
      const product = new Product(body);

      // ✅ upload main image
      if (req.files["mainImage"] && req.files["mainImage"][0]) {
        const result = await uploadToCloudinary(req.files["mainImage"][0].buffer, "products/main");
        product.mainImage = { url: result.secure_url, public_id: result.public_id };
      }

      // ✅ upload gallery images
      if (req.files["gallery"]) {
        product.gallery = [];
        for (let file of req.files["gallery"]) {
          const result = await uploadToCloudinary(file.buffer, "products/gallery");
          product.gallery.push({ url: result.secure_url, public_id: result.public_id });
        }
      }

      await product.save();
      res.status(201).json({ ok: true, product });
    } catch (err) {
      console.error("Create product error:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

// === Update product ===
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  upload.fields([{ name: "mainImage", maxCount: 1 }, { name: "gallery", maxCount: 20 }]),
  async (req, res) => {
    try {
      const p = await Product.findById(req.params.id);
      if (!p) return res.status(404).json({ ok: false, message: "Product not found" });

      const body = req.body.data ? JSON.parse(req.body.data) : req.body;
      Object.assign(p, body);

      // ✅ replace main image if new one provided
      if (req.files["mainImage"] && req.files["mainImage"][0]) {
        const result = await uploadToCloudinary(req.files["mainImage"][0].buffer, "products/main");
        p.mainImage = { url: result.secure_url, public_id: result.public_id };
      }

      // ✅ add new gallery images
      if (req.files["gallery"]) {
        for (let file of req.files["gallery"]) {
          const result = await uploadToCloudinary(file.buffer, "products/gallery");
          p.gallery.push({ url: result.secure_url, public_id: result.public_id });
        }
      }

      await p.save();
      res.json({ ok: true, product: p });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
);

// === Delete product ===
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
