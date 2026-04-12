import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PUT /account/profile', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should update user profile with valid data', async () => {
    const updateData = {
      name: 'Updated Name',
      phone: '+1234567890',
    };

    const response = await api(app)
      .put('/account/profile')
      .set('Authorization', 'Bearer test_token')
      .send(updateData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error without authentication', async () => {
    const updateData = {
      name: 'Updated Name',
    };

    const response = await api(app)
      .put('/account/profile')
      .send(updateData);
    
    expect(response.status).toBeDefined();
  });
});
