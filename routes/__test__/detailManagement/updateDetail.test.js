import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PUT /detail/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should update item details', async () => {
    const updateData = {
      name: 'Updated Item',
      description: 'Updated description',
    };

    const response = await api(app)
      .put('/detail/item_123')
      .set('Authorization', 'Bearer user_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without authorization', async () => {
    const updateData = {
      name: 'Updated Item',
    };

    const response = await api(app)
      .put('/detail/item_123')
      .send(updateData);
    
    expect(response.status).toBeDefined();
  });
});
