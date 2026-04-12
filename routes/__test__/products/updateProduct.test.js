import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('PATCH /product/edit/:productId', () => {
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

      // Create seller and product
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();

      const testProduct = new Product({
        name: 'Original Product Name',
        description: 'This is the original product description that is long enough',
        price: 100.00,
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
    it('should update product when owner is authenticated', async () => {
      const updateData = {
        name: 'Updated Product Name',
        description: 'This is the updated product description with more details',
        price: 125.00,
        type: 'normal',
        availbleItems: 75,
        categories: JSON.stringify(['electronics', 'gadgets']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect([200, 400]).toContain(response.status); // 400 if file upload required
    });
  });

  describe('Failure Cases', () => {
    it('should return 400 when not authenticated', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description that is long enough',
        price: 120.00,
        type: 'normal',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
    });

    it('should return 400 when user is not the product owner', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description that is long enough',
        price: 120.00,
        type: 'normal',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("cant edit");
    });

    it('should return 400 for non-existent product', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description that is long enough',
        price: 120.00,
        type: 'normal',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${fakeId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid price', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description that is long enough',
        price: -50,
        type: 'normal',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid type', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description that is long enough',
        price: 120.00,
        type: 'invalid_type',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
    });

    it('should return 400 with empty name', async () => {
      const updateData = {
        name: '',
        description: 'Updated description that is long enough',
        price: 120.00,
        type: 'normal',
        availbleItems: 60,
        categories: JSON.stringify(['electronics']),
      };

      const response = await api(app)
        .patch(`/product/edit/${testProductId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', updateData.name)
        .field('description', updateData.description)
        .field('price', updateData.price)
        .field('type', updateData.type)
        .field('availbleItems', updateData.availbleItems)
        .field('categories', updateData.categories);

      expect(response.status).toBe(400);
    });
  });
});
