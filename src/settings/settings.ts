import {
  defaultSettings,
  loadSettingsFromStorage,
  sanitiseSettings,
  saveSettingsInStorage,
  Settings,
} from '../main/Settings';

(function() {
  document.body.onload = () => {
    const form = document
      .querySelector<HTMLFormElement>('#speed-reader-settings form')!;

    // pressing enter in a field would otherwise submit and reload the page
    form.onsubmit = e => e.preventDefault();

    loadSettingsFromStorage().then(settings => {
      fillForm(form, settings);
      renderPreview(settings);

      const save = () =>
        saveSettingsInStorage(readSettingsFromForm()).then(renderPreview);

      form.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', save);
        input.addEventListener('keyup', save);
      });

      form.querySelector<HTMLInputElement>('input[name=fullScreen]')!
        .addEventListener('change', () => handleFullScreen(form));

      form.querySelector<HTMLButtonElement>('.reset')!.onclick = () => {
        if (confirm('Are you sure you want to reset the settings?')) {
          const defaults = { ...defaultSettings };
          fillForm(form, defaults);
          renderPreview(defaults);
          saveSettingsInStorage(defaults);
        }
      };
    });
  };

  function fillForm(form: HTMLFormElement, settings: Settings): void {
    form.querySelectorAll('input').forEach(input => {
      const attribute = input.name as keyof Settings;
      if (input.type === 'checkbox') {
        input.checked = settings[attribute] as boolean;
      } else {
        input.value = String(settings[attribute]);
      }
    });

    handleFullScreen(form);
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
    container.style.setProperty(
      '--middle-letter-color',
      settings.middleLetterColor,
    );
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
        const value = parseFloat(e.value);
        (settings as any)[attribute] = Number.isFinite(value)
          ? value
          : defaultSettings[attribute];
      } else {
        (settings as any)[attribute] = e.value;
      }
    });

    return sanitiseSettings(settings);
  }
})();
