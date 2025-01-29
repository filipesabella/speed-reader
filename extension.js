browser.browserAction.onClicked.addListener(runSpeedReader);

function runSpeedReader(){
  browser.storage.sync.get('speed-reader-settings').then(e => {
    const settings = {
      fontFamily: 'monospace',
      backgroundColor: 'hsl(0, 0%, 15%)',
      textColor: 'hsl(0, 0%, 90%)',
      middleLetterColor: 'hsl(25, 50%, 50%)',
      fontSize: '30px',
      fullScreen: false,
      width: '90%',
      height: 'auto',
      speedIncrement: 50,
      intialSpeed: 400,
      wordAmount: 1,
      ...(e['speed-reader-settings'] || {})
    };

    browser.tabs.executeScript({
      code: `
        window.speedReaderSettings = ${JSON.stringify(settings)};
      `
    });

    browser.tabs.executeScript({
      file: '/build/speed-reader.js'
    });
  });
}

// context menu
browser.contextMenus.create({
  id: "speed-reader",
  title: "Speed Reader",
  contexts: ["selection"]
});

browser.contextMenus.onClicked.addListener((info) => {
  if(info.menuItemId == "speed-reader")
    runSpeedReader();
});