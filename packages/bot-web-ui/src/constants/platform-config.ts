import { getPlatformSettings, routes } from '@deriv/shared';
import { localize } from '@deriv/translations';

type TPlatformConfig = {
    description: () => string;
    href?: string;
    link_to?: string;
    name: string;
    title: () => string;
};

const platform_config: TPlatformConfig[] = [
    {
        title: () => getPlatformSettings('trader').name,
        name: getPlatformSettings('trader').name,
        description: () => localize('MANUAL TRADER'),
        link_to: routes.trade,
    },
    {
        title: () => getPlatformSettings('dbot').name,
        name: getPlatformSettings('dbot').name,
        description: () => localize('BOT TRADING'),
        href: routes.bot,
    },
];

export default platform_config;