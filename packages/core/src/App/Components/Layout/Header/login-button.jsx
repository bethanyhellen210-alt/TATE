import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import { Button } from '@deriv/components';
import { isStaging, redirectToLogin } from '@deriv/shared';
import { getLanguage, localize } from '@deriv/translations';
import { requestOidcAuthentication } from '@deriv-com/auth-client';

const popupStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
    },
    container: {
        background: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideIn 0.3s ease-out',
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 600,
        color: '#1f2937',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '28px',
        cursor: 'pointer',
        color: '#6b7280',
        padding: 0,
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        transition: 'all 0.2s',
    },
    content: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    oldAccountButton: {
        padding: '14px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'center',
        backgroundColor: '#3b82f6',
        color: 'white',
    },
    newAccountButton: {
        padding: '14px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'center',
        backgroundColor: '#10b981',
        color: 'white',
    },
    abepayButton: {
        padding: '14px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'center',
        backgroundColor: '#f59e0b',
        color: 'white',
        marginBottom: '16px',
        width: '100%',
    },
};

// Add this to your global CSS or component
const animationStyles = `
    @keyframes slideIn {
        from {
            transform: translateY(-20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
`;

const LoginButton = ({ className }) => {
    const [showPopup, setShowPopup] = useState(false);
    const is_deriv_com = /deriv\.(com)/.test(window.location.hostname);
    const has_wallet_cookie = Cookies.get('wallet_account');

    // Inject animation styles if not already present
    React.useEffect(() => {
        if (!document.getElementById('login-button-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'login-button-animations';
            styleSheet.textContent = animationStyles;
            document.head.appendChild(styleSheet);
        }
    }, []);

    const handleOldAccountLogin = async () => {
        setShowPopup(false);
        if (has_wallet_cookie) {
            if (isStaging()) {
                location.href = 'https://staging-hub.deriv.com/tradershub/login';
            } else {
                location.href = 'https://hub.deriv.com/tradershub/login';
            }
        }
        if (is_deriv_com) {
            try {
                await requestOidcAuthentication({
                    redirectCallbackUri: `${window.location.origin}/callback`,
                    postLoginRedirectUri: window.location.href,
                }).catch(err => {
                    console.error(err);
                });
            } catch (err) {
                console.error(err);
            }
        }
        window.LiveChatWidget?.call('hide');
        redirectToLogin(false, getLanguage());
    };

    const handleNewAccountLogin = () => {
        setShowPopup(false);
        window.open('https://newaccounts.traderkit.pro', '_blank', 'noopener,noreferrer');
    };

    const handleAbePayDeposit = () => {
        window.open(
            'https://app.abepayy.com?ref=partner4',
            'AbePay',
            'width=480,height=750,left=100,top=50,resizable=yes,scrollbars=yes'
        );
    };

    return (
        <>
            {/* AbePay Deposit Button - Added before Login button */}
            <button
                type='button'
                style={popupStyles.abepayButton}
                onClick={handleAbePayDeposit}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.transform = 'translateY(0)';
                }}
            >
                {localize('Deposit')}
            </button>

            <Button
                id='dt_login_button'
                className={className}
                has_effect
                text={localize('Log in')}
                onClick={() => setShowPopup(true)}
                tertiary
            />

            {showPopup && (
                <div style={popupStyles.overlay} onClick={() => setShowPopup(false)}>
                    <div style={popupStyles.container} onClick={(e) => e.stopPropagation()}>
                        <div style={popupStyles.header}>
                            <h3 style={popupStyles.headerTitle}>{localize('Choose Login Method')}</h3>
                            <button 
                                style={popupStyles.closeButton}
                                onClick={() => setShowPopup(false)}
                                aria-label="Close"
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                    e.target.style.color = '#1f2937';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#6b7280';
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={popupStyles.content}>
                            <button 
                                style={popupStyles.oldAccountButton}
                                onClick={handleOldAccountLogin}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {localize('Login to Old Account')}
                            </button>
                            <button 
                                style={popupStyles.newAccountButton}
                                onClick={handleNewAccountLogin}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#059669';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = '#10b981';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                {localize('Login to New Account')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

LoginButton.propTypes = {
    className: PropTypes.string,
};

export { LoginButton };