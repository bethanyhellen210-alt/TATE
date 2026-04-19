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

// ============================================================================
// MISSING HOOKS AND FUNCTIONS - Fixed versions
// ============================================================================
import React from 'react';

// useIsMounted hook - returns a function that checks if component is mounted
export const useIsMounted = (): (() => boolean) => {
    const isMounted = React.useRef(false);
    
    React.useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    
    return React.useCallback(() => isMounted.current, []);
};

// useNewRowTransition hook - returns object with in_prop property for animations
export const useNewRowTransition = (shouldShow: boolean): { in_prop: boolean } => {
    const [inProp, setInProp] = React.useState(false);
    
    React.useEffect(() => {
        if (shouldShow) {
            // Small delay to ensure the DOM is ready
            const timer = setTimeout(() => setInProp(true), 50);
            return () => clearTimeout(timer);
        } else {
            setInProp(false);
        }
    }, [shouldShow]);
    
    return { in_prop: inProp };
};

// useOnLoadTranslation hook - used by AppWithoutTranslation
export const useOnLoadTranslation = (): [boolean, boolean] => {
    const [isTranslationLoaded, setIsTranslationLoaded] = React.useState(true);
    const [isRtl, setIsRtl] = React.useState(false);
    
    React.useEffect(() => {
        const checkTranslationLoaded = () => {
            const i18nElement = document.querySelector('[data-i18n]');
            const i18nLoaded = document.querySelector('[data-i18n-loaded]');
            setIsTranslationLoaded(!!(i18nElement || i18nLoaded));
        };
        
        const checkRtl = () => {
            const isRtlDocument = document.documentElement.dir === 'rtl';
            const htmlLang = document.documentElement.lang;
            const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ku', 'ps', 'sd', 'ug', 'yi'];
            const isRtlLanguage = rtlLanguages.includes(htmlLang?.toLowerCase() || '');
            setIsRtl(isRtlDocument || isRtlLanguage);
        };
        
        checkTranslationLoaded();
        checkRtl();
        
        const observer = new MutationObserver(() => {
            checkTranslationLoaded();
            checkRtl();
        });
        
        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
        });
        
        return () => observer.disconnect();
    }, []);
    
    return [isTranslationLoaded, isRtl];
};

// Fixed clickAndKeyEventHandler - accepts a callback function and an event
export const clickAndKeyEventHandler = (
    callback: (() => void) | (() => Promise<void>),
    event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
): void => {
    if (!callback) return;
    
    if (!event) {
        callback();
        return;
    }
    
    if (event.type === 'click') {
        callback();
    } else if ((event as React.KeyboardEvent).key === 'Enter' || (event as React.KeyboardEvent).key === ' ') {
        event.preventDefault();
        callback();
    }
};

// Contract utility functions
export const isValidToCancel = (contract: any): boolean => {
    return contract?.is_valid_to_cancel || false;
};

export const isValidToSell = (contract: any): boolean => {
    return contract?.is_valid_to_sell || true;
};

export const hasContractEntered = (contract: any): boolean => {
    return contract?.is_entered || false;
};

export const isOpen = (contract: any): boolean => {
    return contract?.status === 'open';
};

// Additional utility functions that might be needed
export const isMarketClosed = (market_times: any, symbol: string): boolean => {
    // Simple implementation - adjust based on your needs
    return false;
};

export const convertTimeFormat = (time: string): string => {
    return time;
};

export const toMoment = (date: any): any => {
    return date;
};

export const isTimeValid = (time: any): boolean => {
    return true;
};

export const setTime = (date: any, time: any): any => {
    return date;
};

export const hasIntradayDurationUnit = (duration_unit: string): boolean => {
    return duration_unit === 'minutes' || duration_unit === 'hours';
};

export const getTomorrowDate = (): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
};

export const getMarketNamesMap = (): Map<string, string> => {
    return new Map();
};

export const isContractElapsed = (contract: any): boolean => {
    return false;
};

export const getPropertyValue = (obj: any, path: string[]): any => {
    return path.reduce((acc, key) => acc?.[key], obj);
};

// Export all hooks together
export const hooks = {
    useIsMounted,
    useNewRowTransition,
    useOnLoadTranslation,
};