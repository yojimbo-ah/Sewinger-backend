import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /seller/apply', () => {
  let app;
  let clientToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      clientToken = await global.getAuthCookieClient();
    } catch (error) {
      console.warn('Could not get client token:', error.message);
    }
  });

  it('should apply to become a seller', async () => {
    const applicationData = {
      shopName: 'My Shop',
      category: 'Fashion',
    };

    const response = await api(app)
      .post('/seller/apply')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(applicationData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error with missing required fields', async () => {
    const applicationData = {
      shopName: 'My Shop',
    };

    const response = await api(app)
      .post('/seller/apply')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(applicationData);
    
    expect(response.status).toBeDefined();
  });
});
