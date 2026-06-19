import request from 'supertest';
import app from '../index';

describe('GET /api/users', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/users/some-uuid');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/:id', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).put('/api/users/some-uuid').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:id', () => {
  it('returns 401 without auth token', async () => {
    const res = await request(app).delete('/api/users/some-uuid');
    expect(res.status).toBe(401);
  });
});
