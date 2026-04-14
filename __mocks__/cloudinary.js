// Mock Cloudinary service for testing
// just some setup for the cloudaniry mock function
// for more details on why we do that , check the jest 
// package in npm or the documentation (in short hand 
// a fake function that our testing files will think
// it the real api of cloudinary)

export const mockUpload = jest.fn().mockResolvedValue({
  public_id: 'test-public-id-123',
  secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
  url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-123.jpg',
});

export const mockUploadStream = jest.fn().mockImplementation((options, callback) => {
  callback(null, {
    public_id: 'test-public-id-stream-123',
    secure_url: 'https://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
    url: 'http://res.cloudinary.com/test/image/upload/v1234/test-public-id-stream-123.jpg',
  });
  return {
    on: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
});

export const mockDestroy = jest.fn().mockResolvedValue({
  result: 'ok',
});

const mockCloudinary = {
  uploader: {
    upload: mockUpload,
    upload_stream: mockUploadStream,
    destroy: mockDestroy,
  },
  config: jest.fn(),
};

export default mockCloudinary;
