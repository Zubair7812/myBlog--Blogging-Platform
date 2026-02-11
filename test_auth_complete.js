const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function run() {
    try {
        // Connect to DB to check users
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB\n");

        const users = await User.find({}).select('name email username').limit(1);
        if (users.length === 0) {
            console.log("No users found in database!");
            await mongoose.connection.close();
            return;
        }

        const dbUser = users[0];
        console.log("First user in DB:");
        console.log(`  Name: "${dbUser.name}"`);
        console.log(`  Email: "${dbUser.email}"`);
        console.log(`  Username: "${dbUser.username}"`);

        await mongoose.connection.close();

        // Now test the API
        console.log("\n--- Testing API with this user's email ---\n");

        // You'll need to know the password - try common ones
        const passwords = ['password', 'password123', '123456', 'test123'];
        let token = null;

        for (const pwd of passwords) {
            try {
                console.log(`Trying password: "${pwd}"...`);
                const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
                    email: dbUser.email,
                    password: pwd
                });
                token = loginRes.data.token;
                console.log("✓ Login successful!");
                console.log("Login response:", JSON.stringify(loginRes.data, null, 2));
                break;
            } catch (e) {
                console.log(`✗ Failed with: ${e.response?.data?.message || e.message}`);
            }
        }

        if (!token) {
            console.log("\nCouldn't log in with common passwords. Please provide the correct password.");
            return;
        }

        // Test /api/auth/me
        console.log("\n--- Testing /api/auth/me ---\n");
        const meRes = await axios.get('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("/api/auth/me response:", JSON.stringify(meRes.data, null, 2));

        if (!meRes.data.username) {
            console.log("\n⚠️  ERROR: 'username' field is missing in /api/auth/me response!");
        } else {
            console.log(`\n✓ Username found: "${meRes.data.username}"`);
        }

    } catch (e) {
        console.error("\nError:", e.message);
        if (e.response) {
            console.error("Response data:", e.response.data);
        }
    }
}
run();
