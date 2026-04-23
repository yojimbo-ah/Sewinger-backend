// Mock Cloudinary service for testing
// Simple mock functions that work with Jest's manual mocking

// Mock upload function
const mockUpload = async () => ({
  public_id: 'test-public-id-123',
  secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
  url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
});

// Mock upload_stream function
const mockUploadStream = (options, callback) => {
  callback(null, {
    public_id: 'test-public-id-stream-123',
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
    url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
  });
  return {
    on: () => ({ on: () => {}, end: () => {} }),
    end: () => {},
  };
};

// Mock destroy function
const mockDestroy = async () => ({
  result: 'ok',
});

const mockCloudinary = {
  uploader: {
    upload: mockUpload,
    upload_stream: mockUploadStream,
    destroy: mockDestroy,
  },
  config: () => {},
};

// Named exports for v2 api
export const v2 = mockCloudinary;

export default mockCloudinary;
