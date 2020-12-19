browser.browserAction.onClicked.addListener(() => {
  browser
    .tabs.executeScript({
      file: '/build/speed-reader.js'
    });
})
