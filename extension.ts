import browser from "webextension-polyfill";
import { defaultSettings, Settings } from "./src/main/Settings";

declare global {
  interface Window {
    speedReaderSettings: Settings;
  }
}

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

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    func: (settings: Settings) => {
      window.speedReaderSettings = settings;
    },
    args: [finalSettings],
  });

  await browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["/build/speed-reader.js"],
  });
}

browser.action.onClicked.addListener(runSpeedReader);

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId == "speed-reader") {
    runSpeedReader();
  }
});
