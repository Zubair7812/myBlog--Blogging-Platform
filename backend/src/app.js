require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const path = require("path");
const cors = require("cors");
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/blogRoutes'));
app.use('/api', require('./routes/searchRoutes'));
app.use('/api', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/chatRoutes'));

const { errorHandler } = require('./middleware/errorMiddleware');

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
