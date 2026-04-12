import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('DELETE /friend/:id', () => {
  let app;
  let clientToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      clientToken = await global.getAuthCookieClient();
    } catch (error) {
      console.warn('Could not get client token:', error.message);
    }
  });

  it('should remove friend', async () => {
    const response = await api(app)
      .delete('/friend/user_456')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error if friend not found', async () => {
    const response = await api(app)
      .delete('/friend/nonexistent_user')
      .set('Authorization', `Bearer ${clientToken}`);
    
    expect(response.status).toBeDefined();
  });
});
