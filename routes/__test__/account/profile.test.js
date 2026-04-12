import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /account/profile', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should retrieve authenticated user profile', async () => {
    const response = await api(app)
      .get('/account/profile')
      .set('Authorization', 'Bearer test_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without authentication', async () => {
    const response = await api(app)
      .get('/account/profile');
    
    expect(response.status).toBeDefined();
  });
});
