import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Order from '../../../models/Order.js';

describe('GET /order', () => {
  let app;
  let clientToken;
  let testClientId;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: { $in: ['client@test.com'] } });
      await Order.deleteMany({});
      await global.createAccountsTobeUsed();
      clientToken = await global.getAuthCookieClient();
      const client = await User.findOne({ email: 'client@test.com' });
      testClientId = client._id.toString();
    } catch (error) {
      console.warn('Error in order test setup:', error.message);
    }
  });

  it('should retrieve user orders when authenticated', async () => {
    const response = await api(app)
      .get('/order')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.orders).toBeDefined();
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  it('should return empty list for user with no orders', async () => {
    const response = await api(app)
      .get('/order')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.orders.length).toBe(0);
  });

  it('should return 400 when not authenticated', async () => {
    const response = await api(app)
      .get('/order');
    
    expect(response.status).toBe(400);
  });
});
