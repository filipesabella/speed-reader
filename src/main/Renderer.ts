import { Iterator } from './iterator';
import { remainingTime } from './words';

const BG_COLOR = 'hsl(0, 0%, 15%)';
const TEXT_COLOR = 'hsl(0, 0%, 90%)';
const MIDDLE_LETTER_COLOR = 'hsl(25, 50%, 50%)';
const FONT_FAMILY = 'monospace';
const FONT_SIZE = '30px';

export class Renderer {
  words: Iterator<string>;

  container: HTMLDivElement;
  wordStart: HTMLDivElement;
  wordMiddle: HTMLDivElement;
  wordEnd: HTMLDivElement;
  timeContainer: HTMLDivElement;
  speedCurrent: HTMLDivElement;
  speedMinus: HTMLDivElement;
  speedPlus: HTMLDivElement;

  constructor(words: Iterator<string>) {
    this.words = words;
  }

  public initialise(
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void): void {
    this.removeUI();

    const style = document.createElement('style');
    style.textContent = require('./styles.css');
    document.head.append(style);

    document.body.innerHTML += require('./template.xhtml');

    this.container = findElement('');
    this.container.style.fontFamily = FONT_FAMILY;
    this.container.style.fontSize = FONT_SIZE;
    this.container.style.color = TEXT_COLOR;

    this.wordMiddle = findElement('.speed-reader-word-middle');
    this.wordMiddle.style.color = MIDDLE_LETTER_COLOR;

    findElement('.speed-reader-wrapper').style.backgroundColor = BG_COLOR;

    this.wordStart = findElement('.speed-reader-word-start');
    this.wordEnd = findElement('.speed-reader-word-end');
    this.timeContainer = findElement('.speed-reader-time');

    this.speedMinus = findElement('.speed-reader-speed-minus');
    this.speedPlus = findElement('.speed-reader-speed-plus');
    this.speedCurrent = findElement('.speed-reader-speed-current');

    this.bindEvents(togglePause, changeSpeed);
  }

  private bindEvents(
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void) {
    this.container.addEventListener('click', (e: MouseEvent) => {
      if ((e.target as HTMLDivElement).id === 'speed-reader-container') {
        stopAndHide();
      }
    });

    const eventHandlers = {
      'press': {
        'Space': togglePause,
      },
      'down': {
        'ArrowLeft': () => this.renderWord(this.words.previous()),
        'ArrowRight': () => this.renderWord(this.words.next()),
        'ArrowUp': () => changeSpeed(50),
        'ArrowDown': () => changeSpeed(-50),
      },
      'up': {
        'Escape': () => stopAndHide(),
      }
    };

    const handleEvent = (type: 'press' | 'down' | 'up') =>
      (e: KeyboardEvent) => {
        const handler = eventHandlers[type][e.code];
        if (handler) {
          e.preventDefault();
          handler();
        }
      };

    const onkeypress = handleEvent('press');
    const onkeydown = handleEvent('down');
    const onkeyup = handleEvent('up');

    document.addEventListener('keypress', onkeypress);
    document.addEventListener('keydown', onkeydown);
    document.addEventListener('keyup', onkeyup);

    this.speedMinus.addEventListener('click', () => changeSpeed(-50));
    this.speedPlus.addEventListener('click', () => changeSpeed(+50));

    const stopAndHide = () => {
      togglePause(true);
      this.removeUI();

      document.removeEventListener('keypress', onkeypress);
      document.removeEventListener('keydown', onkeydown);
      document.removeEventListener('keyup', onkeyup);
    };
  }

  public render(word: string, wpm: number, interval: number): void {
    this.renderPaused(wpm, interval);
    this.renderWord(word);
  }

  public renderPaused(wpm: number, interval: number) {
    this.renderTime(interval);
    this.speedCurrent.innerHTML = wpm + 'wpm';
  }

  private renderWord(word: string): void {
    let middleIndex = Math.floor(word.length / 2);

    // if the word ends in a punctuation mark, move the middle one character
    // back. it looks better.
    if (!!word.match(/[^a-zA-Z]\n?/)) middleIndex--;

    this.wordStart.innerHTML = word.substring(0, middleIndex);
    this.wordMiddle.innerHTML = word.charAt(middleIndex);
    this.wordEnd.innerHTML = word.substr(middleIndex + 1);
  }

  private renderTime(interval: number): void {
    const seconds = remainingTime(interval, this.words) / 1000;

    const readableTime = Math.floor(seconds / 60)
      + ':'
      + ('0' + Math.ceil(seconds % 60)).slice(-2);

    this.timeContainer.innerHTML = readableTime;
  }

  private removeUI(): void {
    this.container?.remove();
  }
}

function findElement(className: string): HTMLDivElement {
  const selector = `#speed-reader-container ${className}`;
  return document.querySelector(selector);
}
