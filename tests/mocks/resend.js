// Mock Resend service for testing
// we use this in place of the real resend library
// because it returns a fake object that stimulate the real library
const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({
      id: 'test-email-id-123',
      from: 'noreply@test.com',
      to: 'test@example.com',
      created_at: new Date().toISOString(),
    }),
  },
};

export default mockResend;
