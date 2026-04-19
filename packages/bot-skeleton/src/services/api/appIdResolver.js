// NEW: OAuth 2.0 Client ID (replaces old app ID 97552)
const OAUTH_CLIENT_ID = '331jnAoP0zeJoAO4zFhPI';

/**
 * Application IDs mapping for Deriv API
 * MIGRATED: Replaced legacy app IDs with OAuth 2.0 client ID
 * 
 * Note: These are now OAuth 2.0 client IDs instead of legacy app IDs
 * Following Deriv's OAuth 2.0 authentication documentation
 * 
 * @see https://auth.deriv.com/oauth2/auth
 * @see https://api.derivws.com
 */
const AppIds = Object.freeze({
    // Production domains - using OAuth 2.0 client ID
    'deriv.app': OAUTH_CLIENT_ID,           // TODO: [app-link-refactor] - Remove backwards compatibility for `deriv.app`
    'staging.deriv.app': OAUTH_CLIENT_ID,
    'app.deriv.com': OAUTH_CLIENT_ID,
    'staging-app.deriv.com': OAUTH_CLIENT_ID,
    'app.deriv.me': OAUTH_CLIENT_ID,        // Added for completeness
    'staging-app.deriv.me': OAUTH_CLIENT_ID,
    'app.deriv.be': OAUTH_CLIENT_ID,        // Added for completeness
    'staging-app.deriv.be': OAUTH_CLIENT_ID,
    'binary.com': OAUTH_CLIENT_ID,          // Legacy domain support
    'smarttraderstool.com': OAUTH_CLIENT_ID, // Legacy domain support
    'test-app.deriv.com': OAUTH_CLIENT_ID,
    
    // Development/Preview domains
    'goon-puce.vercel.app': OAUTH_CLIENT_ID,
    'beleiver.vercel.app': OAUTH_CLIENT_ID,
    'royal-app-seven.vercel.app': OAUTH_CLIENT_ID,
    'star-eight-ruby.vercel.app': OAUTH_CLIENT_ID,
});

/**
 * Get App ID (OAuth Client ID) for current domain
 * @param {string} domain - The domain to get the app ID for
 * @returns {string} OAuth Client ID or default
 */
export const getAppIdForDomain = (domain) => {
    return AppIds[domain] || OAUTH_CLIENT_ID;
};

/**
 * Check if a domain is registered with our OAuth app
 * @param {string} domain - The domain to check
 * @returns {boolean} True if domain is registered
 */
export const isRegisteredDomain = (domain) => {
    return Object.keys(AppIds).includes(domain);
};

/**
 * Get all registered redirect URIs for OAuth
 * Note: These must match exactly what's registered with Deriv
 * @returns {string[]} Array of allowed redirect URIs
 */
export const getAllowedRedirectUris = () => {
    const domains = Object.keys(AppIds);
    return domains.map(domain => {
        const protocol = domain.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${domain}/callback`;
    });
};

/**
 * Validate if a redirect URI is allowed for OAuth
 * @param {string} redirectUri - The redirect URI to validate
 * @returns {boolean} True if URI is allowed
 */
export const isValidRedirectUri = (redirectUri) => {
    try {
        const url = new URL(redirectUri);
        const domain = url.hostname;
        const allowedDomains = Object.keys(AppIds);
        
        // Check if domain is allowed
        if (!allowedDomains.includes(domain)) {
            return false;
        }
        
        // Check if path is allowed (customize as needed)
        const allowedPaths = ['/callback', '/oauth/callback', '/auth/callback'];
        return allowedPaths.some(path => url.pathname === path);
    } catch (error) {
        console.error('Invalid redirect URI:', error);
        return false;
    }
};

export default AppIds;

// Export the OAuth client ID separately for convenience
export { OAUTH_CLIENT_ID };