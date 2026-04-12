import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /inquiry/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should retrieve specific inquiry', async () => {
    const response = await api(app)
      .get('/inquiry/inq_123')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for non-existent inquiry', async () => {
    const response = await api(app)
      .get('/inquiry/invalid_id')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
  });
});
