
/**
 * Helper class to retrieve a subscription token from Exoquic from your backend.
 */
export class ExoquicSubscriptionAuthorizer {
	/**
	 * @param {string} apiKey API key for the exoquic server
	 * @param {string} [serverUrl] for the exoquic server. Defaults to https://auth.dev.exoquic.com
	 */
	constructor(apiKey, { serverUrl = "https://dev.exoquic.com" }) {
		this.apiKey = apiKey;
		this.serverUrl = serverUrl;
	}

	/**
	 * Retrieve a subscription token from Exoquic
	 * @param {object} options
	 * @param {string} options.topic Topic to authorize
	 * @param {string} [options.channel] Channel to authorize
	 * @param {string} [options.subscriptionId] Subscription ID to authorize
	 */
	async authorize({ topic, channel, subscriptionId }) {
		const response = await fetch(`${this.serverUrl}/v1/authorize`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
			},
			body: JSON.stringify({
				topic,
				channel,
				subscriptionId,
			}),
		});

		const content = await response.json();
		return content.accessToken;
	}
}
