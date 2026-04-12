import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('PUT /cart/buy/:productId (Add to Cart)', () => {
  let app;
  let clientToken;
  let testProductId;
  let testSellerId;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: { $in: ['seller@test.com', 'client@test.com'] } });
      await Product.deleteMany({});
      await global.createAccountsTobeUsed();
      clientToken = await global.getAuthCookieClient();
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();
      const testProduct = new Product({
        name: 'Test Product',
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
      console.warn('Error in test setup:', error.message);
    }
  });

  it('should add item to cart', async () => {
    const response = await api(app)
      .put(`/cart/buy/${testProductId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ quantity: 1 });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();
  });

  it('should increase quantity if item already in cart', async () => {
    await api(app)
      .put(`/cart/buy/${testProductId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ quantity: 1 });
    
    const response = await api(app)
      .put(`/cart/buy/${testProductId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ quantity: 2 });
    
    expect(response.status).toBe(200);
  });
});
