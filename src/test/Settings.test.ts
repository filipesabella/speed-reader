import {
  describe,
  expect,
  it,
} from 'vitest';
import {
  defaultSettings,
  sanitiseSettings,
  Settings,
} from '../main/Settings';

const settings = (overrides: Partial<Record<keyof Settings, unknown>>) =>
  ({ ...defaultSettings, ...overrides }) as Settings;

describe('sanitiseSettings', () => {
  it('keeps valid settings as they are', () => {
    const valid = settings({ initialSpeed: 600, wordAmount: 3 });
    expect(sanitiseSettings(valid)).to.deep.equal(valid);
  });

  it('raises speeds and amounts to their minimum', () => {
    const result = sanitiseSettings(settings({
      initialSpeed: 0,
      speedIncrement: -5,
      punctuationDelayMultiplier: 0.5,
      wordAmount: 0,
    }));

    expect(result.initialSpeed).to.equal(50);
    expect(result.speedIncrement).to.equal(1);
    expect(result.punctuationDelayMultiplier).to.equal(1);
    expect(result.wordAmount).to.equal(1);
  });

  it('rounds the word amount', () => {
    expect(sanitiseSettings(settings({ wordAmount: 1.5 })).wordAmount)
      .to.equal(2);
  });

  it('falls back to the defaults for empty or invalid values', () => {
    const result = sanitiseSettings(settings({
      fontSize: '  ',
      width: '',
      initialSpeed: 'fast',
      wordAmount: NaN,
      fullScreen: 'yes',
    }));

    expect(result.fontSize).to.equal(defaultSettings.fontSize);
    expect(result.width).to.equal(defaultSettings.width);
    expect(result.initialSpeed).to.equal(defaultSettings.initialSpeed);
    expect(result.wordAmount).to.equal(defaultSettings.wordAmount);
    expect(result.fullScreen).to.equal(false);
  });
});
