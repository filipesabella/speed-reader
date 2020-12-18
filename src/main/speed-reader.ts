import { Renderer } from './Renderer';
import { textToWords, timeoutForWord } from './words';

const DEFAULT_SPEED = 400;

(window as any).start = () => {
  const text = window.getSelection().toString();
  if (!text.trim()) return;

  const words = textToWords(text);

  let interval = 0;
  let speedInWPM = 0;
  let paused = false;

  const changeSpeed = (delta: number) => {
    speedInWPM += delta;
    speedInWPM = Math.max(50, speedInWPM);

    interval = 60 * 1000 / speedInWPM;
  }
  changeSpeed(DEFAULT_SPEED);

  const togglePause = (pause?: boolean) => {
    paused = pause !== undefined ? pause : !paused;
  }

  const renderer = new Renderer(words);
  renderer.initialise(togglePause, changeSpeed);

  const loop = () => {
    if (words.ended()) return;

    if (paused) {
      renderer.render(words.current(), speedInWPM, interval);
      window.setTimeout(loop, 1);
      return;
    };

    const nextWord = words.next();
    renderer.render(nextWord, speedInWPM, interval);

    window.setTimeout(loop, timeoutForWord(interval, nextWord));
  };

  window.setTimeout(loop, interval);
};

(window as any).start();
