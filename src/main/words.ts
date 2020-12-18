import { Iterator } from "./Iterator";

export function textToWords(text: string): Iterator<string> {
  return new Iterator(text.split('\n')
    // all this to keep \n at the end of sentences to give a longer pause
    // after them.
    .reduce((acc, line) => {
      const words = line.split(/\s/)
        .map(w => w.trim())
        .filter(w => !!w);
      words[words.length - 1] += '\n';
      return [...acc, ...words];
    }, [] as string[]));
}

export function remainingTime(interval: number, words: Iterator<string>)
  : number {
  return words.reduceRemainder(
    (acc, word) => acc + timeoutForWord(interval, word), 0);
}

export function timeoutForWord(interval: number, word: string): number {
  let intervalMultiplier = 1;

  // give it a larger interval on stop chars (., ?, :, \n, etc)
  if (word.match(/\n$/)) {
    intervalMultiplier = 3;
  } else if (word.match(/[,\.\?\:]$/)) {
    intervalMultiplier = 2;
  }

  return interval * intervalMultiplier;
}
