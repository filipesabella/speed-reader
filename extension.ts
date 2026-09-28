import { defaultSettings, Settings } from "./src/main/Settings";

declare global {
  interface Window {
    speedReaderSettings: Settings;
  }
}

const browser = (globalThis as any).browser || (globalThis as any).chrome;

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "speed-reader",
    title: "Speed Reader",
    contexts: ["selection"],
  });
});

async function runSpeedReader(): Promise<void> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const settings = await browser.storage.sync.get("speed-reader-settings");
  const finalSettings: Settings = {
    ...defaultSettings,
    ...(settings["speed-reader-settings"] || {}),
  };

  // Inject settings into the page
  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: (settings: Settings) => {
      window.speedReaderSettings = settings;
    },
    args: [finalSettings],
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
      files: ["/build/speed-reader.js"],
    });
  }
}

browser.action.onClicked.addListener(runSpeedReader);

browser.contextMenus.onClicked.addListener((info: any) => {
  if (info.menuItemId == "speed-reader") {
    runSpeedReader();
  }
});
