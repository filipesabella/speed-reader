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

export function loadSettingsFromStorage(): Settings {
  // browser.storage is within the extension context, localStorage is just
  // for easier testing
  try {
    const settings = isExtensionContext()
      ? (window as any).browser.storage.sync.get(SETTINGS_KEY)
      : JSON.parse(localStorage.getItem(SETTINGS_KEY));

    return settings && settings.fontFamily
      ? settings
      : defaultSettings;
  } catch (e) {
    console.error(e);
    return defaultSettings;
  }
}

export function saveSettingsInStorage(settings: Settings): void {
  if (isExtensionContext()) {
    (window as any).browser.storage.sync.set({ SETTINGS_KEY: settings });
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}

function isExtensionContext(): boolean {
  return (window as any).browser !== undefined;
}
