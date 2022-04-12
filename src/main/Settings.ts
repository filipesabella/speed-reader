// ATTENTION: when updating this key have to update extension.js as well
const SETTINGS_KEY = 'speed-reader-settings';

export type Settings = {
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  middleLetterColor: string;
  fontSize: string;
  fullScreen: boolean;
  width: string;
  height: string;
};

export const defaultSettings = {
  fontFamily: 'monospace',
  backgroundColor: 'hsl(0, 0%, 15%)',
  textColor: 'hsl(0, 0%, 90%)',
  middleLetterColor: 'hsl(25, 50%, 50%)',
  fontSize: '30px',
  fullScreen: false,
  width: '90%',
  height: 'auto',
};

export async function loadSettingsFromStorage(): Promise<Settings> {
  try {
    // the main script when running has this variable populated by extension.js
    if ((window as any).speedReaderSettings) {
      return (window as any).speedReaderSettings || defaultSettings;
    } else if (isExtensionContext()) { // when running the options page
      const value = await (window as any).browser.storage.sync
        .get({ [SETTINGS_KEY]: defaultSettings });
      return value[SETTINGS_KEY];
    } else { // when just running locally for testing
      return JSON.parse(localStorage.getItem(SETTINGS_KEY));
    }
  } catch (e) {
    console.error(e);
    return defaultSettings;
  }
}

export async function saveSettingsInStorage(settings: Settings)
  : Promise<Settings> {
  if (isExtensionContext()) {
    await (window as any).browser.storage.sync.set({
      [SETTINGS_KEY]: settings,
    });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  return settings;
}

function isExtensionContext(): boolean {
  return (window as any).browser !== undefined;
}
