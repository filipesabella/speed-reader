import { expect } from 'chai';
import { Iterator } from '../main/Iterator';
import { remainingTime, textToWords, timeoutForWord } from '../main/words';

const interval = 100;

describe('words tests', () => {
  describe('timeoutForWord', () => {
    it('returns a bigger timeout for words ending in \\n', () => {
      const timeout = timeoutForWord(interval, 'hello\n');
      expect(timeout).to.equal(300);
    });

    it('returns a bigger timeout for words ending in stop symbols', () => {
      expect(timeoutForWord(interval, 'hello.')).to.equal(200);
      expect(timeoutForWord(interval, 'hello,')).to.equal(200);
      expect(timeoutForWord(interval, 'hello?')).to.equal(200);
      expect(timeoutForWord(interval, 'hello!')).to.equal(200);
      expect(timeoutForWord(interval, 'hello:')).to.equal(200);
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
        'hello',
        'there!',
        'friend\n',
      ]);
      words.next();

      const time = remainingTime(interval, words);
      expect(time).to.equal(600);
    })
  });

  describe('textToWords', () => {
    it('returns a word iterator', () => {
      const text = `hello there!

        friend
      `;

      const words = textToWords(text);

      expect(words.next()).to.equal('hello');
      expect(words.next()).to.equal('there!\n');
      expect(words.next()).to.equal('friend\n');
    })
  })
});
