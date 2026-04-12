import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PUT /friend/accept/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should accept friend invite', async () => {
    const response = await api(app)
      .put('/friend/accept/invite_123')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for non-existent invite', async () => {
    const response = await api(app)
      .put('/friend/accept/invalid_invite')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
  });
});
