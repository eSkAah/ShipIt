export const BlobServiceClient = {
  fromConnectionString: jest.fn(() => ({
    getContainerClient: jest.fn(() => mockContainerClient),
  })),
};

const mockBlockBlobClient = {
  url: 'https://storage.azure.com/avatars/mock-blob.jpg',
  uploadData: jest.fn().mockResolvedValue({}),
  deleteIfExists: jest.fn().mockResolvedValue({}),
};

const mockContainerClient = {
  getBlockBlobClient: jest.fn(() => mockBlockBlobClient),
};

export const ContainerClient = jest.fn(() => mockContainerClient);
