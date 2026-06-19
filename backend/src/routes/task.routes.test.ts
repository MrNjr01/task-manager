import request from 'supertest';
import app from '../index';

describe('POST /api/tasks', () => {
  it('returns 400 when no assignees provided', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Test task',
      startDate: '2026-06-20T00:00:00Z',
      dueDate: '2026-06-27T00:00:00Z',
      assigneeIds: [],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Test',
      startDate: '2026-06-20T00:00:00Z',
      dueDate: '2026-06-27T00:00:00Z',
      assigneeIds: ['550e8400-e29b-41d4-a716-446655440000'],
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/tasks', () => {
  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });
});
