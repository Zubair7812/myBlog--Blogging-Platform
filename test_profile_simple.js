const axios = require('axios');

async function run() {
    try {
        // Based on server logs, username is "Zubair"
        // Let's test if we can access the profile without auth first
        console.log("Testing profile API for username: Zubair\n");

        try {
            const res = await axios.get('http://localhost:3000/api/profile/Zubair');
            console.log("✓ Profile API (no auth) returned:", res.status);
            console.log("Data:", JSON.stringify(res.data, null, 2));
        } catch (e) {
            console.log(`✗ Profile API (no auth) failed: ${e.response?.status} - ${e.response?.data?.error || e.message}`);

            if (e.response?.status === 401) {
                console.log("\nProfile requires authentication. This is expected after our fix.");
                console.log("The issue is that the frontend needs to be logged in to view profiles.");
            }
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
