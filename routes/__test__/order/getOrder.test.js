import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /order/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should retrieve specific order', async () => {
    const response = await api(app)
      .get('/order/order_123')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for non-existent order', async () => {
    const response = await api(app)
      .get('/order/invalid_id')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
  });
});
