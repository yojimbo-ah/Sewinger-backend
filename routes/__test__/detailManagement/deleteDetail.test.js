import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('DELETE /detail/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should delete item details', async () => {
    const response = await api(app)
      .delete('/detail/item_123')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error for non-existent item', async () => {
    const response = await api(app)
      .delete('/detail/invalid_id')
      .set('Authorization', 'Bearer user_token');
    
    expect(response.status).toBeDefined();
  });
});
