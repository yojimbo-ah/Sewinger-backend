// Mock Resend service for testing
export const mockSend = jest.fn().mockResolvedValue({
  id: 'test-email-id-123',
  from: 'noreply@test.com',
  to: 'test@example.com',
  created_at: new Date().toISOString(),
});

const mockResend = {
  emails: {
    send: mockSend,
  },
};

export default mockResend;
