const mongoose = require("mongoose");

// ImageSchema now stores only URL
const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  year: { type: Number, min: 1900, max: 2100 },
  make: { type: String, trim: true },
  model: { type: String, trim: true },
  tag: { type: String, trim: true },
  stock: { type: Number, default: 0 },
  engine: { type: String, trim: true },
  transmission: { type: String, trim: true },
  drivetrain: { type: String, trim: true },
  exterior: { type: String, trim: true },
  interior: { type: String, trim: true },
  odometer: { type: Number },
  hwy_l100km: { type: Number },
  city_l100km: { type: Number },
    carfex_url: { type:  String },
  price: { type: Number, default: 0 },
  description: { type: String, trim: true },
  hwy: { type: String, trim: true },
  city: { type: String, trim: true },
  features: [{ type: String, trim: true }],
  contact: {
    location: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  mainImage: ImageSchema,   // now just stores URL
  gallery: [ImageSchema],   // now just stores URLs
  badges: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
