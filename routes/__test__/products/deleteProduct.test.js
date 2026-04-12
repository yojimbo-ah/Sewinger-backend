import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('DELETE /product/delete/:productId', () => {
  let app;
  let sellerToken;
  let clientToken;
  let testProductId;
  let testSellerId;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      // Clean up
      await User.deleteMany({ email: { $in: ['seller@test.com', 'client@test.com', 'admin@test.com'] } });
      await Product.deleteMany({});

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Get tokens
      sellerToken = await global.getAuthCookieSeller();
      clientToken = await global.getAuthCookieClient();

      // Create seller and product
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      const testProduct = new Product({
        name: 'Product to Delete',
        description: 'This is a test product that will be deleted',
        price: 75.00,
        type: 'normal',
        availbleItems: 20,
        categories: ['test'],
        creatorId: testSellerId,
        images: ['https://example.com/image.jpg'],
        valid: true,
      });
      await testProduct.save();
      testProductId = testProduct._id.toString();
    } catch (error) {
      console.error('ERROR in deleteProduct test setup:', error);
      throw error;
    }
  });

  describe('Success Cases', () => {
    it('should delete product when owner is authenticated', async () => {
      const response = await api(app)
        .delete(`/product/delete/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.message).toContain('deleted');

      // Verify product is actually deleted
      const deletedProduct = await Product.findById(testProductId);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('Failure Cases', () => {
    it('should return 400 when not authenticated', async () => {
      const response = await api(app)
        .delete(`/product/delete/${testProductId}`);

      expect(response.status).toBe(400);
    });

    it('should return 400 when user is not the product owner', async () => {
      const response = await api(app)
        .delete(`/product/delete/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('not allowed');
    });

    it('should return 400 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await api(app)
        .delete(`/product/delete/${fakeId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('could');
    });

    it('should return 400 for invalid product ID format', async () => {
      const response = await api(app)
        .delete('/product/delete/invalid_id')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect([400, 500]).toContain(response.status);
    });
  });
});
