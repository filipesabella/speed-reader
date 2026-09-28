import {
  defaultSettings,
  Settings,
} from './src/main/Settings';

declare global {
  interface Window {
    speedReaderSettings: Settings;
    speedReaderText: string | null;
  }
}

const browser = (globalThis as any).browser || (globalThis as any).chrome;

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'speed-reader',
    title: 'Speed Reader',
    contexts: ['selection', 'page'],
  });
});

// text is only given when it can't be read from the top frame's selection
async function runSpeedReader(
  tab: { id?: number },
  text: string | null = null,
): Promise<void> {
  if (!tab?.id) return;

  const settings = await browser.storage.sync.get('speed-reader-settings');
  const finalSettings: Settings = {
    ...defaultSettings,
    ...(settings['speed-reader-settings'] || {}),
  };

  // Inject settings into the page, always overwriting the text so that a
  // previous run's doesn't linger
  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: (settings: Settings, text: string | null) => {
      window.speedReaderSettings = settings;
      window.speedReaderText = text;
    },
    args: [finalSettings, text],
  });

  // Check if the script is already loaded on this page
  const results = await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      if (typeof (window as any).startSpeedReader === 'function') {
        (window as any).startSpeedReader();
        return true;
      }
      return false;
    },
  });

  // First run on this tab — inject the script file (which auto-calls startSpeedReader)
  if (!results[0]?.result) {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/build/speed-reader.js'],
    });
  }
}

browser.action.onClicked.addListener((tab: any) => runSpeedReader(tab));

browser.contextMenus.onClicked.addListener((info: any, tab: any) => {
  if (info.menuItemId == 'speed-reader') {
    // the reader always opens in the top frame, which can't see a selection
    // made inside an iframe
    const inFrame = info.frameId > 0 && info.selectionText;
    runSpeedReader(tab, inFrame ? info.selectionText : null);
  }
});
