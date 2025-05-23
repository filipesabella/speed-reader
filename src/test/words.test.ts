import { expect } from 'chai';
import { Iterator } from '../main/Iterator';
import { remainingTime, textToWords, timeoutForWord } from '../main/words';
import { defaultSettings } from '../main/Settings';

const interval = 100;
const newInterval = interval * defaultSettings.punctuationDelayMultiplier;

describe('words tests', () => {
  describe('timeoutForWord', () => {
    it('returns a bigger timeout for words ending in \\n', () => {
      const timeout = timeoutForWord(interval, 'hello\n');
      expect(timeout).to.equal(300);
    });

    it('returns a bigger timeout for words ending in stop symbols', () => {
      expect(timeoutForWord(interval, 'hello.')).to.equal(newInterval);
      expect(timeoutForWord(interval, 'hello,')).to.equal(newInterval);
      expect(timeoutForWord(interval, 'hello?')).to.equal(newInterval);
      expect(timeoutForWord(interval, 'hello!')).to.equal(newInterval);
      expect(timeoutForWord(interval, 'hello:')).to.equal(newInterval);
    });

    it('returns interval as timeout for other words', () => {
      expect(timeoutForWord(interval, 'hello')).to.equal(100);
      expect(timeoutForWord(interval, 'hello ')).to.equal(100);
      expect(timeoutForWord(interval, 'hello_')).to.equal(100);
    });
  });

  describe('remainingTime', () => {
    it('returns the remaining time for an iterator of words', () => {
      const words = new Iterator([
        'hello',     // interval
        'there!',    // interval * punctuationDelayMultiplier
        'friend\n',  // interval * 3
      ]);
      words.next();

      const time = remainingTime(interval, words);
      expect(time).to.equal(interval * 4 + interval * defaultSettings.punctuationDelayMultiplier);
    })
  });

  describe('textToWords', () => {
    it('returns a word iterator wordCount = 1', () => {
      const text = `hello there!

          friend, this
          text has; multiple words,

          periods. not followed by line break
        `;

      const words = textToWords(text, 1);

      expect(words.next()).to.equal('hello');
      expect(words.next()).to.equal('there!\n');
      expect(words.next()).to.equal('friend,');
      expect(words.next()).to.equal('this\n');
      expect(words.next()).to.equal('text');
      expect(words.next()).to.equal('has;');
      expect(words.next()).to.equal('multiple');
      expect(words.next()).to.equal('words,\n');
      expect(words.next()).to.equal('periods.');
      expect(words.next()).to.equal('not');
      expect(words.next()).to.equal('followed');
      expect(words.next()).to.equal('by');
      expect(words.next()).to.equal('line');
      expect(words.next()).to.equal('break\n');
      expect(words.ended()).to.be.true;
    });

    it('returns a word iterator with wordCount = 2', () => {
      const text = `hello there!

          friend, this
          text has; multiple words,

          periods. not followed by line break
        `;

      const words = textToWords(text, 2);

      expect(words.next()).to.equal('hello there!\n');
      expect(words.next()).to.equal('friend, this\n');
      expect(words.next()).to.equal('text has;');
      expect(words.next()).to.equal('multiple words,\n');
      expect(words.next()).to.equal('periods. not');
      expect(words.next()).to.equal('followed by');
      expect(words.next()).to.equal('line break\n');
      expect(words.ended()).to.be.true;
    });

  });
});
