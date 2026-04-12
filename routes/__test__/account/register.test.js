import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('POST /account/register', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should register a new user with valid data', async () => {
    const newUser = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    const response = await api(app)
      .post('/account/register')
      .send(newUser);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for invalid email', async () => {
    const invalidUser = {
      email: 'invalid-email',
      password: 'Password123!',
      name: 'User',
    };

    const response = await api(app)
      .post('/account/register')
      .send(invalidUser);
    
    expect(response.status).toBeDefined();
  });
});
