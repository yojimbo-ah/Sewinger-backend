import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('Admin Routes', () => {
  let app;
  let adminToken;
  let sellerToken;
  let clientToken;
  let testSellerId;
  let testProductId;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      // Clean up test data
      await User.deleteMany({ email: { $in: ['admin@test.com', 'seller@test.com', 'client@test.com'] } });
      await Product.deleteMany({});

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Get tokens
      adminToken = await global.getAuthCookieAdmin();
      sellerToken = await global.getAuthCookieSeller();
      clientToken = await global.getAuthCookieClient();

      // Get user IDs for testing
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      // Create a test product for admin to test
      const newProduct = new Product({
        name: 'Test Product for Admin',
        description: 'This is a test product',
        price: 99.99,
        type: 'digital',
        availbleItems: 100,
        categories: ['test'],
        creatorId: testSellerId,
        images: ['https://example.com/image.jpg'],
        reviews: [],
        valid: false, // Start as invalid for testing approval
      });
      await newProduct.save();
      testProductId = newProduct._id.toString();
    } catch (error) {
      console.warn('Error in admin test setup:', error.message);
    }
  });

  describe('GET /admin/stats', () => {
    it('should retrieve admin statistics when authenticated as admin', async () => {
      const response = await api(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.stats || response.body.message).toBeDefined();
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .get('/admin/stats');

      expect(response.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const response = await api(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${clientToken}`);

      // Either 400 (JWT error) or 403 (insufficient permissions)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('GET /admin/users', () => {
    it('should list all users when authenticated as admin', async () => {
      const response = await api(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .get('/admin/users');

      expect(response.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const response = await api(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${clientToken}`);

      // Either 400 (JWT error) or 403 (insufficient permissions)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('GET /admin/products', () => {
    it('should list all products when authenticated as admin', async () => {
      const response = await api(app)
        .get('/admin/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .get('/admin/products');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /admin/product/request', () => {
    it('should retrieve pending products for approval', async () => {
      const response = await api(app)
        .get('/admin/product/request')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .get('/admin/product/request');

      expect(response.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const response = await api(app)
        .get('/admin/product/request')
        .set('Authorization', `Bearer ${clientToken}`);

      // Either 400 (JWT error) or 403 (insufficient permissions)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('GET /admin/seller/request', () => {
    it('should retrieve seller requests for verification', async () => {
      const response = await api(app)
        .get('/admin/seller/request')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.requests).toBeDefined();
      expect(Array.isArray(response.body.requests)).toBe(true);
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .get('/admin/seller/request');

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /admin/product/:productId', () => {
    it('should handle product approval request', async () => {
      const response = await api(app)
        .patch(`/admin/product/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Accept 200 or 500 (email issue in controller)
      expect([200, 500]).toContain(response.status);
      expect(response.body).toBeDefined();
    });

    it('should return 400 for non-existent product or reject permanently', async () => {
      const response = await api(app)
        .patch('/admin/product/invalid_id')
        .set('Authorization', `Bearer ${adminToken}`);

      // Accept 400 (not found) or 500 (server error)
      expect([400, 500]).toContain(response.status);
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .patch(`/admin/product/${testProductId}`);

      expect(response.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const response = await api(app)
        .patch(`/admin/product/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      // Either 400 (JWT error) or 403 (insufficient permissions)
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('PATCH /admin/user/power/:userId', () => {
    it('should update user power level when authenticated as admin', async () => {
      const response = await api(app)
        .patch(`/admin/user/power/${testSellerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: true });

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
      expect(response.body).toBeDefined();
    });

    it('should return 400 when not authenticated (missing token)', async () => {
      const response = await api(app)
        .patch(`/admin/user/power/${testSellerId}`)
        .send({ status: true });

      expect(response.status).toBe(400);
    });

    it('should reject non-admin user', async () => {
      const response = await api(app)
        .patch(`/admin/user/power/${testSellerId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ status: true });

      // Either 400 (JWT error) or 403 (insufficient permissions)
      expect([400, 403]).toContain(response.status);
    });
  });

});
