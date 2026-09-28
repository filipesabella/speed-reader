import { articleText } from './article';
import { Renderer } from './Renderer';
import {
  loadSettingsFromStorage,
  minimumSpeed,
} from './Settings';
import {
  textToWords,
  timeoutForWord,
} from './words';

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
  // text given by the extension (a selection inside an iframe) comes first,
  // then the selection, then the page's main article
  const given = (window as any).speedReaderText || '';
  const selection = window.getSelection()?.toString() || '';
  const text = [given, selection].find(t => t.trim())
    ?? articleText(document);
  if (!text.trim()) return;

  loadSettingsFromStorage().then(settings => {
    // only one reader at a time, even if this script got injected twice
    (window as any).stopSpeedReader?.();

    const words = textToWords(text, settings.wordAmount);
    const renderer = new Renderer(words, settings.punctuationDelayMultiplier);

    let speedInWPM = settings.initialSpeed;
    let interval = 60 * 1000 / settings.initialSpeed;
    let paused = false;
    let timer: number | undefined;
    const wakeLock = createWakeLock();

    const schedule = (timeout: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(loop, timeout);
    };

    const loop = () => {
      if (words.ended() || paused) {
        wakeLock.drop();
        return;
      }

      const nextWord = words.next();
      renderer.render(nextWord, speedInWPM, interval);

      schedule(
        timeoutForWord(
          interval,
          nextWord,
          settings.punctuationDelayMultiplier,
        ),
      );
    };

    const changeSpeed = (delta: number) => {
      speedInWPM = Math.max(minimumSpeed, speedInWPM + delta);
      interval = 60 * 1000 / speedInWPM;

      renderer.render(words.current(), speedInWPM, interval);
    };

    const navigateWord = () => {
      renderer.render(words.current(), speedInWPM, interval);
    };

    const togglePause = (pause?: boolean) => {
      paused = pause !== undefined ? pause : !paused;
      window.clearTimeout(timer);

      if (paused) {
        wakeLock.drop();
      } else {
        wakeLock.take();
        loop();
      }
    };

    const close = () => {
      togglePause(true);
      renderer.close();
      if ((window as any).stopSpeedReader === close) {
        (window as any).stopSpeedReader = undefined;
      }
    };

    (window as any).stopSpeedReader = close;

    wakeLock.take();
    renderer.initialize(settings, {
      togglePause,
      changeSpeed,
      navigateWord,
      close,
    });
    renderer.render(words.current(), speedInWPM, interval);

    schedule(interval);
  });
};

// used in test.html
(window as any).startSpeedReader = startSpeedReader;

startSpeedReader();
