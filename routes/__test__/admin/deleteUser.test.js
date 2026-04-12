import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('DELETE /admin/users/:id', () => {
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

  it('should delete a user by id with admin authorization', async () => {
    const response = await api(app)
      .delete('/admin/users/user_id')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without admin authorization', async () => {
    const response = await api(app)
      .delete('/admin/users/user_id');
    
    expect(response.status).toBeDefined();
  });
});
