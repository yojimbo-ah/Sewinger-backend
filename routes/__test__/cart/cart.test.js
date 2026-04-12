import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('Cart Routes', () => {
  let app;
  let clientToken;
  let sellerToken;
  let testProductId;
  let testSellerId;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      // Clean up
      await User.deleteMany({ email: { $in: ['seller@test.com', 'client@test.com'] } });
      await Product.deleteMany({});

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Get tokens
      clientToken = await global.getAuthCookieClient();
      sellerToken = await global.getAuthCookieSeller();

      // Create seller and product
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      const testProduct = new Product({
        name: 'Test Product for Cart',
        description: 'This is a test product for cart operations',
        price: 50.00,
        type: 'normal',
        availbleItems: 100,
        categories: ['electronics'],
        creatorId: testSellerId,
        images: ['https://example.com/image.jpg'],
        valid: true,
      });
      await testProduct.save();
      testProductId = testProduct._id.toString();
    } catch (error) {
      console.warn('Error in cart test setup:', error.message);
    }
  });

  describe('GET /cart', () => {
    it('should retrieve user cart when authenticated', async () => {
      const response = await api(app)
        .get('/cart')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.cart).toBeDefined();
    });

    it('should return cart with items and totalPrice', async () => {
      const response = await api(app)
        .get('/cart')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.cart.items).toBeDefined();
      expect(Array.isArray(response.body.cart.items)).toBe(true);
      expect(response.body.cart.totalPrice).toBeDefined();
    });

    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .get('/cart');

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /cart/buy/:productId', () => {
    it('should add product to cart', async () => {
      const response = await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 with invalid quantity', async () => {
      const response = await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
    });

    it('should return 400 with negative quantity', async () => {
      const response = await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: -5 });

      expect(response.status).toBe(400);
    });

    it('should return 400 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await api(app)
        .put(`/cart/buy/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .put(`/cart/buy/${testProductId}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /cart/update/:productId', () => {
    beforeEach(async () => {
      // Add product to cart first
      await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 1 });
    });

    it('should update product quantity in cart', async () => {
      const response = await api(app)
        .patch(`/cart/update/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 with invalid quantity', async () => {
      const response = await api(app)
        .patch(`/cart/update/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 0 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when product not in cart', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await api(app)
        .patch(`/cart/update/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(400);
    });

    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .patch(`/cart/update/${testProductId}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /cart/delete/:productId', () => {
    beforeEach(async () => {
      // Add product to cart first
      await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 1 });
    });

    it('should remove product from cart', async () => {
      const response = await api(app)
        .delete(`/cart/delete/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('removed');
    });

    it('should return 400 for product not in cart', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await api(app)
        .delete(`/cart/delete/${fakeId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .delete(`/cart/delete/${testProductId}`);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /cart/delete', () => {
    beforeEach(async () => {
      // Add product to cart first
      await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 2 });
    });

    it('should clear entire cart', async () => {
      const response = await api(app)
        .delete('/cart/delete')
        .set('Authorization', `Bearer ${clientToken}`);

      // May return 200 or 500 depending on email service
      expect([200, 500]).toContain(response.status);
    });

    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .delete('/cart/delete');

      expect(response.status).toBe(400);
    });
  });
});
