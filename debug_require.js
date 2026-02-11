const fs = require('fs');
const path = require('path');

const tryRequire = (name, p) => {
    try {
        require(p);
        console.log(`[PASS] ${name}`);
    } catch (e) {
        console.error(`[FAIL] ${name}: ${e.message}`);
        console.error(e.stack);
    }
};

console.log('--- Testing Requires ---');
tryRequire('dotenv', 'dotenv');
tryRequire('db', './src/db');
tryRequire('User Model', './src/models/User');
tryRequire('Auth Controller', './src/controllers/authController');
tryRequire('Auth Middleware', './src/middleware/authMiddleware');
tryRequire('Auth Routes', './src/routes/authRoutes');
tryRequire('User Routes', './src/routes/userRoutes');
tryRequire('Blog Routes', './src/routes/blogRoutes');
tryRequire('Error Middleware', './src/middleware/errorMiddleware');
tryRequire('App', './src/app');
