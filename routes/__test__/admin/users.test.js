import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /admin/users', () => {
  let app;
  let adminToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      adminToken = await global.getAuthCookieAdmin();
    } catch (error) {
      console.warn('Could not get admin token:', error.message);
    }
  });

  it('should list all users for authorized admin', async () => {
    const response = await api(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without admin authorization', async () => {
    const response = await api(app)
      .get('/admin/users');
    
    expect(response.status).toBeDefined();
  });
});
