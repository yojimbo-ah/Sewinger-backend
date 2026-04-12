import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('GET /product', () => {
  let app;
  let clientToken;
  let sellerToken;

  beforeAll(() => {
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
      clientToken = await global.getAuthCookieClient();
      sellerToken = await global.getAuthCookieSeller();

      // Create test products (marked as valid)
      const seller = await User.findOne({ email: 'seller@test.com' });
      const sellerId = seller._id.toString();

      for (let i = 1; i <= 15; i++) {
        await Product.create({
          name: `Product ${i}`,
          description: `This is a detailed description for product ${i}`,
          price: 50 + i * 5,
          type: 'normal',
          availbleItems: 100,
          categories: ['electronics', 'gadgets'],
          creatorId: sellerId,
          images: ['https://example.com/image.jpg'],
          valid: true,
        });
      }
    } catch (error) {
      console.warn('Error in product test setup:', error.message);
    }
  });

  describe('Success Cases', () => {
    it('should retrieve all valid products', async () => {
      const response = await api(app).get('/product/normal');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(12);
      expect(response.body.pagination.totalPages).toBeGreaterThan(0);
    });

    it('should support pagination with page parameter', async () => {
      const response = await api(app).get('/product/normal?page=1');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.products.length).toBeLessThanOrEqual(12);
    });

    it('should return page 2 when requested', async () => {
      const response = await api(app).get('/product/normal?page=2');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
    });

    it('should include pagination metadata', async () => {
      const response = await api(app).get('/product/normal?page=1');

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalItems');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('hasNextPage');
      expect(response.body.pagination).toHaveProperty('hasPrevPage');
    });

    it('should only return valid products', async () => {
      const response = await api(app).get('/product/normal');

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBeGreaterThan(0);
      response.body.products.forEach(product => {
        expect(product.valid).toEqual(true);
      });
    });

    it('should return products sorted by creation date descending', async () => {
      const response = await api(app).get('/product/normal');

      expect(response.status).toBe(200);
      if (response.body.products.length > 1) {
        const products = response.body.products;
        for (let i = 0; i < products.length - 1; i++) {
          const date1 = new Date(products[i].createdAt);
          const date2 = new Date(products[i + 1].createdAt);
          expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
        }
      }
    });

    it('should include product details in response', async () => {
      const response = await api(app).get('/product/normal');

      expect(response.status).toBe(200);
      if (response.body.products.length > 0) {
        const product = response.body.products[0];
        expect(product).toHaveProperty('_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('images');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative page number gracefully', async () => {
      const response = await api(app).get('/product/normal?page=-1');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should handle invalid page number (0)', async () => {
      const response = await api(app).get('/product/normal?page=0');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should handle very large page number', async () => {
      const response = await api(app).get('/product/normal?page=9999');

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(0);
    });
  });
});
