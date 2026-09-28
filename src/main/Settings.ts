// ATTENTION: when updating this key have to update extension.js as well
const SETTINGS_KEY = 'speed-reader-settings';

export type Settings = {
  fontFamily: string,
  backgroundColor: string,
  textColor: string,
  middleLetterColor: string,
  fontSize: string,
  fullScreen: boolean,
  width: string,
  height: string,
  speedIncrement: number,
  initialSpeed: number,
  punctuationDelayMultiplier: number,
  wordAmount: number,
};

export const defaultSettings: Settings = {
  fontFamily: 'monospace',
  backgroundColor: 'hsl(0, 0%, 15%)',
  textColor: 'hsl(0, 0%, 90%)',
  middleLetterColor: 'hsl(25, 50%, 50%)',
  fontSize: '30px',
  fullScreen: false,
  width: '90%',
  height: 'auto',
  speedIncrement: 30,
  initialSpeed: 400,
  punctuationDelayMultiplier: 2,
  wordAmount: 1,
};

export const minimumSpeed = 50;

const numberOr = (value: unknown, fallback: number, minimum: number) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, number) : fallback;
};

const textOr = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback;

// stored settings come from a free-form options page (and older versions of
// it), so anything empty or out of range falls back to something usable
export function sanitiseSettings(settings: Settings): Settings {
  return {
    fontFamily: textOr(settings.fontFamily, defaultSettings.fontFamily),
    backgroundColor: textOr(
      settings.backgroundColor,
      defaultSettings.backgroundColor,
    ),
    textColor: textOr(settings.textColor, defaultSettings.textColor),
    middleLetterColor: textOr(
      settings.middleLetterColor,
      defaultSettings.middleLetterColor,
    ),
    fontSize: textOr(settings.fontSize, defaultSettings.fontSize),
    fullScreen: settings.fullScreen === true,
    width: textOr(settings.width, defaultSettings.width),
    height: textOr(settings.height, defaultSettings.height),
    speedIncrement: numberOr(
      settings.speedIncrement,
      defaultSettings.speedIncrement,
      1,
    ),
    initialSpeed: numberOr(
      settings.initialSpeed,
      defaultSettings.initialSpeed,
      minimumSpeed,
    ),
    punctuationDelayMultiplier: numberOr(
      settings.punctuationDelayMultiplier,
      defaultSettings.punctuationDelayMultiplier,
      1,
    ),
    wordAmount: Math.round(
      numberOr(settings.wordAmount, defaultSettings.wordAmount, 1),
    ),
  };
}

export async function loadSettingsFromStorage(): Promise<Settings> {
  try {
    // the main script when running has this variable populated by extension.js
    if ((window as any).speedReaderSettings) {
      return sanitiseSettings({
        ...defaultSettings,
        ...(window as any).speedReaderSettings,
      });
    } else if (isExtensionContext()) { // when running the options page
      const value = await (window as any).browser.storage.sync
        .get({ [SETTINGS_KEY]: defaultSettings });
      return sanitiseSettings({
        ...defaultSettings,
        ...value[SETTINGS_KEY],
      });
    } else { // when just running locally for testing
      return sanitiseSettings({
        ...defaultSettings,
        ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
      });
    }
  } catch (e) {
    console.error(e);
    return defaultSettings;
  }
}

export async function saveSettingsInStorage(
  settings: Settings,
): Promise<Settings> {
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
