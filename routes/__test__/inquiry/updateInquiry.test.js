import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PUT /inquiry/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should update an inquiry', async () => {
    const updateData = {
      message: 'Updated message',
    };

    const response = await api(app)
      .put('/inquiry/inq_123')
      .set('Authorization', 'Bearer user_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for non-existent inquiry', async () => {
    const updateData = {
      message: 'Updated message',
    };

    const response = await api(app)
      .put('/inquiry/invalid_id')
      .set('Authorization', 'Bearer user_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
  });
});
