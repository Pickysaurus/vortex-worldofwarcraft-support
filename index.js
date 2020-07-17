const { actions, fs, log, selectors, util } = require('vortex-api');
const Promise = require('bluebird');
const path = require('path');
const winapi = require('winapi-bindings');

const WOW_RETAIL = 'worldofwarcraft';
const WOW_CLASSIC = 'worldofwarcraftclassic';

// All WoW mods will have .toc files
const MOD_FILE_EXT = ".toc";

function findGame(id) {
    let instPath;
    try {
        if (id === WOW_CLASSIC) {
            // This is probably wrong, but I am not sure of the reg key for WOW Classic.
            instPath = winapi.RegGetValue(
                'HKEY_LOCAL_MACHINE',
                'SOFTWARE\\WOW6432Node\\Blizzard Entertainment\\World of Warcraft',
                'InstallPath');
                if (!instPath) {
                throw new Error('empty registry key');
                }
                return Promise.resolve(instPath.value);
        }
        else if (id === WOW_RETAIL) {
            instPath = winapi.RegGetValue(
                'HKEY_LOCAL_MACHINE',
                'SOFTWARE\\WOW6432Node\\Blizzard Entertainment\\World of Warcraft',
                'InstallPath');
                if (!instPath) {
                throw new Error('empty registry key');
                }
                return Promise.resolve(instPath.value);
        }
        else throw new Error('Unrecognised game ID for World of Warcraft:' + id);
    }
    catch(err) {
        return undefined;
    }
    
}

function prepareForModding(discovery, id) {
    // Check addons folder (Classic)
    if (id === WOW_CLASSIC) return fs.ensureDirWritableAsync(path.join(discovery.path, '_classic_', 'Interface', 'AddOns'),
    () => Promise.resolve());

    // Check addons folder (Retail)
    if (id === WOW_RETAIL) return fs.ensureDirWritableAsync(path.join(discovery.path, '_retail_', 'Interface', 'AddOns'),
    () => Promise.resolve());

    // Somehow it's neither game.
    throw new Error('Unrecognised game ID for World of Warcraft:' + id);
}

function testWoWAddon(files, gameId) {
    // Installers run on all games, so we need to check that this is both one of our games and the archive includes at least one TOC file.
    const supported = ((gameId === WOW_CLASSIC) || (gameId === WOW_RETAIL)) && !!files.find(file => path.extname(file) === MOD_FILE_EXT);

    // Tell Vortex if this mod meets the criteria. 
    return Promise.resolve({
        supported,
        requiredFiles: []
    })
}

async function installWowAddon(files) {
    // See how many addons are in this archive.
    const tocFiles = files.filter(file => path.extname(file) === MOD_FILE_EXT);
    log('debug', `Found ${tocFiles.length} World of Warcraft addons`);
    
    // Map out each addons and it's included files.
    const addOns = tocFiles.map(toc => {
        const rootFolder = path.dirname(toc);
        const addonIndex = toc.indexOf(path.basename(toc));
        const addonFiles = files.filter(file =>
          (file.indexOf(rootFolder) !== -1)
          && (path.dirname(file) !== '.')
          && !file.endsWith(path.sep));
    
        return {
            toc,
            rootFolder,
            addonIndex,
            addonFiles,
        };
      });

    // Build instructions for Vortex to install these properly. 
    return Promise.map(addOns, addOn => {
        return addOn.addonFiles.map(file => {
            return {
                type: "copy",
                source: file,
                destination: file.substr(file.addonIndex)
            };
        });
    })
    .then(data => {
        const instructions = [].concat.apply([], data);
        return Promise.resolve({ instructions });
    });

}


function main(context) {

    // Register World of Warcraft as a game inside Vortex.
    context.registerGame({
        id: WOW_RETAIL,
        name: 'World of Warcraft',
        shortName: 'WoW',
        mergeMods: true,
        requiresCleanup: true,
        queryPath: findGame(WOW_RETAIL),
        queryModPath: () => path.join('_retail_','Interface', 'AddOns'),
        logo: 'gameart.jpg',
        executable: () => path.join('_retail_','wow.exe'),
        setup: (discovery) => prepareForModding(discovery, WOW_CLASSIC),
        supportedTools: [],
        requiredFiles: [
            path.join('_retail_','wow.exe')
        ],
        details: {}
    });

    // Register World of Warcraft Classic as a game inside Vortex.
    context.registerGame({
        id: WOW_CLASSIC,
        name: 'World of Warcraft Classic',
        shortName: 'WoW Classic',
        mergeMods: true,
        requiresCleanup: true,
        queryPath: findGame(WOW_CLASSIC),
        queryModPath: () => path.join('_classic_','Interface', 'AddOns'),
        logo: 'gameart-classic.jpg',
        executable: () => path.join('_classic_','WowClassic.exe'),
        setup: (discovery) => prepareForModding(discovery, WOW_CLASSIC),
        supportedTools: [],
        requiredFiles: [
            path.join('_classic_','WowClassic.exe')
        ],
        details: {
            nexusPageId: WOW_RETAIL
        }
    });

    /* 
    
    In this state, the extension will simply extract the contents of the archive to the "AddOns" folder. 
    Additional logic can be applied here to validate the files by using context.registerInstaller().

    */

    // This installer currently generates an error and I'm not sure why, so it's commented out. 
    context.registerInstaller('worldofwarcraft-addon', 25, testWoWAddon, installWowAddon);


    // Allows users to open CurseForge inside Vortex. 
    context.registerModSource('twitch', 'CurseForge', () => {
        context.api.store.dispatch(actions.showURL('https://www.curseforge.com/wow/addons'));
      }, 
        {
          condition: () => {
            //If this game is supported and marked enabled, we can show the button.
            const activeGameId = selectors.activeGameId(context.api.store.getState());
            return (activeGameId === WOW_RETAIL || activeGameId === WOW_CLASSIC);
          },
          icon: 'curseforge'
        }
      );
    
      context.once(() => {
        //Get the CurseForge anvil icon loaded!
        util.installIconSet('twitch-icons', path.join(__dirname, 'anvil.svg'));
      });
}

module.exports = {
    default: main,
  };
