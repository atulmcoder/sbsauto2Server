const express = require('express');
require('dotenv').config();
const cors = require("cors");
const path = require('path');
const db = require('./db'); // DB connection
const cloudinary = require('cloudinary').v2;  // ✅ Cloudinary import

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || dq75vcord,
  api_key: process.env.CLOUDINARY_API_KEY || 978355765465713,
  api_secret: process.env.CLOUDINARY_API_SECRET|| EO4C7tgWKqpz0eojfLmfiClUpx8
});

// Static folder (अगर future में local files use करने हो)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin:[ process.env.FRONTEND_URL || "http://localhost:5173",
          "https://sbsauto.ca/"
          ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-type", "Authorization"]
  
}));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const userRoute = require('./routes/userRoute');

app.use('/api/users', userRoute);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Server Start
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
