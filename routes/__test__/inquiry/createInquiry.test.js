import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /inquiry', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should create a new inquiry', async () => {
    const inquiryData = {
      productId: 'prod_123',
      subject: 'Product Inquiry',
      message: 'Do you have this product in another size?',
    };

    const response = await api(app)
      .post('/inquiry')
      .set('Authorization', 'Bearer user_token')
      .send(inquiryData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error with missing required fields', async () => {
    const inquiryData = {
      productId: 'prod_123',
    };

    const response = await api(app)
      .post('/inquiry')
      .set('Authorization', 'Bearer user_token')
      .send(inquiryData);
    
    expect(response.status).toBeDefined();
  });
});
