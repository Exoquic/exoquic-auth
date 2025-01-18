/**
 * Options for initializing the subscription authorizer
 */
export interface InitSubscriptionAuthorizerOptions {
    /** API key for the exoquic server */
    apiKey: string;

    /** Environment to use. Defaults to "dev" */
    env?: string;
    
		/** URL for the exoquic server. Defaults to https://dev.exoquic.com */
    serverUrl?: string;
}

/**
 * Options for authorizing a subscription
 */
export interface AuthorizeSubscriptionOptions {
    /** Topic to authorize */
    topic: string;

    /** Channel to authorize */
    channel?: string;
    
		/** Subscription ID to authorize */
    subscriptionId?: string;
    
		/** Reset the subscriber from either 'earliest' or 'latest' event if the supplied subscriptionId is not found. Defaults to 'earliest' */
    resetFrom?: 'earliest' | 'latest';
    
		/** The expiration date of the subscription token. Defaults to 2 minutes from now in unix timestamp (seconds since epoch) */
    expiresAt?: number;
}

/**
 * Initialize the subscription authorizer with your API key. This should be called once in your application.
 * Allows you to use the `authorizeSubscription` function to authorize end-user subscription requests.
 */
export function initSubscriptionAuthorizer(options: InitSubscriptionAuthorizerOptions): void;

/**
 * The end-user is required to have an authorized subscription to establish a connection to Exoquic and receive messages.
 * This function returns a signed JWT retrieved from Exoquic, containing the topic, channel and subscriptionId as payload
 * specified in the function's parameters. This JWT is the authorized subscription token that should be returned to the end-user.
 * 
 * Before you call this function, you should have called `initSubscriptionAuthorizer` with your API key.
 */
export function authorizeSubscription(options: AuthorizeSubscriptionOptions): Promise<string>;

/**
 * Helper class to retrieve a subscription token from Exoquic from your backend.
 */
export class ExoquicSubscriptionAuthorizer {
    constructor(apiKey: string, options: { serverUrl?: string });
    authorize(options: AuthorizeSubscriptionOptions): Promise<string>;
}

/**
 * Error class for Exoquic errors
 */
export class ExoquicError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number);
}
