import {
  defaultSettings,
  loadSettingsFromStorage,
  saveSettingsInStorage,
  Settings
} from "../main/Settings";

(function() {

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

})();

