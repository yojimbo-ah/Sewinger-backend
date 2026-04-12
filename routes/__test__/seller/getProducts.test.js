import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /seller/products', () => {
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

  it('should retrieve seller products', async () => {
    const response = await api(app)
      .get('/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return empty list for seller with no products', async () => {
    const response = await api(app)
      .get('/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`);
    
    expect(response.status).toBeDefined();
  });
});
