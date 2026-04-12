import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';

describe('DELETE /cart/delete/:productId', () => {
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
      await api(app)
        .put(`/cart/buy/${testProductId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ quantity: 1 });
    } catch (error) {
      console.warn('Error in test setup:', error.message);
    }
  });

  it('should remove item from cart', async () => {
    const response = await api(app)
      .delete(`/cart/delete/${testProductId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('removed');
  });

  it('should return error when item not in cart', async () => {
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
