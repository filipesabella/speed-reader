import { Renderer } from './Renderer';
import { loadSettingsFromStorage } from './Settings';
import { textToWords, timeoutForWord } from './words';

const startSpeedReader = () => {
  const text = window.getSelection()?.toString() || '';
  if (!text.trim()) return;

  loadSettingsFromStorage().then(settings => {
    const words = textToWords(text, settings.wordAmount);
    const renderer = new Renderer(words);

    let speedInWPM = settings.initialSpeed;
    let interval = 60 * 1000 / settings.initialSpeed;
    let paused = false;

    const changeSpeed = (delta: number) => {
      speedInWPM += delta;
      speedInWPM = Math.max(50, speedInWPM);

      interval = 60 * 1000 / speedInWPM;

      renderer.render(words.current(), speedInWPM, interval);
    }

    const navigateWord = () => {
      renderer.render(words.current(), speedInWPM, interval);
    }

    const togglePause = (pause?: boolean) => {
      paused = pause !== undefined ? pause : !paused;

      !paused && loop();
    }

    renderer.initialize(settings, togglePause, changeSpeed, navigateWord);

    const loop = () => {
      if (words.ended() || paused) return;

      const nextWord = words.next();
      renderer.render(nextWord, speedInWPM, interval);

      window.setTimeout(loop, timeoutForWord(interval, nextWord));
    };

    window.setTimeout(loop, interval);
  });
};

// used in test.html
(window as any).startSpeedReader = startSpeedReader;

startSpeedReader();
