import React from 'react';
import LOGO from '../../../Logo/LOGO.png';

const DerivShortLogo = () => {
    return (
        <div className='header__menu-left-logo'>
            <a href='https://DIGITTOOL.com/'>
                <img
                    src={LOGO}
                    alt='Deriv Short Logo'
                    style={{ height: '25px', width: 'auto' }}
                />
            </a>
        </div>
    );
};

export default DerivShortLogo;