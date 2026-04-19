export * from './services';
export * from './utils/array';
export * from './utils/brand';
export * from './utils/browser';
export * from './utils/cfd';

// Export from config but exclude OAUTH_CLIENT_ID to avoid conflict with login
export {
    livechat_license_id,
    livechat_client_id,
    OAUTH_AUTH_URL,
    OAUTH_TOKEN_URL,
    API_BASE_URL,
    WEBSOCKET_PUBLIC_URL,
    WEBSOCKET_DEMO_URL,
    WEBSOCKET_REAL_URL,
    domain_app_ids,
    platform_app_ids,
    getCurrentProductionDomain,
    isProduction,
    isTestLink,
    isLocal,
    generatePKCE,
    redirectToOAuthLogin,
    redirectToOAuthSignup,
    exchangeCodeForToken,
    getWebSocketOTP,
    getAuthenticatedWebSocketURL,
    getAccessToken,
    isAuthenticated,
    logout,
    getAppId,
    getSocketURL,
    checkAndSetEndpointFromUrl,
    getDebugServiceWorker,
    handleOAuthCallback,
} from './utils/config';

export * from './utils/constants';
export * from './utils/contract';
export * from './utils/currency';
export * from './utils/dom';
export * from './utils/date';
export * from './utils/digital-options';
export * from './utils/files';
export * from './utils/helpers';
export * from './utils/hooks';
export * from './utils/loader';
export * from './utils/loader-handler';
export * from './utils/location';

// Export from login (including OAUTH_CLIENT_ID)
export {
    redirectToLogin,
    redirectToSignUp,
    loginUrl,
    signupUrl,
    handleOAuthRedirect,
    getStoredRedirectUrl,
    clearOAuthSession,
    OAUTH_CLIENT_ID,
} from './utils/login';

export * from './utils/number';
export * from './utils/object';
export * from './utils/os';
export * from './utils/promise';
export * from './utils/platform';
export * from './utils/route';
export * from './utils/routes';
export * from './utils/screen';
export * from './utils/shortcode';
export * from './utils/storage';
export * from './utils/string';
export * from './utils/url';
export * from './utils/validation';
export * from './utils/validator';
export * from './services';
export * from './utils/helpers';
export * from './utils/constants';
export * from './utils/loader-handler';
export * from './utils/types';
export * from './helpers';
export { default as cacheTrackEvents } from './utils/analytics/analytics';

// Complete platforms object with all required properties
export const default_title = 'Deriv';

export const platforms = {
    deriv: 'deriv',
    binary: 'binary',
    dtrader: 'dtrader',
    dbot: 'dbot',
    derivgo: 'derivgo',
    smarttrader: 'smarttrader',
    tradershub_os: {
        url: 'https://deriv.com/tradershub', // Update with actual URL
    },
    p2p_v2: {
        url: 'https://deriv.com/p2p', // Update with actual URL
    },
};