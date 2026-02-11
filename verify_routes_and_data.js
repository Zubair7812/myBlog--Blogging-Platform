const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Blog = require('./src/models/Blog');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';

async function run() {
    console.log("=== 1. Checking Data Integrity ===");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB.");

        const users = await User.find({});
        console.log(`Found ${users.length} Users:`);
        users.forEach(u => console.log(` - ID: ${u._id}, Name: "${u.name}", Username: "${u.username}", Email: "${u.email}"`));

        const blogs = await Blog.find({});
        console.log(`Found ${blogs.length} Blogs:`);
        blogs.forEach(b => console.log(` - ID: ${b._id}, Title: "${b.title}", Author: "${b.author}"`));

        // Check author existence
        blogs.forEach(b => {
            const authorExists = users.some(u => u.username === b.author);
            if (!authorExists) {
                console.warn(`WARNING: Blog "${b.title}" has author "${b.author}" which DOES NOT match any user.username!`);
            }
        });

    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await mongoose.connection.close();
    }

    console.log("\n=== 2. Testing API Routes (Requires Server Running) ===");
    try {
        // 1. Login to get token
        console.log("Attempting Login...");
        // Use a user from the DB list if possible, or hardcode known test user
        // I'll try to register a new temp user to be sure, or login with 'test@test.com'
        const testUser = { name: "TestUser", email: `test_${Date.now()}@example.com`, password: "password123" };

        let token;
        try {
            console.log(`Registering temp user: ${testUser.email}`);
            const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
            token = regRes.data.token;
            console.log("Registration Successful. Token received.");
        } catch (e) {
            console.log("Registration failed or user exists. Trying login...");
            if (e.response && e.response.status === 400) {
                // Try login
                try {
                    const loginRes = await axios.post(`${API_URL}/auth/login`, { email: testUser.email, password: testUser.password });
                    token = loginRes.data.token;
                    console.log("Login Successful. Token received.");
                } catch (loginErr) {
                    console.error("Login failed:", loginErr.message);
                    // Fallback: try to login with a known user if the above was dynamic
                }
            } else {
                console.error("Registration Error:", e.message);
            }
        }

        if (!token) {
            console.error("Cannot proceed without token.");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test /api/posts (Home Feed)
        console.log("\nTesting GET /api/posts (Home Feed)...");
        try {
            const postsRes = await axios.get(`${API_URL}/posts`, { headers });
            console.log(`SUCCESS: Found ${postsRes.data.length} posts.`);
        } catch (e) {
            console.error(`FAILED /api/posts: ${e.message} (Status: ${e.response?.status})`);
        }

        // 3. Test /api/chat/contacts (Chat Sidebar)
        console.log("\nTesting GET /api/chat/contacts (Chat Sidebar)...");
        try {
            const chatRes = await axios.get(`${API_URL}/chat/contacts`, { headers });
            console.log(`SUCCESS: Contacts API working. Data:`, chatRes.data);
        } catch (e) {
            console.error(`FAILED /api/chat/contacts: ${e.message} (Status: ${e.response?.status})`);
        }

        // 4. Test /api/auth/me (Profile Check)
        console.log("\nTesting GET /api/auth/me...");
        try {
            const meRes = await axios.get(`${API_URL}/auth/me`, { headers });
            console.log(`SUCCESS: User Profile:`, meRes.data);
        } catch (e) {
            console.error(`FAILED /api/auth/me: ${e.message} (Status: ${e.response?.status})`);
        }

    } catch (e) {
        console.error("API Test Error:", e.message);
    }
}

run();
