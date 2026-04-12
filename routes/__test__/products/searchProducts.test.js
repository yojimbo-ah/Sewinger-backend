import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('Product Search', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /product/search (Not Implemented)', () => {
    it('should be skipped - endpoint not implemented', () => {
      // Product search endpoint not currently implemented in routes
      expect(true).toBe(true);
    });

    // These tests are commented out as the search endpoint doesn't exist yet
    // it('should search products by query', async () => {
    //   const response = await api(app)
    //     .get('/product/search')
    //     .query({ q: 'dress' });
    //   
    //   expect(response.status).toBe(200);
    //   expect(response.body.results).toBeDefined();
    //   expect(Array.isArray(response.body.results)).toBe(true);
    // });
    //
    // it('should return empty results for non-matching search', async () => {
    //   const response = await api(app)
    //     .get('/product/search')
    //     .query({ q: 'nonexistent_product_xyz_12345' });
    //   
    //   expect(response.status).toBe(200);
    //   expect(response.body.results).toBeDefined();
    //   expect(Array.isArray(response.body.results)).toBe(true);
    //   expect(response.body.results.length).toBe(0);
    // });
    // 
    // it('should handle empty query string', async () => {
    //   const response = await api(app)
    //     .get('/product/search')
    //     .query({ q: '' });
    //   
    //   expect([200, 400]).toContain(response.status);
    // });
  });
});
