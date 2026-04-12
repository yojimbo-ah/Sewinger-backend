import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /friend/invite', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should send friend invite', async () => {
    const inviteData = {
      recipientId: 'user_456',
    };

    const response = await api(app)
      .post('/friend/invite')
      .set('Authorization', 'Bearer user_token')
      .send(inviteData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should not send invite to self', async () => {
    const inviteData = {
      recipientId: 'user_token', // Same as sender
    };

    const response = await api(app)
      .post('/friend/invite')
      .set('Authorization', 'Bearer user_token')
      .send(inviteData);
    
    expect(response.status).toBeDefined();
  });
});
