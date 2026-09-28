import { Renderer } from './Renderer';
import { loadSettingsFromStorage } from './Settings';
import { textToWords, timeoutForWord } from './words';

// keeps the screen on while reading. drop() before the request resolves still
// releases the lock once it arrives.
const createWakeLock = () => {
  let lock: Promise<WakeLockSentinel | undefined> | null = null;

  return {
    take: () => {
      lock = lock
        ?? navigator.wakeLock?.request('screen').catch(() => undefined)
        ?? null;
    },
    drop: () => {
      lock?.then(sentinel => sentinel?.release());
      lock = null;
    },
  };
};

const startSpeedReader = () => {
  const text = window.getSelection()?.toString() || '';
  if (!text.trim()) return;

  loadSettingsFromStorage().then(settings => {
    const words = textToWords(text, settings.wordAmount);
    const renderer = new Renderer(words, settings.punctuationDelayMultiplier);

    let speedInWPM = settings.initialSpeed;
    let interval = 60 * 1000 / settings.initialSpeed;
    let paused = false;
    const wakeLock = createWakeLock();

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

      if (paused) {
        wakeLock.drop();
      } else {
        wakeLock.take();
        loop();
      }
    }

    wakeLock.take();
    renderer.initialize(settings, togglePause, changeSpeed, navigateWord);

    const loop = () => {
      if (words.ended() || paused) {
        wakeLock.drop();
        return;
      }

      const nextWord = words.next();
      renderer.render(nextWord, speedInWPM, interval);

      window.setTimeout(loop, timeoutForWord(
        interval, nextWord, settings.punctuationDelayMultiplier));
    };

    window.setTimeout(loop, interval);
  });
};

// used in test.html
(window as any).startSpeedReader = startSpeedReader;

startSpeedReader();
