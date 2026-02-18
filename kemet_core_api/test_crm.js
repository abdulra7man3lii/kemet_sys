const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

const testCRM = async () => {
    try {
        console.log('--- Starting CRM API Verification ---');

        // 1. Auth: Register/Login to get token
        console.log('\n1. Authenticating...');
        const userCreds = {
            email: `crm_test_${Date.now()}@test.com`,
            password: 'password123',
            name: 'CRM Tester'
        };

        // Try login first, if fails then register
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: userCreds.email,
                password: userCreds.password
            });
            token = loginRes.data.token;
        } catch (e) {
            const registerRes = await axios.post(`${API_URL}/auth/register`, userCreds);
            token = registerRes.data.token;
        }
        console.log('Authenticated. Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Create Customer
        console.log('\n2. Creating Customer...');
        const newCustomer = {
            name: 'Acme Corp',
            email: `contact_${Date.now()}@acme.com`,
            phone: '123-456-7890',
            company: 'Acme Inc.',
            status: 'PROSPECT'
        };
        const createRes = await axios.post(`${API_URL}/customers`, newCustomer, config);
        console.log('Customer Created:', createRes.data.id, createRes.data.name);
        const customerId = createRes.data.id;

        // 3. Get All Customers
        console.log('\n3. Fetching All Customers...');
        const getAllRes = await axios.get(`${API_URL}/customers`, config);
        console.log(`Retrieved ${getAllRes.data.length} customers.`);
        const exists = getAllRes.data.find(c => c.id === customerId);
        if (!exists) throw new Error('Created customer not found in list!');

        // 4. Get Customer by ID
        console.log('\n4. Fetching Customer by ID...');
        const getOneRes = await axios.get(`${API_URL}/customers/${customerId}`, config);
        if (getOneRes.data.name !== newCustomer.name) throw new Error('Customer data mismatch!');
        console.log('Customer Fetched:', getOneRes.data.name);

        // 5. Update Customer
        console.log('\n5. Updating Customer...');
        const updateRes = await axios.put(`${API_URL}/customers/${customerId}`, {
            status: 'CUSTOMER',
            company: 'Acme Global'
        }, config);
        console.log('Customer Updated:', updateRes.data.status, updateRes.data.company);
        if (updateRes.data.status !== 'CUSTOMER') throw new Error('Update failed!');

        // 6. Delete Customer
        console.log('\n6. Deleting Customer...');
        await axios.delete(`${API_URL}/customers/${customerId}`, config);
        console.log('Customer Deleted.');

        // Verify Deletion
        try {
            await axios.get(`${API_URL}/customers/${customerId}`, config);
        } catch (e) {
            if (e.response && e.response.status === 404) {
                console.log('Verification: Customer correctly returned 404.');
            } else {
                throw e;
            }
        }

        console.log('\n--- CRM API Verification PASSED ---');

    } catch (error) {
        console.error('\n!!! TEST FAILED !!!');
        console.error(error.message);
        if (error.response) {
            console.error('Response:', error.response.status, error.response.data);
        }
    }
};

testCRM();
