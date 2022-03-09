import { Iterator } from './Iterator';
import { loadSettingsFromStorage, Settings } from './Settings';
import { remainingTime } from './words';

export class Renderer {
  private container: HTMLDivElement;

  constructor(private readonly words: Iterator<string>) { }

  public initialize(
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void,
    navigateWord: () => void): void {
    this.removeUI();

    const style = document.createElement('style');
    style.textContent = styles(loadSettingsFromStorage());
    document.head.append(style);

    document.body.innerHTML += `
      <div id="speed-reader-container">
        ${template('&nbsp;', '', '', 0, '')}
      </div>
    `;

    this.container = document.querySelector('#speed-reader-container');

    this.bindEvents(
      togglePause,
      changeSpeed,
      navigateWord,
      document
        .querySelector('#speed-reader-container .speed-reader-speed-minus'),
      document
        .querySelector('#speed-reader-container .speed-reader-speed-plus'));
  }

  public render(word: string, wpm: number, interval: number): void {
    const time = this.renderTime(interval);
    const [start, middle, end] = this.renderWord(word);

    this.container.innerHTML = template(start, middle, end, wpm, time);
  }

  private bindEvents(
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void,
    navigateWord: () => void,
    speedMinusButton: HTMLDivElement,
    speedPlusButton: HTMLDivElement) {
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
        'ArrowLeft': () => {
          this.words.previous();
          navigateWord();
        },
        'ArrowRight': () => {
          this.words.next();
          navigateWord();
        },
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

    speedMinusButton.addEventListener('click', () => changeSpeed(-50));
    speedPlusButton.addEventListener('click', () => changeSpeed(+50));

    const stopAndHide = () => {
      togglePause(true);
      this.removeUI();

      document.removeEventListener('keypress', onkeypress);
      document.removeEventListener('keydown', onkeydown);
      document.removeEventListener('keyup', onkeyup);
    };
  }

  private renderWord(word: string): [string, string, string] {
    let middleIndex = Math.floor(word.length / 2);

    // if the word ends in a punctuation mark, move the middle one character
    // back. it looks better.
    if (!!word.match(/[^a-zA-Z]\n?/)) middleIndex--;

    return [
      word.substring(0, middleIndex),
      word.charAt(middleIndex),
      word.substr(middleIndex + 1),
    ];
  }

  private renderTime(interval: number): string {
    const seconds = remainingTime(interval, this.words) / 1000;

    const readableTime = Math.floor(seconds / 60)
      + ':'
      + ('0' + Math.ceil(seconds % 60)).slice(-2);

    return readableTime;
  }

  private removeUI(): void {
    this.container?.remove();
  }
}

const template = (
  start: string,
  middle: string,
  end: string,
  wpm: number,
  time: string,) =>
  `<div class="speed-reader-wrapper">
    <div class="speed-reader-word-container">
      <div class="speed-reader-word-start">${start}</div>
      <div class="speed-reader-word-middle">${middle}</div>
      <div class="speed-reader-word-end">${end}</div>
    </div>
    <div class="speed-reader-controls">
      <div class="speed-reader-speed">
        <span class="speed-reader-speed-minus">-</span>
        <span class="speed-reader-speed-current">${wpm}</span>
        <span class="speed-reader-speed-plus">+</span>
      </div>
      <div class="speed-reader-time">${time}</div>
    </div>
  </div>`;

const styles = (settings: Settings) => `
#speed-reader-container {
  --bg-color: ${settings.backgroundColor};
  --text-color: ${settings.textColor};
  --middle-letter-color: ${settings.middleLetterColor};
  --font-family: ${settings.fontFamily};
  --font-size: ${settings.fontSize};
}

#speed-reader-container {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  background: rgba(128, 128, 128, .50);

  color: var(--text-color);
  font-family: var(--font-family);
  font-size: var(--font-size);
}

#speed-reader-container .speed-reader-wrapper {
  padding: 10px;
  width: ${settings.fullScreen ? '100%' : settings.width};
  height: ${settings.fullScreen ? '100%' : settings.height};
  position: relative;
  background: var(--bg-color);
}

#speed-reader-container .speed-reader-word-container {
  display: flex;
  margin: 20px 0px;
}

#speed-reader-container .speed-reader-word-start {
  flex: 1;
  text-align: right;
}

#speed-reader-container .speed-reader-word-end {
  flex: 1;
  text-align: left;
}

#speed-reader-container .speed-reader-word-middle {
  flex: 0;
  color: var(--middle-letter-color);
}

#speed-reader-container .speed-reader-controls {
  font-size: 12px;
  display: flex;
}

#speed-reader-container .speed-reader-speed {
  flex: 1;
}

#speed-reader-container .speed-reader-speed-plus,
#speed-reader-container .speed-reader-speed-minus {
  cursor: pointer;
  user-select: none;
  display: inline-block;
  width: 15px;
  text-align: center;
}
`;
