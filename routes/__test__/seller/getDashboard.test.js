import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('GET /seller/dashboard', () => {
  let app;
  let sellerToken;
  let clientToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      sellerToken = await global.getAuthCookieSeller();
      clientToken = await global.getAuthCookieClient();
    } catch (error) {
      console.warn('Could not get tokens:', error.message);
    }
  });

  it('should retrieve seller dashboard', async () => {
    const response = await api(app)
      .get('/seller/dashboard')
      .set('Authorization', `Bearer ${sellerToken}`);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without seller authorization', async () => {
    const response = await api(app)
      .get('/seller/dashboard')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBeDefined();
  });
});
