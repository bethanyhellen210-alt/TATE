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

// Export default_title for components that need it
export const default_title = 'Deriv';

// Export useOnLoadTranslation hook for components that need it
import React from 'react';

export const useOnLoadTranslation = () => {
    const [isTranslationLoaded, setIsTranslationLoaded] = React.useState(true);
    const [isRtl, setIsRtl] = React.useState(false);
    
    React.useEffect(() => {
        // Check if translations are loaded
        const checkTranslationLoaded = () => {
            // Check for i18n initialization indicators
            const i18nElement = document.querySelector('[data-i18n]');
            const i18nLoaded = document.querySelector('[data-i18n-loaded]');
            const translationElement = document.querySelector('[data-translation-loaded]');
            const isLoaded = !!(i18nElement || i18nLoaded || translationElement);
            setIsTranslationLoaded(isLoaded);
        };
        
        // Check RTL based on document direction or language
        const checkRtl = () => {
            const isRtlDocument = document.documentElement.dir === 'rtl';
            const htmlLang = document.documentElement.lang;
            const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ku', 'ps', 'sd', 'ug', 'yi'];
            const isRtlLanguage = rtlLanguages.includes(htmlLang?.toLowerCase() || '');
            setIsRtl(isRtlDocument || isRtlLanguage);
        };
        
        // Initial checks
        checkTranslationLoaded();
        checkRtl();
        
        // Watch for DOM changes that might indicate translation loading
        const observer = new MutationObserver(() => {
            checkTranslationLoaded();
            checkRtl();
        });
        
        // Start observing the document body for changes
        if (document.body) {
            observer.observe(document.body, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }
        
        // Also check when window loads
        const handleLoad = () => {
            setTimeout(() => {
                checkTranslationLoaded();
                checkRtl();
            }, 100);
        };
        
        window.addEventListener('load', handleLoad);
        
        // Check for i18n library initialization
        const checkI18nInterval = setInterval(() => {
            // Check if i18next is initialized globally
            if (window.i18next || window.i18n) {
                setIsTranslationLoaded(true);
                clearInterval(checkI18nInterval);
            }
        }, 500);
        
        // Cleanup timeout for interval
        const timeout = setTimeout(() => {
            clearInterval(checkI18nInterval);
        }, 5000);
        
        return () => {
            observer.disconnect();
            window.removeEventListener('load', handleLoad);
            clearInterval(checkI18nInterval);
            clearTimeout(timeout);
        };
    }, []);
    
    return [isTranslationLoaded, isRtl];
};

// Add TypeScript declaration for global i18n objects
declare global {
    interface Window {
        i18next?: any;
        i18n?: any;
    }
}