import { isBot } from '../platform';
import { isStaging } from '../url/helpers';
import { WebSocketUtils, LocalStorageConstants, LocalStorageUtils, URLUtils } from '@deriv-com/utils';

/*
 * Configuration values needed in js codes
 *
 * NOTE:
 * Please use the following command to avoid accidentally committing personal changes
 * git update-index --assume-unchanged packages/shared/src/utils/config.js
 *
 */

export const APP_IDS = {
    LOCALHOST: 36300,
    TMP_STAGING: 64584,
    STAGING: 29934,
    STAGING_BE: 29934,
    STAGING_ME: 29934,
    PRODUCTION: 133540,
    PRODUCTION_BE: 133540,
    PRODUCTION_ME: 133540,
};

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

// OAuth/OIDC redirect configuration (production domain)
export const AUTH_REDIRECT_BASE_URL = 'https://tate-puce.vercel.app'; // Change this to your production domain if different
export const AUTH_CALLBACK_URL = `${AUTH_REDIRECT_BASE_URL}/callback`;

// V2 OAuth (PKCE) client id
export const V2_OAUTH_CLIENT_ID = '337lEL2XCvc88a0bc7rRX';

export const domain_app_ids = {
    'smarttraderstool.com': 133540,
    'deriv.app': 133540,
    'app.deriv.com': 133540,
    'staging-app.deriv.com': 133540,
    'app.deriv.me': 133540,
    'staging-app.deriv.me': 133540,
    'app.deriv.be': 133540,
    'staging-app.deriv.be': 133540,
    'binary.com': 133540,
    'test-app.deriv.com': 133540,
    'royal-app-seven.vercel.app': 133540,
    'star-eight-ruby.vercel.app': 133540,
    'beleiver.vercel.app': 133540,
    'goon-puce.vercel.app': 133540,
};

export const platform_app_ids = {
    derivgo: 133540,
};

export const getCurrentProductionDomain = () => {
    // If it's staging, return null to use staging app ID
    if (/^staging\./.test(window.location.hostname)) {
        return null;
    }

    // Check if domain is explicitly configured
    const exactMatch = Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);
    if (exactMatch) {
        return exactMatch;
    }

    // For any other production domain, return the hostname to use production app ID
    return window.location.hostname;
};

export const isProduction = () => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = () => {
    return (
        window.location.origin?.includes('.binary.sx') ||
        window.location.origin?.includes('bot-65f.pages.dev') ||
        isLocal()
    );
};

export const isLocal = () => /localhost(:\d+)?$/i.test(window.location.hostname);

const getDefaultServerURL = () => {
    const server = 'ws';
    const server_url = `${server}.derivws.com`;
    return server_url;
};

export const getDefaultAppIdAndUrl = () => {
    const server_url = getDefaultServerURL();

    if (isTestLink()) {
        return { app_id: APP_IDS.LOCALHOST, server_url };
    }

    const current_domain = getCurrentProductionDomain() ?? '';
    const app_id = domain_app_ids[current_domain] ?? APP_IDS.PRODUCTION;

    return { app_id, server_url };
};

// App ID for all users
const DEFAULT_APP_ID = 133540;

/**
 * Determine which app ID to use
 */
const determineAppId = async (): Promise<number> => {
    const appId = DEFAULT_APP_ID;

    // Store the app ID
    sessionStorage.setItem('current_app_id_for_session', appId.toString());
    window.localStorage.setItem('config.app_id', appId.toString());
    
    return appId;
};

// Track if we've already determined app ID in this page load
let appIdDeterminationInProgress = false;
let determinedAppId: number | null = null;
let ipCheckInterval: NodeJS.Timeout | null = null;

/**
 * Check and correct app ID - ensures consistent app ID across all storage locations
 */
const checkAndCorrectAppId = async (): Promise<void> => {
    try {
        const correctAppId = DEFAULT_APP_ID;
        
        // Check ALL possible locations where app ID might be cached
        const appIdLocations = [
            { storage: window.localStorage, key: 'config.app_id', name: 'localStorage config.app_id' },
            { storage: window.localStorage, key: 'APP_ID', name: 'localStorage APP_ID' },
            { storage: window.sessionStorage, key: 'current_app_id_for_session', name: 'sessionStorage current_app_id_for_session' },
            { storage: window.sessionStorage, key: 'app_id', name: 'sessionStorage app_id' },
        ];
        
        let foundMismatch = false;
        
        // Check each location and replace if different
        for (const location of appIdLocations) {
            try {
                const cachedAppId = location.storage.getItem(location.key);
                if (cachedAppId) {
                    const cachedAppIdNum = parseInt(cachedAppId, 10);
                    if (!isNaN(cachedAppIdNum) && cachedAppIdNum !== correctAppId) {
                        location.storage.setItem(location.key, correctAppId.toString());
                        console.log(`[App ID Check] 🔄 Replaced cached app ID in ${location.name}: ${cachedAppIdNum} → ${correctAppId}`);
                        foundMismatch = true;
                    }
                } else {
                    if (location.key === 'config.app_id') {
                        location.storage.setItem(location.key, correctAppId.toString());
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (foundMismatch || !sessionStorage.getItem('current_app_id_for_session')) {
            sessionStorage.setItem('current_app_id_for_session', correctAppId.toString());
        }
    } catch (error) {
        console.error('[App ID Check] Error checking app ID:', error);
    }
};

/**
 * Start continuous app ID checking while website is running
 */
const startContinuousAppIdCheck = () => {
    if (ipCheckInterval) {
        clearInterval(ipCheckInterval);
    }
    
    // Check and correct app ID every 30 seconds
    ipCheckInterval = setInterval(() => {
        void checkAndCorrectAppId();
    }, 30000);
};

// Force update app ID in localStorage on app initialization
export const forceUpdateAppId = async () => {
    if (appIdDeterminationInProgress) {
        while (appIdDeterminationInProgress) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        if (determinedAppId !== null) {
            window.localStorage.setItem('config.app_id', determinedAppId.toString());
            return determinedAppId;
        }
    }
    
    appIdDeterminationInProgress = true;
    try {
        const app_id = await determineAppId();
        determinedAppId = app_id;
        window.localStorage.setItem('config.app_id', app_id.toString());
        sessionStorage.setItem('current_app_id_for_session', app_id.toString());
        
        if (typeof window !== 'undefined') {
            startContinuousAppIdCheck();
        }
        
        return app_id;
    } finally {
        appIdDeterminationInProgress = false;
    }
};

/**
 * @deprecated Please use 'WebSocketUtils.getAppId' from '@deriv-com/utils' instead of this.
 */
export const getAppId = () => {
    let app_id = null;
    const user_app_id = '133540';
    const config_app_id = window.localStorage.getItem('config.app_id');
    const current_domain = getCurrentProductionDomain() || '';
    window.localStorage.removeItem('config.platform');
    const platform = window.sessionStorage.getItem('config.platform');
    const is_bot = isBot();

    if (platform && platform_app_ids[platform]) {
        app_id = platform_app_ids[platform];
    } else if (config_app_id) {
        app_id = config_app_id;
    } else if (user_app_id.length) {
        window.localStorage.setItem('config.default_app_id', user_app_id);
        app_id = user_app_id;
    } else if (isStaging()) {
        window.localStorage.removeItem('config.default_app_id');
        app_id = is_bot ? 133540 : domain_app_ids[current_domain] || 133540;
    } else if (/localhost/i.test(window.location.hostname)) {
        app_id = 133540;
    } else {
        window.localStorage.removeItem('config.default_app_id');
        app_id = is_bot ? 133540 : domain_app_ids[current_domain] || 133540;
    }

    // Always force update localStorage with the current app ID
    window.localStorage.setItem('config.app_id', app_id.toString());
    sessionStorage.setItem('current_app_id_for_session', app_id.toString());

    return app_id;
};

// ✅ UPDATED TO USE CORRECT WEBSOCKET BASE ENDPOINT
export const getSocketURL = () => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    // Only return the host, not the full URL
    return 'ws.derivws.com';
};

export const checkAndSetEndpointFromUrl = () => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            url_params.delete('qa_server');
            url_params.delete('app_id');

            // Only set valid WebSocket URL
            if (/^(^(www\.)?qa[0-9]{1,4}\.deriv\.dev|(.*)\.derivws\.com)$/.test(qa_server) && /^[0-9]+$/.test(app_id)) {
                localStorage.setItem('config.app_id', app_id);
                // ✅ ONLY set host, NOT full URL
                localStorage.setItem('config.server_url', `wss://${qa_server}/websockets/v3?app_id=${app_id}`);
            }

            const params = url_params.toString();
            const hash = location.hash;

            location.href = `${location.protocol}//${location.hostname}${location.pathname}${params ? `?${params}` : ''}${hash || ''}`;
            return true;
        }
    }

    return false;
};

export const getDebugServiceWorker = () => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);
    return false;
};

// --- V2 OAuth (PKCE) helpers ---
const OAUTH_CODE_VERIFIER_KEY = 'oauth_code_verifier';
const OAUTH_CODE_VERIFIER_TIMESTAMP_KEY = 'oauth_code_verifier_timestamp';
const OAUTH_CLIENT_ID_KEY = 'oauth_client_id';
const OAUTH_REDIRECT_URI_KEY = 'oauth_redirect_uri';
const OAUTH_CSRF_STATE_KEY = 'oauth_csrf_state';
const OAUTH_CSRF_STATE_TIMESTAMP_KEY = 'oauth_csrf_state_timestamp';
const OAUTH_EXPIRY_MS = 10 * 60 * 1000;

const base64UrlEncode = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const createRandomString = (length = 64) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => charset[b % charset.length]).join('');
};

const generateCodeChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(digest);
};

export const validateOAuthState = (stateFromUrl: string | null) => {
    const stored = sessionStorage.getItem(OAUTH_CSRF_STATE_KEY) || localStorage.getItem(OAUTH_CSRF_STATE_KEY);
    const tsRaw = sessionStorage.getItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY) || localStorage.getItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY);
    const ts = tsRaw ? Number(tsRaw) : 0;

    if (!stored || !stateFromUrl) return false;
    if (stored !== stateFromUrl) return false;
    if (!ts || Date.now() - ts > OAUTH_EXPIRY_MS) return false;
    return true;
};

export const clearOAuthState = () => {
    sessionStorage.removeItem(OAUTH_CSRF_STATE_KEY);
    sessionStorage.removeItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY);
    sessionStorage.removeItem(OAUTH_CODE_VERIFIER_KEY);
    sessionStorage.removeItem(OAUTH_CODE_VERIFIER_TIMESTAMP_KEY);
    sessionStorage.removeItem(OAUTH_CLIENT_ID_KEY);
    sessionStorage.removeItem(OAUTH_REDIRECT_URI_KEY);
    localStorage.removeItem(OAUTH_CSRF_STATE_KEY);
    localStorage.removeItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY);
    localStorage.removeItem(OAUTH_CODE_VERIFIER_KEY);
    localStorage.removeItem(OAUTH_CODE_VERIFIER_TIMESTAMP_KEY);
    localStorage.removeItem(OAUTH_CLIENT_ID_KEY);
    localStorage.removeItem(OAUTH_REDIRECT_URI_KEY);
};

export const generateLegacyOAuthURL = () => {
    const { getOauthURL } = URLUtils;
    const oauth_url = getOauthURL();
    const original_url = new URL(oauth_url);
    const configured_server_url = (LocalStorageUtils.getValue(LocalStorageConstants.configServerURL) ||
        localStorage.getItem('config.server_url') ||
        original_url.hostname) as string;

    const valid_server_urls = ['green.derivws.com', 'red.derivws.com', 'blue.derivws.com'];
    if (typeof configured_server_url === 'string'
        ? !valid_server_urls.includes(configured_server_url)
        : !valid_server_urls.includes(JSON.stringify(configured_server_url))
    ) {
        original_url.hostname = configured_server_url;
    }
    original_url.searchParams.set('app_id', getAppId().toString());
    return original_url.toString() || oauth_url;
};

export const generateOAuthURL = async (prompt?: string) => {
    const { getOauthURL } = URLUtils;
    const oauth_url = getOauthURL();
    const default_oauth_url = new URL(oauth_url);
    const auth_base = isStaging() ? 'https://staging-auth.deriv.com/oauth2' : 'https://auth.deriv.com/oauth2';
    const oauth_auth_url = new URL(`${auth_base}/auth`);

    const language = default_oauth_url.searchParams.get('l') || 'EN';
    const brand = default_oauth_url.searchParams.get('brand') || 'deriv';

    const oauthClientId = V2_OAUTH_CLIENT_ID;
    oauth_auth_url.searchParams.set('scope', 'trade');
    oauth_auth_url.searchParams.set('response_type', 'code');
    oauth_auth_url.searchParams.set('client_id', oauthClientId);
    oauth_auth_url.searchParams.set('redirect_uri', AUTH_CALLBACK_URL);
    oauth_auth_url.searchParams.set('l', language);
    oauth_auth_url.searchParams.set('brand', brand);
    oauth_auth_url.searchParams.set('app_id', getAppId().toString());

    const codeVerifier = createRandomString(96);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const csrfState = createRandomString(32);

    sessionStorage.setItem(OAUTH_CODE_VERIFIER_KEY, codeVerifier);
    sessionStorage.setItem(OAUTH_CODE_VERIFIER_TIMESTAMP_KEY, Date.now().toString());
    sessionStorage.setItem(OAUTH_CLIENT_ID_KEY, oauthClientId);
    sessionStorage.setItem(OAUTH_REDIRECT_URI_KEY, AUTH_CALLBACK_URL);
    sessionStorage.setItem(OAUTH_CSRF_STATE_KEY, csrfState);
    sessionStorage.setItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY, Date.now().toString());

    localStorage.setItem(OAUTH_CODE_VERIFIER_KEY, codeVerifier);
    localStorage.setItem(OAUTH_CODE_VERIFIER_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(OAUTH_CLIENT_ID_KEY, oauthClientId);
    localStorage.setItem(OAUTH_REDIRECT_URI_KEY, AUTH_CALLBACK_URL);
    localStorage.setItem(OAUTH_CSRF_STATE_KEY, csrfState);
    localStorage.setItem(OAUTH_CSRF_STATE_TIMESTAMP_KEY, Date.now().toString());

    oauth_auth_url.searchParams.set('code_challenge', codeChallenge);
    oauth_auth_url.searchParams.set('code_challenge_method', 'S256');
    oauth_auth_url.searchParams.set('state', csrfState);
    if (prompt) oauth_auth_url.searchParams.set('prompt', prompt);

    return oauth_auth_url.toString() || oauth_url;
};