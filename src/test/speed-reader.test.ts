// @vitest-environment jsdom
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

const hosts = () => document.querySelectorAll('#speed-reader-host');
const shadow = () => hosts()[0]!.shadowRoot!;
const middleLetter = () =>
  shadow().querySelector('.speed-reader-word-middle')!.textContent;
const press = (code: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', {
    code,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  window.dispatchEvent(event);
  return event;
};

const start = async () => {
  (window as any).startSpeedReader();
  // lets the settings promise resolve
  await vi.advanceTimersByTimeAsync(0);
};

describe('speed reader', () => {
  beforeAll(async () => {
    vi.useFakeTimers();
    // one word per second
    (window as any).speedReaderSettings = { initialSpeed: 60 };
    document.body.innerHTML = '<p>a b c d e f g h</p>';
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('p')!);
    window.getSelection()!.addRange(range);

    await import('../main/speed-reader');
    await vi.advanceTimersByTimeAsync(0);
  });

  beforeEach(start);
  afterEach(() => press('Escape'));

  it('shows a single reader when opened again', async () => {
    await start();
    expect(hosts()).toHaveLength(1);

    press('Escape');
    expect(hosts()).toHaveLength(0);
  });

  it('closes when clicking the backdrop', () => {
    shadow().querySelector<HTMLElement>('#speed-reader-container')!.click();
    expect(hosts()).toHaveLength(0);
  });

  it('keeps reading one word at a time after pausing and resuming', async () => {
    await vi.advanceTimersByTimeAsync(1000);
    expect(middleLetter()).toBe('a');

    press('Space');
    press('Space');
    await vi.advanceTimersByTimeAsync(1000);
    expect(middleLetter()).toBe('c');
  });

  it('changes speed before the first word is shown', () => {
    expect(() => press('ArrowUp')).not.toThrow();
    expect(
      shadow().querySelector('.speed-reader-speed-current')!.textContent,
    ).toBe('90');
  });

  it('leaves modified keys and other keys to the page', () => {
    expect(press('ArrowRight', { ctrlKey: true }).defaultPrevented)
      .toBe(false);
    expect(press('KeyA').defaultPrevented).toBe(false);
    expect(press('ArrowRight').defaultPrevented).toBe(true);
  });
});
