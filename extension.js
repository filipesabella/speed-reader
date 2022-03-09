browser.browserAction.onClicked.addListener(() => {
  browser.storage.sync.get('speed-reader-settings').then(e => {
    browser.tabs.executeScript({
      code: `
        window.speedReaderSettings = ${JSON.stringify(e['speed-reader-settings'])};
      `
    });

    browser.tabs.executeScript({
      file: '/build/speed-reader.js'
    });
  });
});
