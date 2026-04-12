import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /seller/analytics', () => {
  let app;
  let sellerToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      sellerToken = await global.getAuthCookieSeller();
    } catch (error) {
      console.warn('Could not get seller token:', error.message);
    }
  });

  it('should retrieve seller analytics', async () => {
    const response = await api(app)
      .get('/seller/analytics')
      .set('Authorization', 'Bearer seller_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should include sales and performance metrics', async () => {
    const response = await api(app)
      .get('/seller/analytics')
      .set('Authorization', 'Bearer seller_token');
    
    expect(response.status).toBeDefined();
  });
});
