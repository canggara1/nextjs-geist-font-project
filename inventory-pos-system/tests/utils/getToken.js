const request = require('supertest');
const app = 'http://localhost:4000';

async function getAdminToken() {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@example.com',
      password: 'password123'
    });

  if (res.statusCode !== 200 || !res.body.token) {
    throw new Error('Failed to login and retrieve token');
  }

  return res.body.token;
}

module.exports = { getAdminToken };
