
let exoquicAuth;

const defaultEnvironment = process.env.EXOQUIC_ENV_CONTEXT || "dev";

/**
 * Initialize the subscription authorizer with your API key. This should be called once in your application.
 * Allows you to use the `authorizeSubscription` function to authorize end-user subscription requests.
 * 
 * @param {object} options
 * @param {string} options.apiKey API key for the exoquic server
 * @param {string} [options.serverUrl] for the exoquic server. Defaults to https://dev.exoquic.com if the env EXOQUIC_ENV_CONTEXT is not set
 */
export function initSubscriptionAuthorizer({ apiKey, serverUrl = `https://${defaultEnvironment}.exoquic.com` }) {
	exoquicAuth = new ExoquicSubscriptionAuthorizer(apiKey, { serverUrl });
}

/** 
 * The end-user is required to have an authorized subscription to establish a connection to Exoquic and receive messages.
 * This function returns a signed JWT retrieved from Exoquic, containing the topic, channel and subscriptionId as payload
 * specified in the function's parameters. This JWT is the authorized subscription token that should be returned to the end-user.
 * 
 * Before you call this function, you should have called `initSubscriptionAuthorizer` with your API key.
 * 
 * @example
 * <pre><code>
 * initSubscriptionAuthorizer({ apiKey: "my-api-key" });
 * 
 * const token = await authorizeSubscription({ topic: "my-topic", channel: "my-channel", subscriptionId: "my-subscription-id" });
 * 
 * const expressApp = express();
 * expressApp.post("/authorize-subscriptions", async (req, res) => {
 *   if (isUserAllowedToSubscribeToTopic(req.session.userId, req.body.topic)) {
 *     const token = await authorizeSubscription({ topic: req.body.topic });
 *     res.send({ token });
 *   } else {
 *     res.status(403).send({ error: "User is not allowed to subscribe to this topic" });
 *   }
 * });
 * </code></pre>
 * 
 * @param {object} options
 * @param {string} options.topic Topic to authorize
 * @param {string} [options.channel] Channel to authorize
 * @param {string} [options.subscriptionId] Subscription ID to authorize
 * 
 * @returns {Promise<string>} Subscription token (Access token for the subscription).
 */
export function authorizeSubscription({ topic, channel, subscriptionId }) {
	return exoquicAuth.authorize({ topic, channel, subscriptionId });
}

/**
 * Helper class to retrieve a subscription token from Exoquic from your backend.
 */
export class ExoquicSubscriptionAuthorizer {
	/**
	 * @param {string} apiKey API key for the exoquic server
	 * @param {string} [serverUrl] for the exoquic server. Defaults to https://auth.dev.exoquic.com
	 */
	constructor(apiKey, { serverUrl = `https://${defaultEnvironment}.exoquic.com` }) {
		this.apiKey = apiKey;
		this.serverUrl = serverUrl;
	}

	/**
	 * Retrieve a subscription token from Exoquic. This token should be returned to the end-user.
	 * 
	 * @param {object} options
	 * @param {string} options.topic Topic to authorize
	 * @param {string} [options.channel] Channel to authorize
	 * @param {string} [options.subscriptionId] Subscription ID to authorize
	 * 
	 * @throws {ExoquicError} If the response from Exoquic is not ok
	 * 
	 * @returns {Promise<string>} Subscription token (Access token for the subscription).
	 */
	async authorize({ topic, channel, subscriptionId }) {
		try {
			const response = await fetch(`${this.serverUrl}/authorize-subscription`, {
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

			const content = await response.text();
			if (!response.ok) {
				throw new ExoquicError(`Failed to authorize subscription: ${content}`, response.status);
			}

			return content;
	
		} catch (error) {
			if (error instanceof ExoquicError) {
				throw error;
			}

			throw new ExoquicError(`Failed to authorize subscription: ${error.message}`, 500);
		}
	}
}

/**
 * Error class for Exoquic errors
 */
class ExoquicError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
	}
}
