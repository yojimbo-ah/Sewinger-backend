import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';

describe('GET /cart', () => {
  let app;
  let clientToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: 'client@test.com' });
      await global.createAccountsTobeUsed();
      clientToken = await global.getAuthCookieClient();
    } catch (error) {
      console.warn('Error in test setup:', error.message);
    }
  });

  it('should retrieve user cart', async () => {
    const response = await api(app)
      .get('/cart')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.cart).toBeDefined();
    expect(response.body.cart.items).toBeDefined();
    expect(response.body.cart.totalPrice).toBeDefined();
  });

  it('should have empty cart for new user', async () => {
    const response = await api(app)
      .get('/cart')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.cart.items)).toBe(true);
    expect(response.body.cart.totalPrice).toBe(0);
  });

  it('should return 400 when not authenticated', async () => {
    const response = await api(app)
      .get('/cart');
    
    expect(response.status).toBe(400);
  });
});
