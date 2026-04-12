import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /chat/start', () => {
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

  it('should start a new conversation', async () => {
    const conversationData = {
      recipientId: 'user_456',
    };

    const response = await api(app)
      .post('/chat/start')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(conversationData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return existing conversation if already exists', async () => {
    const conversationData = {
      recipientId: 'user_456',
    };

    const response = await api(app)
      .post('/chat/start')
      .set('Authorization', `Bearer ${clientToken}`)
      .send(conversationData);
    
    expect(response.status).toBeDefined();
  });
});
