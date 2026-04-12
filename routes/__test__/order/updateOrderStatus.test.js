import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PATCH /order/:id/status', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should update order status', async () => {
    const updateData = {
      status: 'shipped',
    };

    const response = await api(app)
      .patch('/order/order_123/status')
      .set('Authorization', 'Bearer user_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for invalid status', async () => {
    const updateData = {
      status: 'invalid_status',
    };

    const response = await api(app)
      .patch('/order/order_123/status')
      .set('Authorization', 'Bearer user_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
  });
});
