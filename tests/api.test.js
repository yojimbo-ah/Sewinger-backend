import { createApp } from '../app.js';
import { api } from './helpers.js';

describe('API Health Check', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /product/normal', () => {
    it('should retrieve all products', async () => {
      const response = await api(app)
        .get('/product/normal')
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should have CORS headers configured', async () => {
      const response = await api(app)
        .options('/product/normal')
        .set('Origin', 'http://localhost:5173')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
  });
});
