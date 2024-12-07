import { initalizeSubscriptionAuthorizer, authorizeSubscription, ExoquicSubscriptionAuthorizer } from "../src/index";

global.fetch = jest.fn();

describe('ExoquicSubscriptionAuthorizer', () => {
  const mockApiKey = 'test-api-key';
  const mockServerUrl = 'https://test.exoquic.com';
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset fetch mock
    fetch.mockReset();
  });

  describe('constructor', () => {
    it('should initialize with default server URL when not provided', () => {
      const authorizer = new ExoquicSubscriptionAuthorizer(mockApiKey, {});
      expect(authorizer.apiKey).toBe(mockApiKey);
      expect(authorizer.serverUrl).toMatch(/https:\/\/dev\.exoquic\.com/);
    });

    it('should initialize with custom server URL when provided', () => {
      const authorizer = new ExoquicSubscriptionAuthorizer(mockApiKey, { serverUrl: mockServerUrl });
      expect(authorizer.apiKey).toBe(mockApiKey);
      expect(authorizer.serverUrl).toBe(mockServerUrl);
    });
  });

  describe('authorize', () => {
    const mockTopic = 'test-topic';
    const mockChannel = 'test-channel';
    const mockSubscriptionId = 'test-sub-id';
    const mockAccessToken = 'test-access-token';

    it('should successfully authorize a subscription with all parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ accessToken: mockAccessToken }),
      });

      const authorizer = new ExoquicSubscriptionAuthorizer(mockApiKey, { serverUrl: mockServerUrl });
      const result = await authorizer.authorize({
        topic: mockTopic,
        channel: mockChannel,
        subscriptionId: mockSubscriptionId,
      });

      expect(result).toBe(mockAccessToken);
      expect(fetch).toHaveBeenCalledWith(
        `${mockServerUrl}/v1/authorize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': mockApiKey,
          },
          body: JSON.stringify({
            topic: mockTopic,
            channel: mockChannel,
            subscriptionId: mockSubscriptionId,
          }),
        }
      );
    });

    it('should handle failed authorization requests', async () => {
      const errorMessage = 'Invalid API key';
      fetch.mockResolvedValueOnce({
        ok: false,
        statusText: errorMessage,
        status: 401,
      });

      const authorizer = new ExoquicSubscriptionAuthorizer(mockApiKey, { serverUrl: mockServerUrl });
      
      await expect(authorizer.authorize({ topic: mockTopic }))
        .rejects
        .toThrow(`Failed to authorize subscription: ${errorMessage}`);
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const authorizer = new ExoquicSubscriptionAuthorizer(mockApiKey, { serverUrl: mockServerUrl });
      
      await expect(authorizer.authorize({ topic: mockTopic }))
        .rejects
        .toThrow('Failed to authorize subscription: Network error');
    });
  });
});

describe('Global functions', () => {
  it('should initialize subscription authorizer globally', () => {
    initalizeSubscriptionAuthorizer({ apiKey: "mock-api-key" });
    
    // Verify that authorizeSubscription works after initialization
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    });

    return expect(authorizeSubscription({ topic: 'test-topic' }))
      .resolves
      .toBe('test-token');
  });
});