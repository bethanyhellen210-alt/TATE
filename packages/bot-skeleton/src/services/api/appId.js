import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import { getSocketURL, website_name } from '@deriv/shared';
import { getLanguage } from '@deriv/translations';
import APIMiddleware from './api-middleware';

// NEW: OAuth 2.0 Client ID (replaces old app ID 97552)
const OAUTH_CLIENT_ID = '331jnAoP0zeJoAO4zFhPI';

// NEW: API Base URL and WebSocket endpoints (from documentation)
const API_BASE_URL = 'https://api.derivws.com';
const WEBSOCKET_PUBLIC_URL = 'wss://api.derivws.com/trading/v1/options/ws/public';
const WEBSOCKET_DEMO_URL = 'wss://api.derivws.com/trading/v1/options/ws/demo';
const WEBSOCKET_REAL_URL = 'wss://api.derivws.com/trading/v1/options/ws/real';

/**
 * Generate authenticated WebSocket URL with OTP
 * Follows documentation: Get OTP via REST API before WebSocket connection
 * 
 * @param {string} accountId - The Deriv account ID (e.g., 'CR1234567')
 * @param {string} accessToken - OAuth 2.0 access token
 * @param {string} accountType - 'demo' or 'real'
 * @returns {Promise<string>} Authenticated WebSocket URL
 */
export const getAuthenticatedWebSocketURL = async (accountId, accessToken, accountType = 'demo') => {
    try {
        // Step 1: Get OTP from REST API (as per documentation)
        const response = await fetch(`${API_BASE_URL}/trading/v1/options/accounts/${accountId}/otp`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Deriv-App-ID': OAUTH_CLIENT_ID,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get OTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const otp = data.otp;

        // Step 2: Build authenticated WebSocket URL with OTP (as per documentation)
        let wsUrl;
        if (accountType === 'real') {
            wsUrl = `${WEBSOCKET_REAL_URL}?otp=${otp}`;
        } else {
            wsUrl = `${WEBSOCKET_DEMO_URL}?otp=${otp}`;
        }

        return wsUrl;
    } catch (error) {
        console.error('Error getting authenticated WebSocket URL:', error);
        throw error;
    }
};

/**
 * Get public WebSocket URL (no authentication required)
 * @returns {string} Public WebSocket URL
 */
export const getPublicWebSocketURL = () => {
    return WEBSOCKET_PUBLIC_URL;
};

/**
 * Generate Deriv API instance with proper authentication
 * MIGRATED: Replaced old app_id with OAuth 2.0 flow
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.accessToken - OAuth 2.0 access token (optional for public)
 * @param {string} options.accountId - Deriv account ID (optional for public)
 * @param {string} options.accountType - 'demo' or 'real' (default: 'demo')
 * @returns {Promise<Object>} Deriv API instance
 */
export const generateDerivApiInstance = async (options = {}) => {
    const { accessToken, accountId, accountType = 'demo' } = options;
    
    let socket_url;
    
    // If authenticated with OAuth token and account ID, use authenticated WebSocket
    if (accessToken && accountId) {
        try {
            socket_url = await getAuthenticatedWebSocketURL(accountId, accessToken, accountType);
        } catch (error) {
            console.error('Failed to get authenticated WebSocket URL, falling back to public:', error);
            socket_url = getPublicWebSocketURL();
        }
    } else {
        // Use public WebSocket endpoint (no authentication required)
        socket_url = getPublicWebSocketURL();
    }
    
    // Add language and brand parameters if supported by the new API
    // Note: New API may not support these query params, but we include them for backward compatibility
    const language = getLanguage();
    const brand = website_name.toLowerCase();
    
    // Append language and brand as query parameters if they are supported
    // The new API might ignore these, but we keep the pattern
    if (socket_url && !socket_url.includes('?')) {
        socket_url = `${socket_url}?l=${language}&brand=${brand}`;
    } else if (socket_url) {
        socket_url = `${socket_url}&l=${language}&brand=${brand}`;
    }
    
    const deriv_socket = new WebSocket(socket_url);
    const deriv_api = new DerivAPIBasic({
        connection: deriv_socket,
        middleware: new APIMiddleware({}),
    });
    
    return deriv_api;
};

/**
 * Legacy generateDerivApiInstance for backward compatibility
 * DEPRECATED: Use the async version above with OAuth 2.0 tokens
 * 
 * @deprecated Use generateDerivApiInstance({ accessToken, accountId }) instead
 */
export const generateDerivApiInstanceLegacy = () => {
    console.warn('generateDerivApiInstanceLegacy is deprecated. Use generateDerivApiInstance with OAuth 2.0 tokens instead.');
    
    // Fallback to old method with new client ID (kept for backward compatibility)
    const app_id = OAUTH_CLIENT_ID;
    const socket_url = `wss://${getSocketURL()}/websockets/v3?app_id=${app_id}&l=${getLanguage()}&brand=${website_name.toLowerCase()}`;
    
    const deriv_socket = new WebSocket(socket_url);
    const deriv_api = new DerivAPIBasic({
        connection: deriv_socket,
        middleware: new APIMiddleware({}),
    });
    return deriv_api;
};

/**
 * Get login ID from localStorage
 * @returns {string|null} Active login ID
 */
export const getLoginId = () => {
    const login_id = localStorage.getItem('active_loginid');
    if (login_id && login_id !== 'null') return login_id;
    return null;
};

/**
 * Get OAuth 2.0 token and account info from storage
 * MIGRATED: Now returns OAuth access token instead of legacy token
 * 
 * @returns {Object} Object containing token and account_id
 */
export const getToken = () => {
    const active_loginid = getLoginId();
    
    // NEW: Try to get OAuth 2.0 access token first
    const oauth_token = sessionStorage.getItem('oauth_access_token');
    const oauth_token_expiry = sessionStorage.getItem('oauth_token_expiry');
    
    // Check if OAuth token exists and is not expired
    if (oauth_token && oauth_token_expiry && Date.now() < parseInt(oauth_token_expiry)) {
        return {
            token: oauth_token,
            account_id: active_loginid || undefined,
            auth_type: 'oauth2' // Indicate this is an OAuth 2.0 token
        };
    }
    
    // Fallback to legacy token system for backward compatibility
    const client_accounts = JSON.parse(localStorage.getItem('client.accounts')) || undefined;
    const active_account = (client_accounts && client_accounts[active_loginid]) || {};
    
    return {
        token: active_account?.token || undefined,
        account_id: active_loginid || undefined,
        auth_type: 'legacy' // Indicate this is a legacy token
    };
};

/**
 * Check if user has valid OAuth 2.0 authentication
 * @returns {boolean} True if authenticated with OAuth 2.0
 */
export const isOAuthAuthenticated = () => {
    const token = getToken();
    return token.auth_type === 'oauth2' && !!token.token;
};

/**
 * Get OAuth 2.0 access token specifically
 * @returns {string|null} OAuth access token or null
 */
export const getOAuthAccessToken = () => {
    const token = sessionStorage.getItem('oauth_access_token');
    const expiry = sessionStorage.getItem('oauth_token_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
        return token;
    }
    
    return null;
};

/**
 * Store OAuth 2.0 tokens after successful authentication
 * @param {string} accessToken - The OAuth 2.0 access token
 * @param {number} expiresIn - Token expiry in seconds
 */
export const setOAuthTokens = (accessToken, expiresIn) => {
    sessionStorage.setItem('oauth_access_token', accessToken);
    sessionStorage.setItem('oauth_token_expiry', Date.now() + (expiresIn * 1000));
};

/**
 * Clear OAuth 2.0 tokens on logout
 */
export const clearOAuthTokens = () => {
    sessionStorage.removeItem('oauth_access_token');
    sessionStorage.removeItem('oauth_token_expiry');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
};

// Example usage:
/*
// For authenticated trading:
const { token, account_id } = getToken();
if (token && account_id) {
    const derivApi = await generateDerivApiInstance({
        accessToken: token,
        accountId: account_id,
        accountType: 'demo' // or 'real' for real money account
    });
    // Use derivApi for trading...
}

// For public market data (no authentication needed):
const derivApi = await generateDerivApiInstance();
// Use derivApi for public data...
*/