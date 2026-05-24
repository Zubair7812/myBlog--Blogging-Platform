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
app.use('/api/thumbnails', express.static("public/thumbnails"));
app.use('/thumbnails', express.static("public/thumbnails"));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api', userRoutes);
app.use('/', userRoutes);

app.use('/api', blogRoutes);
app.use('/', blogRoutes);

app.use('/api', searchRoutes);
app.use('/', searchRoutes);

app.use('/api', notificationRoutes);
app.use('/', notificationRoutes);

app.use('/api', chatRoutes);
app.use('/', chatRoutes);

const { errorHandler } = require('./middleware/errorMiddleware');

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
