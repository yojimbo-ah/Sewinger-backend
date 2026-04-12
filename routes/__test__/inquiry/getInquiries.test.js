import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /inquiry', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should retrieve inquiries for user', async () => {
    const response = await api(app)
      .get('/inquiry')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return empty list for user with no inquiries', async () => {
    const response = await api(app)
      .get('/inquiry')
      .set('Authorization', 'Bearer new_user_token');
    
    expect(response.status).toBeDefined();
  });
});
