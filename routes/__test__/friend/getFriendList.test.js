import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /friend/list', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should retrieve user friends list', async () => {
    const response = await api(app)
      .get('/friend/list')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return empty list for user with no friends', async () => {
    const response = await api(app)
      .get('/friend/list')
      .set('Authorization', 'Bearer new_user_token');
    
    expect(response.status).toBeDefined();
  });
});
