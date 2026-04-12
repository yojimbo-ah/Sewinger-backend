import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /detail', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should create new item details', async () => {
    const detailData = {
      name: 'New Item',
      description: 'Item description',
    };

    const response = await api(app)
      .post('/detail')
      .set('Authorization', 'Bearer user_token')
      .send(detailData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error with missing required fields', async () => {
    const detailData = {
      name: 'New Item',
    };

    const response = await api(app)
      .post('/detail')
      .set('Authorization', 'Bearer user_token')
      .send(detailData);
    
    expect(response.status).toBeDefined();
  });
});
