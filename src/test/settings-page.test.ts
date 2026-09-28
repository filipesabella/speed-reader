// @vitest-environment jsdom
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { defaultSettings } from '../main/Settings';
import page from '../settings/settings.html?raw';

const storageKey = 'speed-reader-settings';
const stored = () => JSON.parse(localStorage.getItem(storageKey) ?? '{}');
const input = (name: string) =>
  document.querySelector<HTMLInputElement>(`input[name=${name}]`)!;
const settled = () => new Promise(resolve => setTimeout(resolve));

describe('settings page', () => {
  beforeAll(async () => {
    localStorage.clear();
    document.body.innerHTML = new DOMParser()
      .parseFromString(page, 'text/html').body.innerHTML;

    await import('../settings/settings');
    (document.body.onload as () => void)();
    await settled();
  });

  beforeEach(() => vi.restoreAllMocks());

  it('saves the full screen checkbox when clicked', async () => {
    input('fullScreen').click();
    await settled();

    expect(stored().fullScreen).to.equal(true);
    expect(input('width').disabled).to.equal(true);
  });

  it('does not submit the form when pressing enter or reset', () => {
    const form = document.querySelector('form')!;
    const submit = new Event('submit', { cancelable: true });
    form.dispatchEvent(submit);

    expect(submit.defaultPrevented).to.equal(true);
    expect(document.querySelector<HTMLButtonElement>('.reset')!.type)
      .to.equal('button');
  });

  it('writes the defaults back into the form on reset', async () => {
    input('fontSize').value = '50px';
    input('fontSize').dispatchEvent(new Event('change'));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    document.querySelector<HTMLButtonElement>('.reset')!.click();
    await settled();

    expect(input('fontSize').value).to.equal(defaultSettings.fontSize);
    expect(input('fullScreen').checked).to.equal(false);
    expect(stored()).to.deep.equal(defaultSettings);
  });
});
