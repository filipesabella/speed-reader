import { Iterator } from './Iterator';
import { Settings } from './Settings';
import styles from './styles.css?raw';
import templateStr from './template.html?raw';
import {
  formatTime,
  remainingTime,
  splitWord,
} from './words';

export class Renderer {
  private container!: HTMLDivElement;
  private wordStartEl!: HTMLDivElement;
  private wordMiddleEl!: HTMLDivElement;
  private wordEndEl!: HTMLDivElement;
  private speedCurrentEl!: HTMLSpanElement;
  private timeEl!: HTMLDivElement;

  constructor(
    private readonly words: Iterator<string>,
    private readonly punctuationDelayMultiplier: number,
  ) {}

  public initialize(
    settings: Settings,
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void,
    navigateWord: () => void,
  ): void {
    this.removeUI();

    const styleEl = document.createElement('style');
    styleEl.id = 'speed-reader-style';
    styleEl.textContent = styles;
    document.head.append(styleEl);

    document.body.insertAdjacentHTML('beforeend', templateStr);

    this.container = document.querySelector('#speed-reader-container')!;

    this.container.style.setProperty('--bg-color', settings.backgroundColor);
    this.container.style.setProperty('--text-color', settings.textColor);
    this.container.style.setProperty(
      '--middle-letter-color',
      settings.middleLetterColor,
    );
    this.container.style.setProperty('--font-family', settings.fontFamily);
    this.container.style.setProperty('--font-size', settings.fontSize);

    const wrapper = this.container.querySelector(
      '.speed-reader-wrapper',
    ) as HTMLElement;
    wrapper.style.width = settings.fullScreen ? '100%' : settings.width;
    wrapper.style.height = settings.fullScreen ? '100%' : settings.height;

    const wordContainer = this.container.querySelector(
      '.speed-reader-word-container',
    ) as HTMLElement;
    wordContainer.style.height = settings.fullScreen ? '90%' : 'auto';
    this.wordStartEl = this.container.querySelector(
      '.speed-reader-word-start',
    )!;
    this.wordMiddleEl = this.container.querySelector(
      '.speed-reader-word-middle',
    )!;
    this.wordEndEl = this.container.querySelector('.speed-reader-word-end')!;
    this.speedCurrentEl = this.container.querySelector(
      '.speed-reader-speed-current',
    )!;
    this.timeEl = this.container.querySelector('.speed-reader-time')!;

    this.bindEvents(
      settings,
      togglePause,
      changeSpeed,
      navigateWord,
      document
        .querySelector('#speed-reader-container .speed-reader-speed-minus')!,
      document
        .querySelector('#speed-reader-container .speed-reader-speed-plus')!,
    );
  }

  public render(word: string, wpm: number, interval: number): void {
    const time = this.renderTime(interval);
    const [start, middle, end] = splitWord(word);

    this.wordStartEl.textContent = start;
    this.wordMiddleEl.textContent = middle;
    this.wordEndEl.textContent = end;
    this.speedCurrentEl.textContent = wpm.toString();
    this.timeEl.textContent = time;
  }

  private bindEvents(
    settings: Settings,
    togglePause: (pause?: boolean) => void,
    changeSpeed: (delta: number) => void,
    navigateWord: () => void,
    speedMinusButton: HTMLDivElement,
    speedPlusButton: HTMLDivElement,
  ) {
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
        'ArrowUp': () => changeSpeed(settings.speedIncrement),
        'ArrowDown': () => changeSpeed(-settings.speedIncrement),
      },
      'up': {
        'Escape': () => stopAndHide(),
      },
    };

    const handleEvent =
      (type: 'press' | 'down' | 'up') => (e: KeyboardEvent) => {
        const handler =
          (eventHandlers[type] as { [key: string]: () => void })[e.code];
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

    speedMinusButton.addEventListener(
      'click',
      () => changeSpeed(-settings.speedIncrement),
    );
    speedPlusButton.addEventListener(
      'click',
      () => changeSpeed(settings.speedIncrement),
    );

    const stopAndHide = () => {
      togglePause(true);
      this.removeUI();

      document.removeEventListener('keypress', onkeypress);
      document.removeEventListener('keydown', onkeydown);
      document.removeEventListener('keyup', onkeyup);
    };
  }

  private renderTime(interval: number): string {
    return formatTime(
      remainingTime(interval, this.words, this.punctuationDelayMultiplier),
    );
  }

  private removeUI(): void {
    this.container?.remove();
    document.getElementById('speed-reader-style')?.remove();
  }
}
