type Settings = {
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
  middleLetterColor: string;
  fontSize: string;
  fullScreen: boolean;
  width: string;
  height: string;
};

(function() {
  const SETTINGS_KEY = 'speed-reader-settings';

  const defaultSettings = {
    fontFamily: 'monospace',
    backgroundColor: 'hsl(0, 0%, 15%)',
    textColor: 'hsl(0, 0%, 90%)',
    middleLetterColor: 'hsl(25, 50%, 50%)',
    fontSize: '30px',
    fullScreen: false,
    width: '90%',
    height: 'auto',
  };

  document.body.onload = () => {
    const container = document
      .querySelector<HTMLDivElement>('#speed-reader-settings form');
    const settings = loadSettingsFromStorage();

    container.querySelectorAll('input').forEach(e => {
      const attribute = e.name;
      if (e.type === 'checkbox') {
        e.checked = settings[attribute];
      } else {
        e.value = settings[attribute];
      }

      e.onchange = e.onkeyup = () => {
        const settings = readSettingsFromForm();
        saveSettingsInStorage(settings);
        renderPreview(settings);
      };
    });

    document
      .querySelector<HTMLButtonElement>('#speed-reader-settings .reset')
      .onclick = () => {
        if (confirm('Are you sure you want to reset the settings?')) {
          const settings = { ...defaultSettings };
          saveSettingsInStorage(settings);
          renderPreview(settings);
        }
      };

    container.querySelector<HTMLInputElement>('input[name=fullScreen]')
      .onchange = () => handleFullScreen(container);
    handleFullScreen(container);

    renderPreview(settings);
  }

  function handleFullScreen(container: HTMLElement): void {
    const checked = container
      .querySelector<HTMLInputElement>('input[name=fullScreen]').checked;
    container
      .querySelector<HTMLInputElement>('input[name=width]').disabled = checked;
    container
      .querySelector<HTMLInputElement>('input[name=height]').disabled = checked;
  }

  function renderPreview(settings: Settings): void {
    const container = document
      .querySelector<HTMLDivElement>('#speed-reader-settings .preview');
    container.style.setProperty('--bg-color', settings.backgroundColor);
    container.style.setProperty('--font-family', settings.fontFamily);
    container.style.setProperty('--font-size', settings.fontSize);
    container.style.setProperty('--text-color', settings.textColor);
    container.style.setProperty('--middle-letter-color',
      settings.middleLetterColor);
    container.style.setProperty('--width', settings.width);
    container.style.setProperty('--height', settings.height);
  }

  function readSettingsFromForm(): Settings {
    const container = document
      .querySelector<HTMLDivElement>('#speed-reader-settings form');
    const settings = { ...defaultSettings };
    container.querySelectorAll('input').forEach(e => {
      const attribute = e.name;
      settings[attribute] = e.type === 'checkbox' ? e.checked : e.value;
    });

    return settings;
  }

  function loadSettingsFromStorage(): Settings {
    // browser.storage is within the extension context, localStorage is just
    // for easier testing
    try {
      const settings = isExtensionContext()
        ? (window as any).browser.storage.sync.get(SETTINGS_KEY)
        : JSON.parse(localStorage.getItem(SETTINGS_KEY));

      return settings ?? defaultSettings;
    } catch (e) {
      console.error(e);
      return defaultSettings;
    }
  }

  function saveSettingsInStorage(settings: Settings): void {
    if (isExtensionContext()) {
      (window as any).browser.storage.sync.set({ SETTINGS_KEY: settings });
    } else {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }

  function isExtensionContext(): boolean {
    return (window as any).browser !== undefined;
  }
})();

