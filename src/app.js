require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./db");
const path = require("path");
const sessions = require("express-session");
const { MongoStore } = require('connect-mongo');
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// Session Setup
app.use(sessions({
  secret: process.env.SESSION_SECRET || "secret key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/myBlog'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Global User Middleware (to make 'user' available in all views)
app.use((req, res, next) => {
  res.locals.user = req.session.username;
  res.locals.userType = req.session.type;
  next();
});

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/', require('./routes/authRoutes'));

const blogRoutes = require("./routes/blogRoutes");
const userRoutes = require("./routes/userRoutes");
const searchRoutes = require("./routes/searchRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use(blogRoutes);
app.use(userRoutes);
app.use(searchRoutes);
app.use(notificationRoutes);
app.use(chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render("notfound");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
