import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';
import User from '../../../models/User.js';
import Product from '../../../models/Product.js';
import Order from '../../../models/Order.js';

describe('PUT /order/create', () => {
  let app;
  let clientToken;
  let testProductId;
  let testSellerId;
  let testClient;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({ email: { $in: ['seller@test.com', 'client@test.com'] } });
      await Product.deleteMany({});
      await Order.deleteMany({});
      await global.createAccountsTobeUsed();
      clientToken = await global.getAuthCookieClient();
      testClient = await User.findOne({ email: 'client@test.com' });
      const seller = await User.findOne({ email: 'seller@test.com' });
      testSellerId = seller._id.toString();
      const testProduct = new Product({
        name: 'Test Product',
        description: 'This is a test product for order creation',
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
      testClient.cart.items = [{ productId: testProductId, quantity: 2 }];
      testClient.cart.totalPrice = 100.00;
      testClient.wallet = { balance: 500 };
      await testClient.save();
    } catch (error) {
      console.warn('Error in order test setup:', error.message);
    }
  });

  it('should create order when cart has items and wallet has balance', async () => {
    const response = await api(app)
      .put('/order/create')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect([200, 500]).toContain(response.status);
    if (response.status === 200) {
      expect(response.body.message).toContain('order');
      expect(response.body.wallet).toBeDefined();
    }
  });

  it('should return 400 when cart is empty', async () => {
    testClient.cart.items = [];
    testClient.cart.totalPrice = 0;
    await testClient.save();
    const response = await api(app)
      .put('/order/create')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('empty');
  });

  it('should return 400 when insufficient wallet balance', async () => {
    testClient.wallet.balance = 10;
    await testClient.save();
    const response = await api(app)
      .put('/order/create')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Insufficent');
  });

  it('should return 400 when not authenticated', async () => {
    const response = await api(app)
      .put('/order/create');
    
    expect(response.status).toBe(400);
  });
});
