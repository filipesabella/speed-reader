import { Iterator } from './Iterator';

export function textToWords(
  text: string,
  wordAmount: number,
): Iterator<string> {
  return new Iterator(
    text.split('\n')
      // all this to keep \n at the end of sentences to give a longer pause
      // after them. this is necessary because if we just split on /\s/, js
      // also splits on \n, removing that character
      .reduce((acc, line) => {
        const words = line.split(/\s/)
          .map(w => w.trim())
          .filter(w => !!w)
          .reduce((acc, w) => {
            if (!acc.length || acc[acc.length - 1].length === wordAmount) {
              acc.push([]);
            }

            const currentBatch = acc[acc.length - 1];
            currentBatch.push(w);

            return acc;
          }, [] as string[][])
          .map(words => words.join(' '));

        words[words.length - 1] += '\n';

        return [...acc, ...words];
      }, [] as string[]),
  );
}

export function remainingTime(
  interval: number,
  words: Iterator<string>,
  punctuationDelayMultiplier: number,
): number {
  return words.reduceRemainder(
    (acc, word) =>
      acc + timeoutForWord(interval, word, punctuationDelayMultiplier),
    0,
  );
}

// this doesn't work great when the user chooses to display more than 1 word
// at at time. for instance if a word batch is "word. another", the period in
// the middle won't increase the timeout.
//
// a multiplier of 1 disables the pauses altogether. line breaks get twice the
// extra delay of punctuation (3x with the default of 2).
export function timeoutForWord(
  interval: number,
  word: string,
  punctuationDelayMultiplier: number,
): number {
  // don't allow < 1 on the multiplier
  const multiplier = Math.max(1, punctuationDelayMultiplier || 1);

  // give it a larger interval on stop chars (., ?, :, \n, etc)
  const intervalMultiplier = word.match(/\n$/)
    ? 1 + (multiplier - 1) * 2
    : word.match(/[,\.\?\!\:]$/)
    ? multiplier
    : 1;

  return interval * intervalMultiplier;
}

// splits a word around the letter the eye should focus on
export function splitWord(word: string): [string, string, string] {
  // if the word ends in a punctuation mark, move the middle one character
  // back. it looks better.
  const endsInPunctuation = /[^\p{L}\p{N}]\n?$/u.test(word);
  const middle = Math.max(
    0,
    Math.floor(word.length / 2) - (endsInPunctuation ? 1 : 0),
  );
  const middleIndex = word.charAt(middle) === ' ' ? middle - 1 : middle;

  return [
    word.substring(0, middleIndex),
    word.charAt(middleIndex),
    word.substring(middleIndex + 1),
  ];
}

export function formatTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  return Math.floor(seconds / 60)
    + ':'
    + String(seconds % 60).padStart(2, '0');
}
