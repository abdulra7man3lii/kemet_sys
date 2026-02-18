const axios = require('axios');

const testHealth = async () => {
    try {
        console.log('Testing Health Endpoint...');
        const res = await axios.get('http://localhost:4000/api/health');
        console.log('Status:', res.status);
        console.log('Response:', res.data);

        if (res.data.database === 'CONNECTED') {
            console.log('SUCCESS: Database is connected.');
        } else {
            console.error('FAILURE: Database is NOT connected.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testHealth();
