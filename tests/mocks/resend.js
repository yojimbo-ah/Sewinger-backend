// Mock Resend service for testing
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
