// Mock Cloudinary service for testing
// we use this function in place of the normal logic cloudinary gavesus
// they make the app think that we are rutring the real object cloudinary
// returns when we upload a image or file
const mockCloudinary = {
  uploader: {
    upload: jest.fn().mockResolvedValue({
      public_id: 'test-public-id-123',
      secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
      url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
    }),
    upload_stream: jest.fn().mockImplementation((options, callback) => {
      // Simulate stream response
      callback(null, {
        public_id: 'test-public-id-stream-123',
        secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
        url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
      });
      return {
        on: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };
    }),
    destroy: jest.fn().mockResolvedValue({
      result: 'ok',
    }),
  },
  config: jest.fn(),
};

export default mockCloudinary;
