import DBotStore from '../scratch/dbot-store';
import { save_types } from '../constants/save-type';

// 🛠 Import static bots
import AutoRobot from './bots/auto_robot_by_GLE1.xml';
import Derivminer from './bots/deriv_miner_pro.xml';
import Over2Olympian from './bots/Over2OlympianBotwithSplitMartingale.xml';
import ALLANRISEBOT from './bots/ALLANRISEBOT.xml';
import Allanover2bot from './bots/Allanover2bot.xml';
import ALLANFALL from './bots/ALLANFALL.xml';
import Allanunder7 from './bots/0_Allanunder7.xml';

// ✅ Static bot configs only
const STATIC_BOTS = {
    auto_robot: {
        id: 'auto_robot_by_GLE1',
        name: 'Over 3 Bot',
        xml: AutoRobot,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    deriv_miner_pro: {
        id: 'deriv_miner_pro',
        name: 'Under 7 Expert Bot',
        xml: Derivminer,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    Over2Olympian: {
        id: 'Over2Olympian',
        name: 'Candle Mine Version 2',
        xml: Over2Olympian,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    ALLANRISEBOT: {
        id: 'ALLANRISEBOT',
        name: 'The MD MASTER BOT Pro',
        xml: ALLANRISEBOT,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    Allanover2bot: {
        id: 'Allanover2bot',
        name: 'Trikertie 2.34VL Hackie',
        xml: Allanover2bot,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    ALLANFALL: {
        id: 'ALLANFALL',
        name: 'Trikertie Hakie',
        xml: ALLANFALL,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
    Allanunder7: {
        id: 'Allanunder7',
        name: 'Python Hack Bot 2',
        xml: Allanunder7,
        timestamp: Date.now(),
        save_type: save_types.LOCAL,
    },
};

const getStaticBots = () => Object.values(STATIC_BOTS);

/**
 * 🔒 Disable saving bots
 */
export const saveWorkspaceToRecent = async () => {
    console.warn('[INFO] Saving disabled → Using static bots only.');
    const {
        load_modal: { updateListStrategies },
    } = DBotStore.instance;
    updateListStrategies(getStaticBots());
};

/**
 * ✅ Always return static bots
 */
export const getSavedWorkspaces = async () => {
    const bots = getStaticBots();
    console.log(
        '[DEBUG] Available static bots:',
        bots.map(bot => bot.id)
    );
    return bots;
};

/**
 * Load a bot by ID (from static list only)
 */
export const loadStrategy = async strategy_id => {
    console.log(`[DEBUG] Attempting to load bot: ${strategy_id}`);

    // Check for duplicate IDs
    const staticBots = getStaticBots();
    const duplicateIds = staticBots.filter((bot, index) => staticBots.findIndex(b => b.id === bot.id) !== index);

    if (duplicateIds.length > 0) {
        console.error(
            '[ERROR] Duplicate bot IDs found:',
            duplicateIds.map(b => b.id)
        );
    }

    const strategy = staticBots.find(bot => bot.id === strategy_id);

    if (!strategy) {
        console.error(
            `[ERROR] Bot with id "${strategy_id}" not found. Available bots:`,
            staticBots.map(b => b.id)
        );
        return false;
    }

    try {
        // Check if workspace is initialized
        if (!Blockly.derivWorkspace) {
            console.error('[ERROR] Blockly workspace not initialized');
            return false;
        }

        // Clear existing workspace first
        console.log('[DEBUG] Clearing existing workspace');
        Blockly.derivWorkspace.clear();

        const parser = new DOMParser();
        const xmlDom = parser.parseFromString(strategy.xml, 'text/xml').documentElement;

        // Check if XML is valid
        if (xmlDom.querySelector('parsererror')) {
            console.error('[ERROR] Invalid XML content for bot:', strategy_id);
            return false;
        }

        const convertedXml = convertStrategyToIsDbot(xmlDom);

        Blockly.Xml.domToWorkspace(convertedXml, Blockly.derivWorkspace);
        Blockly.derivWorkspace.current_strategy_id = strategy_id;

        console.log(`[SUCCESS] Loaded static bot: ${strategy.name} (ID: ${strategy_id})`);
        return true;
    } catch (error) {
        console.error('Error loading static bot:', error);
        return false;
    }
};

/**
 * 🔒 Disable removing bots
 */
export const removeExistingWorkspace = async () => {
    console.warn('[INFO] Remove disabled → Static bots only.');
    return false;
};

/**
 * Ensure xml has `is_dbot` flag
 */
export const convertStrategyToIsDbot = xml_dom => {
    if (!xml_dom) return;
    xml_dom.setAttribute('is_dbot', 'true');
    return xml_dom;
};

// 🧹 Clear storage & recents at startup
localStorage.removeItem('saved_workspaces');
localStorage.removeItem('recent_strategies');
console.log('[INFO] Cleared saved/recent bots → Static bots only.');
