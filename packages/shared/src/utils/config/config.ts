import { isBot } from '../platform';
import { isStaging } from '../url/helpers';
import { WebSocketUtils } from '@deriv-com/utils';

/*
 * Configuration values needed in js codes
 *
 * NOTE:
 * Please use the following command to avoid accidentally committing personal changes
 * git update-index --assume-unchanged packages/shared/src/utils/config.js
 *
 */

// Type definitions
interface PartnerParams {
    sidc?: string;
    utm_campaign?: string;
    utm_medium?: string;
    utm_source?: string;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface OTPResponse {
    otp: string;
}

interface PKCEResult {
    codeVerifier: string;
    codeChallenge: string;
    state: string;
}

interface OAuthCallbackResult {
    success: boolean;
    code?: string;
    state?: string | null;
    error?: string;
    errorDescription?: string | null;
    tokenData?: TokenResponse;
}

export const livechat_license_id = 12049137;
export const livechat_client_id = '66aa088aad5a414484c1fd1fa8a5ace7';

// NEW OAuth 2.0 Client ID (replaces old app ID 97552)
export const OAUTH_CLIENT_ID = '331jnAoP0zeJoAO4zFhPI';

// OAuth 2.0 endpoints (from documentation)
export const OAUTH_AUTH_URL = 'https://auth.deriv.com/oauth2/auth';
export const OAUTH_TOKEN_URL = 'https://auth.deriv.com/oauth2/token';
export const API_BASE_URL = 'https://api.derivws.com';

// WebSocket endpoints (from documentation)
export const WEBSOCKET_PUBLIC_URL = 'wss://api.derivws.com/trading/v1/options/ws/public';
export const WEBSOCKET_DEMO_URL = 'wss://api.derivws.com/trading/v1/options/ws/demo';
export const WEBSOCKET_REAL_URL = 'wss://api.derivws.com/trading/v1/options/ws/real';

// Legacy domain app IDs - kept for backward compatibility but using new OAuth flow
export const domain_app_ids: Record<string, string> = {
    'smarttraderstool.com': OAUTH_CLIENT_ID,
    'deriv.app': OAUTH_CLIENT_ID,
    'app.deriv.com': OAUTH_CLIENT_ID,
    'staging-app.deriv.com': OAUTH_CLIENT_ID,
    'app.deriv.me': OAUTH_CLIENT_ID,
    'staging-app.deriv.me': OAUTH_CLIENT_ID,
    'app.deriv.be': OAUTH_CLIENT_ID,
    'staging-app.deriv.be': OAUTH_CLIENT_ID,
    'binary.com': OAUTH_CLIENT_ID,
    'test-app.deriv.com': OAUTH_CLIENT_ID,
    'royal-app-seven.vercel.app': OAUTH_CLIENT_ID,
    'star-eight-ruby.vercel.app': OAUTH_CLIENT_ID,
    'beleiver.vercel.app': OAUTH_CLIENT_ID,
    'goon-puce.vercel.app': OAUTH_CLIENT_ID,
};

export const platform_app_ids: Record<string, string> = {
    derivgo: OAUTH_CLIENT_ID,
};

export const getCurrentProductionDomain = (): string | undefined => {
    const isNotStaging = !/^staging\./.test(window.location.hostname);
    if (!isNotStaging) return undefined;
    return Object.keys(domain_app_ids).find(domain => window.location.hostname === domain);
};

export const isProduction = (): boolean => {
    const all_domains = Object.keys(domain_app_ids).map(domain => `(www\\.)?${domain.replace('.', '\\.')}`);
    return new RegExp(`^(${all_domains.join('|')})$`, 'i').test(window.location.hostname);
};

export const isTestLink = (): boolean => /^((.*)\.binary\.sx)$/i.test(window.location.hostname);
export const isLocal = (): boolean => /localhost(:\d+)?$/i.test(window.location.hostname);

/**
 * Generate PKCE code verifier and challenge for OAuth 2.0
 * Following Deriv's OAuth 2.0 with PKCE specification
 */
export const generatePKCE = async (): Promise<PKCEResult> => {
    // Generate random code_verifier (43-128 characters)
    const array = crypto.getRandomValues(new Uint8Array(64));
    const codeVerifier = Array.from(array)
        .map(v => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[v % 66])
        .join('');

    // Derive code_challenge using SHA-256
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Generate random state for CSRF protection
    const state = crypto.getRandomValues(new Uint8Array(16))
        .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');

    return { codeVerifier, codeChallenge, state };
};

/**
 * Redirect user to Deriv OAuth 2.0 login page
 * Follows documentation: Step 2 - Redirect user to authorization endpoint
 */
export const redirectToOAuthLogin = async (redirectUri: string, legacyAppId: string | null = null): Promise<void> => {
    const { codeChallenge, state, codeVerifier } = await generatePKCE();
    
    // Store PKCE values for later use (as per documentation)
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);
    
    // Build authorization URL (as per documentation)
    let authUrl = `${OAUTH_AUTH_URL}?` +
        `response_type=code` +
        `&client_id=${OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=trade%20account_manage` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;
    
    // Include legacy app ID if maintaining legacy API app (as per documentation)
    if (legacyAppId) {
        authUrl += `&app_id=${legacyAppId}`;
    }
    
    window.location.href = authUrl;
};

/**
 * Redirect user to Deriv OAuth 2.0 signup page
 * Follows documentation: Sign Up requires prompt=registration
 */
export const redirectToOAuthSignup = async (
    redirectUri: string, 
    partnerParams: PartnerParams = {}, 
    legacyAppId: string | null = null
): Promise<void> => {
    const { codeChallenge, state, codeVerifier } = await generatePKCE();
    
    // Store PKCE values for later use
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);
    
    // Build signup URL with required prompt parameter
    let signupUrl = `${OAUTH_AUTH_URL}?` +
        `response_type=code` +
        `&client_id=${OAUTH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=trade%20account_manage` +
        `&state=${state}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256` +
        `&prompt=registration`; // Required for signup
    
    // Add optional partner attribution parameters (from Partners dashboard)
    if (partnerParams.sidc) signupUrl += `&sidc=${partnerParams.sidc}`;
    if (partnerParams.utm_campaign) signupUrl += `&utm_campaign=${partnerParams.utm_campaign}`;
    if (partnerParams.utm_medium) signupUrl += `&utm_medium=${partnerParams.utm_medium}`;
    if (partnerParams.utm_source) signupUrl += `&utm_source=${partnerParams.utm_source}`;
    
    // Include legacy app ID if needed
    if (legacyAppId) {
        signupUrl += `&app_id=${legacyAppId}`;
    }
    
    window.location.href = signupUrl;
};

/**
 * Exchange authorization code for access token
 * Follows documentation: Step 4 - Exchange code for tokens
 * This MUST be called from backend, not from browser
 */
export const exchangeCodeForToken = async (code: string, redirectUri: string): Promise<TokenResponse> => {
    const codeVerifier = sessionStorage.getItem('pkce_code_verifier');
    
    if (!codeVerifier) {
        throw new Error('PKCE code verifier not found');
    }
    
    const response = await fetch(OAUTH_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: OAUTH_CLIENT_ID,
            code: code,
            code_verifier: codeVerifier,
            redirect_uri: redirectUri,
        }),
    });
    
    if (!response.ok) {
        throw new Error('Token exchange failed');
    }
    
    const data: TokenResponse = await response.json();
    
    // Clear PKCE values after successful exchange (as per documentation)
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
    
    // Store access token
    sessionStorage.setItem('oauth_access_token', data.access_token);
    sessionStorage.setItem('oauth_token_expiry', String(Date.now() + (data.expires_in * 1000)));
    
    return data;
};

/**
 * Get OTP for WebSocket authentication
 * Follows documentation: Get OTP via REST API before WebSocket connection
 */
export const getWebSocketOTP = async (accountId: string, accessToken: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts/${accountId}/otp`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Deriv-App-ID': OAUTH_CLIENT_ID,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error('Failed to get OTP');
    }
    
    const data: OTPResponse = await response.json();
    return data.otp;
};

/**
 * Get authenticated WebSocket URL with OTP
 * Follows documentation: OTP response contains ready-to-use WebSocket URL
 */
export const getAuthenticatedWebSocketURL = async (
    accountType: string, 
    accountId: string, 
    accessToken: string
): Promise<string> => {
    const otp = await getWebSocketOTP(accountId, accessToken);
    
    let wsUrl: string;
    switch(accountType) {
        case 'demo':
            wsUrl = `${WEBSOCKET_DEMO_URL}?otp=${otp}`;
            break;
        case 'real':
            wsUrl = `${WEBSOCKET_REAL_URL}?otp=${otp}`;
            break;
        default:
            wsUrl = WEBSOCKET_PUBLIC_URL;
    }
    
    return wsUrl;
};

/**
 * Get current access token (refreshes if needed)
 */
export const getAccessToken = (): string | null => {
    const token = sessionStorage.getItem('oauth_access_token');
    const expiry = sessionStorage.getItem('oauth_token_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
        return token;
    }
    
    return null;
};

/**
 * Check if user is authenticated via OAuth 2.0
 */
export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
};

/**
 * Logout - clear OAuth tokens
 */
export const logout = (): void => {
    sessionStorage.removeItem('oauth_access_token');
    sessionStorage.removeItem('oauth_token_expiry');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
};

/**
 * @deprecated Please use OAuth 2.0 authentication instead of legacy app ID
 * Use 'getAccessToken()' and OAuth flows for authentication
 */
export const getAppId = (): string => {
    // Return OAuth client ID for backward compatibility
    // But warn that this is deprecated
    if (process.env.NODE_ENV === 'development') {
        console.warn('getAppId() is deprecated. Use OAuth 2.0 authentication instead.');
    }
    
    let app_id: string | null = null;
    const user_app_id = OAUTH_CLIENT_ID;
    const config_app_id = window.localStorage.getItem('config.app_id');
    const current_domain = getCurrentProductionDomain() || '';
    window.localStorage.removeItem('config.platform');
    const platform = window.sessionStorage.getItem('config.platform');
    const is_bot = isBot();

    if (platform && platform_app_ids[platform as keyof typeof platform_app_ids]) {
        app_id = platform_app_ids[platform as keyof typeof platform_app_ids];
    } else if (config_app_id) {
        app_id = config_app_id;
    } else if (user_app_id.length) {
        window.localStorage.setItem('config.default_app_id', user_app_id);
        app_id = user_app_id;
    } else if (isStaging()) {
        window.localStorage.removeItem('config.default_app_id');
        app_id = is_bot ? OAUTH_CLIENT_ID : domain_app_ids[current_domain as keyof typeof domain_app_ids] || OAUTH_CLIENT_ID;
    } else if (/localhost/i.test(window.location.hostname)) {
        app_id = OAUTH_CLIENT_ID;
    } else {
        window.localStorage.removeItem('config.default_app_id');
        app_id = is_bot ? OAUTH_CLIENT_ID : domain_app_ids[current_domain as keyof typeof domain_app_ids] || OAUTH_CLIENT_ID;
    }

    return app_id || OAUTH_CLIENT_ID;
};

// Updated WebSocket URL handling for new API
export const getSocketURL = (): string => {
    const local_storage_server_url = window.localStorage.getItem('config.server_url');
    if (local_storage_server_url) return local_storage_server_url;

    // Return the new API WebSocket base URL
    return 'api.derivws.com';
};

export const checkAndSetEndpointFromUrl = (): boolean => {
    if (isTestLink()) {
        const url_params = new URLSearchParams(location.search.slice(1));

        if (url_params.has('qa_server') && url_params.has('app_id')) {
            const qa_server = url_params.get('qa_server') || '';
            const app_id = url_params.get('app_id') || '';

            url_params.delete('qa_server');
            url_params.delete('app_id');

            // Use new API endpoint structure
            if (/^(^(www\.)?qa[0-9]{1,4}\.deriv\.dev|(.*)\.derivws\.com)$/.test(qa_server) && /^[0-9a-zA-Z]+$/.test(app_id)) {
                localStorage.setItem('config.app_id', app_id);
                // Use new API WebSocket endpoint format
                localStorage.setItem('config.server_url', `wss://${qa_server}/trading/v1/options/ws/public`);
            }

            const params = url_params.toString();
            const hash = location.hash;

            location.href = `${location.protocol}//${location.hostname}${location.pathname}${params ? `?${params}` : ''}${hash || ''}`;
            return true;
        }
    }

    return false;
};

export const getDebugServiceWorker = (): boolean => {
    const debug_service_worker_flag = window.localStorage.getItem('debug_service_worker');
    if (debug_service_worker_flag) return !!parseInt(debug_service_worker_flag);
    return false;
};

// Helper function to handle OAuth callback
export const handleOAuthCallback = async (): Promise<OAuthCallbackResult> => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // Check for errors (as per documentation)
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        return { success: false, error, errorDescription: errorDescription || null };
    }
    
    // Verify state for CSRF protection (as per documentation)
    const storedState = sessionStorage.getItem('oauth_state');
    if (!state || state !== storedState) {
        console.error('State mismatch - possible CSRF attack');
        return { success: false, error: 'state_mismatch' };
    }
    
    if (!code) {
        return { success: false, error: 'no_code' };
    }
    
    try {
        // Exchange code for token (should be done on backend in production)
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const tokenData = await exchangeCodeForToken(code, redirectUri);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        return { success: true, code, state, tokenData };
    } catch (err: unknown) {
        console.error('Token exchange failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
};