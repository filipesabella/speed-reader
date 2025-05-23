import { Iterator } from './Iterator';
import { defaultSettings } from './Settings';

export function textToWords(text: string, wordAmount: number)
  : Iterator<string> {
  return new Iterator(text.split('\n')
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
    }, [] as string[]));
}

export function remainingTime(interval: number, words: Iterator<string>)
  : number {
  return words.reduceRemainder(
    (acc, word) => acc + timeoutForWord(interval, word), 0);
}

// this doesn't work great when the user chooses to display more than 1 word
// at at time. for instance if a word batch is "word. another", the period in
// the middle won't increase the timeout.
export function timeoutForWord(interval: number, word: string): number {
  let intervalMultiplier = 1;

  // give it a larger interval on stop chars (., ?, :, \n, etc)
  if (word.match(/\n$/)) {
    intervalMultiplier = 3;
  } else if (word.match(/[,\.\?\!\:]$/)) {
    intervalMultiplier = defaultSettings.punctuationDelayMultiplier < 1 ?
      1 : defaultSettings.punctuationDelayMultiplier; // don't allow < 1 on the multiplier
  }

  return interval * intervalMultiplier;
}
