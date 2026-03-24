const axios = require('axios');
async function test() {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', { email: 'seller_v2@test.com', password: 'password123' });
        const token = loginRes.data.token;
        const dashboardRes = await axios.get('http://localhost:5000/api/v1/vehicles/dashboard', { headers: { Authorization: 'Bearer ' + token } });
        console.log("SUCCESS:", dashboardRes.data);
    } catch (err) {
        console.error("ERROR:");
        console.dir(err.response ? err.response.data : err);
    }
}
test();
