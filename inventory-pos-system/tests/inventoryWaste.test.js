const request = require('supertest');
const app = 'http://localhost:4000';
const { getAdminToken } = require('./utils/getToken');

let token;

beforeAll(async () => {
  token = await getAdminToken();
});

describe('Waste Management API', () => {
  it('should add waste stock successfully', async () => {
    const res = await request(app)
      .post('/api/inventory/waste')
      .set('Authorization', `Bearer ${token}`)
      .send({
        inventoryId: 1,
        quantity: 2,
        reason: 'EXPIRED'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('wasteLog');
  });

  it('should fail to add waste if quantity exceeds available stock', async () => {
    const res = await request(app)
      .post('/api/inventory/waste')
      .set('Authorization', `Bearer ${token}`)
      .send({
        inventoryId: 1,
        quantity: 9999,
        reason: 'EXPIRED'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should fetch waste logs', async () => {
    const res = await request(app)
      .get('/api/inventory/waste-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
