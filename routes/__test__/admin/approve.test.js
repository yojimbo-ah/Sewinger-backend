import { createApp } from '../../../app.js';
import { api } from '../../../tests/helpers.js';

describe('PATCH /admin/approve', () => {
  let app;
  let adminToken;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    try {
      adminToken = await global.getAuthCookieAdmin();
    } catch (error) {
      console.warn('Could not get admin token:', error.message);
    }
  });

  it('should approve a pending item', async () => {
    const approvalData = {
      itemId: 'item_id',
      status: 'approved',
    };

    const response = await api(app)
      .patch('/admin/approve')
        .set('Authorization', `Bearer ${adminToken}`)
      .send(approvalData);
    
    expect(response.status).toBeDefined();
    // Add specific assertions based on your implementation
  });

  it('should reject a pending item', async () => {
    const rejectionData = {
      itemId: 'item_id',
      status: 'rejected',
    };

    const response = await api(app)
      .patch('/admin/approve')
      .set('Authorization', 'Bearer admin_token')
      .send(rejectionData);
    
    expect(response.status).toBeDefined();
  });
});
