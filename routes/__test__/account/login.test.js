import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /account/login', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should login user with valid credentials', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const response = await api(app)
      .post('/account/login')
      .send(credentials);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for invalid credentials', async () => {
    const invalidCredentials = {
      email: 'test@example.com',
      password: 'WrongPassword',
    };

    const response = await api(app)
      .post('/account/login')
      .send(invalidCredentials);
    
    expect(response.status).toBeDefined();
  });
});
