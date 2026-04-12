import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('GET /product/details/:productId', () => {
  let app;
  let testProductId;
  let testSellerId;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      // Clean up
      await User.deleteMany({ email: { $in: ['seller@test.com'] } });
      await Product.deleteMany({});

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Create seller and product
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      const testProduct = new Product({
        name: 'Test Product for Details',
        description: 'This is a detailed description for testing product details endpoint',
        price: 99.99,
        type: 'normal',
        availbleItems: 50,
        categories: ['electronics'],
        creatorId: testSellerId,
        images: ['https://example.com/image.jpg'],
        valid: true,
      });
      await testProduct.save();
      testProductId = testProduct._id.toString();
    } catch (error) {
      console.warn('Error in product test setup:', error.message);
    }
  });

  describe('Success Cases', () => {
    it('should retrieve product details when product exists', async () => {
      const response = await api(app)
        .get(`/product/details/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe('Test Product for Details');
      expect(response.body.product.price).toBe(99.99);
      expect(response.body.creator).toBeDefined();
      expect(response.body.creator._id).toBe(testSellerId);
    });

    it('should include creator information in response', async () => {
      const response = await api(app)
        .get(`/product/details/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.creator).toHaveProperty('name');
      expect(response.body.creator).toHaveProperty('bio');
      expect(response.body.creator).toHaveProperty('_id');
    });

    it('should include product details', async () => {
      const response = await api(app)
        .get(`/product/details/${testProductId}`);

      expect(response.status).toBe(200);
      const product = response.body.product;
      expect(product).toHaveProperty('_id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('categories');
    });
  });

  describe('Failure Cases', () => {
    it('should return 400 for non-existent product', async () => {
      const fakeProductId = '507f1f77bcf86cd799439011';
      const response = await api(app)
        .get(`/product/details/${fakeProductId}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Product not found');
    });

    it('should return 400 for invalid product ID format', async () => {
      const response = await api(app)
        .get('/product/details/invalid_id');

      expect([400, 500]).toContain(response.status);
    });
  });
});
