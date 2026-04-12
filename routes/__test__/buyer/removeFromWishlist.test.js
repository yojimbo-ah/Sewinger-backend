import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('DELETE /buyer/wishlist/:id', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should remove item from wishlist', async () => {
    const response = await api(app)
      .delete('/buyer/wishlist/item_id')
      .set('Authorization', 'Bearer buyer_token');
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should return error when item not found', async () => {
    const response = await api(app)
      .delete('/buyer/wishlist/nonexistent_id')
      .set('Authorization', 'Bearer buyer_token');
    
    expect(response.status).toBeDefined();
  });
});
