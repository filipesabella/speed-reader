import { Renderer } from './Renderer';
import { textToWords, timeoutForWord } from './words';

const DEFAULT_SPEED = 400;

(window as any).startSpeedReader = () => {
  const text = window.getSelection().toString();
  if (!text.trim()) return;

  const words = textToWords(text);
  const renderer = new Renderer(words);

  let speedInWPM = DEFAULT_SPEED;
  let interval = 60 * 1000 / DEFAULT_SPEED;
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

  renderer.initialize(togglePause, changeSpeed, navigateWord);

  const loop = () => {
    if (words.ended() || paused) return;

    const nextWord = words.next();
    renderer.render(nextWord, speedInWPM, interval);

    window.setTimeout(loop, timeoutForWord(interval, nextWord));
  };

  window.setTimeout(loop, interval);
};

(window as any).startSpeedReader();
