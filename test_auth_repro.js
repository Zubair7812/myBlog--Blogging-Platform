const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';

const testAuth = async () => {
    try {
        console.log('--- Testing Registration ---');
        const uniqueEmail = `test${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('Registration Success:', registerRes.data);

        console.log('\n--- Testing Login (New User) ---');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);

    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
    }
};

testAuth();
