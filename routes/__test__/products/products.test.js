import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('Products Routes Overview', () => {
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
      await User.deleteMany({ email: { $in: ['seller@test.com', 'client@test.com'] } });
      await Product.deleteMany({});

      // Create test accounts
      await global.createAccountsTobeUsed();

      // Get tokens
      sellerToken = await global.getAuthCookieSeller();
      clientToken = await global.getAuthCookieClient();

      // Create product
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      const testProduct = new Product({
        name: 'Test Product',
        description: 'This is a detailed test product description',
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

  describe('GET /product/normal', () => {
    it('should retrieve all public (valid) products', async () => {
      const response = await api(app).get('/product/normal');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await api(app).get('/product/normal?page=1');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });
  });

  describe('GET /product/details/:productId', () => {
    it('should retrieve product details with creator info', async () => {
      const response = await api(app)
        .get(`/product/details/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.product).toBeDefined();
      expect(response.body.creator).toBeDefined();
      expect(response.body.product._id).toBe(testProductId);
    });
  });

  describe('POST /product/create', () => {
    it('should not allow client to create product', async () => {
      const productData = {
        name: 'Attempted Product',
        description: 'A test product description that is long',
        price: 50.00,
        type: 'normal',
        quantity: 10,
        categories: JSON.stringify(['test']),
      };

      const response = await api(app)
        .post('/product/create')
        .set('Authorization', `Bearer ${clientToken}`)
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('type', productData.type)
        .field('quantity', productData.quantity)
        .field('categories', productData.categories);

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const productData = {
        name: 'Attempted Product',
        description: 'A test product description that is long',
        price: 50.00,
        type: 'normal',
        quantity: 10,
        categories: JSON.stringify(['test']),
      };

      const response = await api(app)
        .post('/product/create')
        .field('name', productData.name)
        .field('description', productData.description)
        .field('price', productData.price)
        .field('type', productData.type)
        .field('quantity', productData.quantity)
        .field('categories', productData.categories);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /product/delete/:productId', () => {
    it('should not allow non-owner to delete', async () => {
      const response = await api(app)
        .delete(`/product/delete/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated delete', async () => {
      const response = await api(app)
        .delete(`/product/delete/${testProductId}`);

      expect(response.status).toBe(400);
    });
  });
});
