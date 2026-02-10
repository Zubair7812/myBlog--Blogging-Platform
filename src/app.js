require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const path = require("path");
const sessions = require("express-session");
const { MongoStore } = require('connect-mongo');
const cors = require("cors");
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
// // EJS setup removed
// app.set("view engine", "ejs"); // Removed for React migration

// Session Setup
const sessionMiddleware = sessions({
  secret: process.env.SESSION_SECRET || "secret key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/myBlog'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: false // Set to true if using https
  }
});

app.use(sessionMiddleware);

// Global User Middleware (to make 'user' available in all views)
app.use((req, res, next) => {
  res.locals.user = req.session.username;
  res.locals.userType = req.session.type;
  next();
});

// Routes
app.use('/api', require('./routes/indexRoutes'));
app.use('/api', require('./routes/authRoutes'));

const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use('/api', blogRoutes);
app.use('/api', userRoutes);
app.use('/api', searchRoutes);
app.use('/api', notificationRoutes);
app.use('/api', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
