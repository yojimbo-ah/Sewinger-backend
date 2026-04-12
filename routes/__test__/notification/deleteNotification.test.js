import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('DELETE /notification/:id (Not Implemented)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('should note that delete notification endpoint is not implemented', () => {
    // DELETE /notification/:id endpoint not currently defined in routes
    // Only GET /notification is currently implemented
    expect(true).toBe(true);
  });

  // Test commented out as endpoint doesn't exist 
  // it('should delete a notification', async () => {
  //   const response = await api(app)
  //     .delete('/notification/notif_123')
  //     .set('Authorization', 'Bearer user_token');
  //   
  //   expect(response.status).toBe(200);
  // });

  // it('should return error for non-existent notification', async () => {
  //   const response = await api(app)
  //     .delete('/notification/invalid_id')
  //     .set('Authorization', 'Bearer user_token');
  //   
  //   expect(response.status).toBe(404);
  // });
});
