import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';

describe('GET /notification', () => {
  let app;
  let clientToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      // Clean up
      await User.deleteMany({ email: { $in: ['client@test.com'] } });

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Get token
      clientToken = await global.getAuthCookieClient();
    } catch (error) {
      console.warn('Could not get client token:', error.message);
    }
  });

  it('should retrieve user notifications when authenticated', async () => {
    const response = await api(app)
      .get('/notification')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.notification).toBeDefined();
  });

  it('should have notification object with _id', async () => {
    const response = await api(app)
      .get('/notification')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.notification._id).toBeDefined();
  });

  it('should return 400 when not authenticated (missing token)', async () => {
    const response = await api(app)
      .get('/notification');

    expect(response.status).toBe(400);
  });

  it('should return 400 when token is invalid', async () => {
    const response = await api(app)
      .get('/notification')
      .set('Authorization', 'Bearer invalid_token_xyz');

    expect([400, 401]).toContain(response.status);
  });
});
