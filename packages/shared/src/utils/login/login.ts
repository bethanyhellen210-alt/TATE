import { website_name } from '../config/app-config';
// ✅ Only needed if you still care about per-domain routing
// import { domain_app_ids } from '../config/config';
import { CookieStorage, isStorageSupported, LocalStore } from '../storage/storage';
import { getHubSignupUrl, urlForCurrentDomain } from '../url';
import { deriv_urls } from '../url/constants';
import { routes } from '../routes/routes';

// NEW: OAuth 2.0 Client ID (replaces old app ID 97552)
// Following Deriv's OAuth 2.0 documentation
// @see https://auth.deriv.com/oauth2/auth
const OAUTH_CLIENT_ID: string = '331jnAoP0zeJoAO4zFhPI';

// NEW: OAuth 2.0 endpoints (from Deriv API documentation)
const OAUTH_AUTH_URL: string = 'https://auth.deriv.com/oauth2/auth';

type TLoginUrl = {
    language: string;
};

export const redirectToLogin = (is_logged_in: boolean, language: string, has_params = true, redirect_delay = 0): void => {
    if (!is_logged_in && isStorageSupported(sessionStorage)) {
        const l = window.location;
        const redirect_url = has_params ? window.location.href : `${l.protocol}//${l.host}${l.pathname}`;
        sessionStorage.setItem('redirect_url', redirect_url);
        setTimeout(() => {
            const new_href = loginUrl({ language });
            window.location.href = new_href;
        }, redirect_delay);
    }
};

export const redirectToSignUp = (): void => {
    const isDtraderRoute = window.location.pathname.includes(routes.trade);
    window.open(getHubSignupUrl());
};

export const loginUrl = ({ language }: TLoginUrl): string => {
    const server_url = LocalStore.get('config.server_url');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signup_device_cookie = new (CookieStorage as any)('signup_device');
    const signup_device = signup_device_cookie.get('signup_device');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const date_first_contact_cookie = new (CookieStorage as any)('date_first_contact');
    const date_first_contact = date_first_contact_cookie.get('date_first_contact');
    const marketing_queries = `${signup_device ? `&signup_device=${signup_device}` : ''}${date_first_contact ? `&date_first_contact=${date_first_contact}` : ''}`;

    // MIGRATED: Replaced old app ID (97552) with new OAuth 2.0 client ID
    const current_app_id: string = OAUTH_CLIENT_ID;

    // MIGRATED: Updated OAuth URL to use new auth.deriv.com endpoint
    // Following Deriv's OAuth 2.0 documentation
    const getOAuthUrl = (): string => {
        // Using new OAuth 2.0 endpoint structure from documentation
        // Old: https://oauth.deriv.com/oauth2/authorize?app_id=...
        // New: https://auth.deriv.com/oauth2/auth?client_id=...&response_type=code&scope=trade+account_manage
        return `${OAUTH_AUTH_URL}?` +
            `response_type=code` +
            `&client_id=${current_app_id}` +
            `&redirect_uri=${encodeURIComponent(`${window.location.origin}/callback`)}` +
            `&scope=trade%20account_manage` +
            `&l=${language}` +
            `${marketing_queries}` +
            `&brand=${website_name.toLowerCase()}`;
    };

    if (server_url && /qa/.test(server_url)) {
        // For QA environments, use the QA server URL with new OAuth parameters
        return `https://${server_url}/oauth2/auth?` +
            `response_type=code` +
            `&client_id=${current_app_id}` +
            `&redirect_uri=${encodeURIComponent(`${window.location.origin}/callback`)}` +
            `&scope=trade%20account_manage` +
            `&l=${language}` +
            `${marketing_queries}` +
            `&brand=${website_name.toLowerCase()}`;
    }

    return urlForCurrentDomain(getOAuthUrl());
};

// NEW: Helper function for OAuth 2.0 signup URL (maintains same pattern as login)
export const signupUrl = ({ language }: TLoginUrl): string => {
    const server_url = LocalStore.get('config.server_url');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signup_device_cookie = new (CookieStorage as any)('signup_device');
    const signup_device = signup_device_cookie.get('signup_device');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const date_first_contact_cookie = new (CookieStorage as any)('date_first_contact');
    const date_first_contact = date_first_contact_cookie.get('date_first_contact');
    const marketing_queries = `${signup_device ? `&signup_device=${signup_device}` : ''}${date_first_contact ? `&date_first_contact=${date_first_contact}` : ''}`;

    const current_app_id: string = OAUTH_CLIENT_ID;

    // Signup requires prompt=registration parameter (as per documentation)
    const getSignupOAuthUrl = (): string => {
        return `${OAUTH_AUTH_URL}?` +
            `response_type=code` +
            `&client_id=${current_app_id}` +
            `&redirect_uri=${encodeURIComponent(`${window.location.origin}/callback`)}` +
            `&scope=trade%20account_manage` +
            `&prompt=registration` + // Required for signup
            `&l=${language}` +
            `${marketing_queries}` +
            `&brand=${website_name.toLowerCase()}`;
    };

    if (server_url && /qa/.test(server_url)) {
        return `https://${server_url}/oauth2/auth?` +
            `response_type=code` +
            `&client_id=${current_app_id}` +
            `&redirect_uri=${encodeURIComponent(`${window.location.origin}/callback`)}` +
            `&scope=trade%20account_manage` +
            `&prompt=registration` +
            `&l=${language}` +
            `${marketing_queries}` +
            `&brand=${website_name.toLowerCase()}`;
    }

    return urlForCurrentDomain(getSignupOAuthUrl());
};

// NEW: Function to handle OAuth 2.0 callback (maintains redirect functionality)
interface OAuthRedirectResult {
    success: boolean;
    code?: string | null;
    state?: string | null;
    error?: string | null;
    errorDescription?: string | null;
}

export const handleOAuthRedirect = (): OAuthRedirectResult => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    
    if (code) {
        // Store the code temporarily - will be exchanged for token by backend
        sessionStorage.setItem('oauth_code', code);
        if (state) {
            sessionStorage.setItem('oauth_state_received', state);
        }
        return { success: true, code, state };
    }
    
    if (error) {
        const errorDescription = urlParams.get('error_description');
        console.error('OAuth error:', error, errorDescription);
        return { success: false, error, errorDescription: errorDescription || null };
    }
    
    return { success: false, error: 'no_code' };
};

// NEW: Get stored redirect URL after OAuth login (maintains same functionality)
export const getStoredRedirectUrl = (): string => {
    const redirectUrl = sessionStorage.getItem('redirect_url');
    sessionStorage.removeItem('redirect_url');
    return redirectUrl || '/';
};

// NEW: Clear OAuth-related session data (maintains cleanup functionality)
export const clearOAuthSession = (): void => {
    sessionStorage.removeItem('oauth_code');
    sessionStorage.removeItem('oauth_state_received');
    sessionStorage.removeItem('redirect_url');
    sessionStorage.removeItem('pkce_code_verifier');
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_access_token');
    sessionStorage.removeItem('oauth_token_expiry');
};

// Export the OAuth client ID for use in other files
export { OAUTH_CLIENT_ID };