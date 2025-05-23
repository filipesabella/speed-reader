import {
  defaultSettings,
  loadSettingsFromStorage,
  saveSettingsInStorage,
  Settings
} from "../main/Settings";

(function() {
  document.body.onload = () => {
    const container = document
      .querySelector<HTMLDivElement>('#speed-reader-settings form')!;
    loadSettingsFromStorage().then(settings => {
      container.querySelectorAll('input').forEach(e => {
        const attribute = e.name as keyof Settings;
        if (e.type === 'checkbox') {
          e.checked = settings[attribute] as boolean;
        } else {
          e.value = settings[attribute] as string;
        }

        e.onchange = e.onkeyup = () => {
          const settings = readSettingsFromForm();
          saveSettingsInStorage(settings).then(renderPreview);
        };
      });

      document
        .querySelector<HTMLButtonElement>('#speed-reader-settings .reset')!
        .onclick = () => {
          if (confirm('Are you sure you want to reset the settings?')) {
            const settings = { ...defaultSettings };
            saveSettingsInStorage(settings).then(renderPreview);
            renderPreview(settings);
          }
        };

      container.querySelector<HTMLInputElement>('input[name=fullScreen]')!
        .onchange = () => handleFullScreen(container);
      handleFullScreen(container);

      renderPreview(settings);
    });
  }

  function handleFullScreen(container: HTMLElement): void {
    const checked = container
      .querySelector<HTMLInputElement>('input[name=fullScreen]')!.checked;
    container.querySelector<HTMLInputElement>('input[name=width]')!
      .disabled = checked;
    container.querySelector<HTMLInputElement>('input[name=height]')!
      .disabled = checked;
  }

  function renderPreview(settings: Settings): void {
    const container = document
      .querySelector<HTMLDivElement>('#speed-reader-settings .preview')!;
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
      .querySelector<HTMLDivElement>('#speed-reader-settings form')!;
    const settings: Settings = { ...defaultSettings };
    container.querySelectorAll('input').forEach(e => {
      const attribute = e.name as keyof Settings;
      if (e.type === 'checkbox') {
        (settings as any)[attribute] = e.checked;
      } else if (e.type === 'number') {
        (settings as any)[attribute] =
          parseInt(e.value) || defaultSettings.speedIncrement;
      } else {
        (settings as any)[attribute] = e.value;
      }
    });

    return settings;
  }

})();

