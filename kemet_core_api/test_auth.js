const axios = require('axios');

const API_URL = 'http://localhost:4000/api/auth';

const testAuth = async () => {
    try {
        console.log('Testing Registration...');
        const registerRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: 'test@kemet.com',
            password: 'password123'
        });
        console.log('Registration Success:', registerRes.data);

        console.log('\nTesting Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: 'test@kemet.com',
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);

        if (loginRes.data.token) {
            console.log('\nToken received successfully.');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
};

testAuth();
