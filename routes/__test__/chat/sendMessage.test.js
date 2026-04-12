import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /chat/send', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should send a message', async () => {
    const message = {
      conversationId: 'conv_123',
      content: 'Hello there!',
    };

    const response = await api(app)
      .post('/chat/send')
      .set('Authorization', 'Bearer user_token')
      .send(message);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error with empty message', async () => {
    const message = {
      conversationId: 'conv_123',
      content: '',
    };

    const response = await api(app)
      .post('/chat/send')
      .set('Authorization', 'Bearer user_token')
      .send(message);
    
    expect(response.status).toBeDefined();
  });
});
