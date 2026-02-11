const axios = require('axios');
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        console.log("1. Logging in to get token and user data...");
        // Use an existing user - adjust email/password as needed
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "test@test.com",
            password: "password123"
        });

        const token = loginRes.data.token;
        const username = loginRes.data.username;

        console.log("Login Response:", JSON.stringify(loginRes.data, null, 2));
        console.log(`\nUsername from login: "${username}"`);

        if (!username) {
            console.error("ERROR: No username in login response!");
            process.exit(1);
        }

        console.log(`\n2. Testing profile API for username: "${username}"`);
        const profileRes = await axios.get(`${API_URL}/profile/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Profile API Success!");
        console.log("Profile data:", JSON.stringify(profileRes.data.userdata, null, 2));

    } catch (e) {
        console.error("\nERROR:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data);
        }
        process.exit(1);
    }
}
run();
