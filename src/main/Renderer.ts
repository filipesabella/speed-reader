import { Iterator } from './Iterator';
import { Settings } from './Settings';
import styles from './styles.css?raw';
import templateStr from './template.html?raw';
import {
  formatTime,
  remainingTime,
  splitWord,
} from './words';

export type Controls = {
  togglePause: (pause?: boolean) => void,
  changeSpeed: (delta: number) => void,
  navigateWord: () => void,
  close: () => void,
};

export class Renderer {
  private host?: HTMLElement;
  private unbindEvents?: () => void;
  private wordStartEl!: HTMLElement;
  private wordMiddleEl!: HTMLElement;
  private wordEndEl!: HTMLElement;
  private speedCurrentEl!: HTMLElement;
  private timeEl!: HTMLElement;

  constructor(
    private readonly words: Iterator<string>,
    private readonly punctuationDelayMultiplier: number,
  ) {}

  public initialize(settings: Settings, controls: Controls): void {
    this.close();

    // a shadow root keeps the page's css away from the reader and vice versa
    this.host = document.createElement('div');
    this.host.id = 'speed-reader-host';
    const root = this.host.attachShadow({ mode: 'open' });
    root.innerHTML = templateStr;
    const style = document.createElement('style');
    style.textContent = styles;
    root.prepend(style);

    const container = root.querySelector<HTMLElement>(
      '#speed-reader-container',
    )!;
    container.style.setProperty('--bg-color', settings.backgroundColor);
    container.style.setProperty('--text-color', settings.textColor);
    container.style.setProperty(
      '--middle-letter-color',
      settings.middleLetterColor,
    );
    container.style.setProperty('--font-family', settings.fontFamily);
    container.style.setProperty('--font-size', settings.fontSize);

    const wrapper = root.querySelector<HTMLElement>('.speed-reader-wrapper')!;
    wrapper.style.width = settings.fullScreen ? '100%' : settings.width;
    wrapper.style.height = settings.fullScreen ? '100%' : settings.height;

    const wordContainer = root.querySelector<HTMLElement>(
      '.speed-reader-word-container',
    )!;
    wordContainer.style.height = settings.fullScreen ? '90%' : 'auto';

    this.wordStartEl = root.querySelector('.speed-reader-word-start')!;
    this.wordMiddleEl = root.querySelector('.speed-reader-word-middle')!;
    this.wordEndEl = root.querySelector('.speed-reader-word-end')!;
    this.speedCurrentEl = root.querySelector('.speed-reader-speed-current')!;
    this.timeEl = root.querySelector('.speed-reader-time')!;

    // appended to <html> rather than <body> so that a transform on the body
    // can't turn the fixed overlay into a positioned one
    document.documentElement.append(this.host);

    // otherwise a focused field on the page would still be receiving the
    // keys meant for the reader
    (document.activeElement as HTMLElement | null)?.blur?.();

    this.unbindEvents = this.bindEvents(settings, controls, root);
  }

  public render(word: string | undefined, wpm: number, interval: number) {
    const [start, middle, end] = splitWord(word ?? '');

    this.wordStartEl.textContent = start;
    this.wordMiddleEl.textContent = middle;
    this.wordEndEl.textContent = end;
    this.speedCurrentEl.textContent = wpm.toString();
    this.timeEl.textContent = formatTime(
      remainingTime(interval, this.words, this.punctuationDelayMultiplier),
    );
  }

  public close(): void {
    this.unbindEvents?.();
    this.unbindEvents = undefined;
    this.host?.remove();
    this.host = undefined;
  }

  private bindEvents(
    settings: Settings,
    { togglePause, changeSpeed, navigateWord, close }: Controls,
    root: ShadowRoot,
  ): () => void {
    root.querySelector('#speed-reader-container')!
      .addEventListener('click', e => {
        if ((e.target as HTMLElement).id === 'speed-reader-container') close();
      });

    root.querySelector('.speed-reader-speed-minus')!
      .addEventListener('click', () => changeSpeed(-settings.speedIncrement));
    root.querySelector('.speed-reader-speed-plus')!
      .addEventListener('click', () => changeSpeed(settings.speedIncrement));

    const handlers: { [code: string]: () => void } = {
      'Space': () => togglePause(),
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
      'Escape': close,
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const handler = handlers[e.code];
      // leave shortcuts like ctrl+arrow to the browser and the page
      if (!handler || e.ctrlKey || e.altKey || e.metaKey) return;

      // the reader is modal, so the page shouldn't also react to these keys
      e.preventDefault();
      e.stopImmediatePropagation();

      // holding an arrow keeps stepping, holding space shouldn't flicker
      if (!e.repeat || e.code.startsWith('Arrow')) handler();
    };

    // capture phase, so the page can't swallow the keys before the reader
    window.addEventListener('keydown', onKeyDown, true);

    return () => window.removeEventListener('keydown', onKeyDown, true);
  }
}
