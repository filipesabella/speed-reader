import { Readability } from '@mozilla/readability';

// leaf blocks only, so a <li> wrapping a <p> isn't read twice
const blockSelector = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre, dt, dd,'
  + ' figcaption, td, th';

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

// the main article of the page as one paragraph per line, so that paragraph
// ends get the same longer pause as line breaks in selected text.
// Readability mutates the document it's given, hence the clone.
export function articleText(doc: Document): string {
  const article = new Readability(doc.cloneNode(true) as Document).parse();
  if (!article?.content) return '';

  const content = new DOMParser()
    .parseFromString(article.content, 'text/html').body;

  const blocks = Array.from(content.querySelectorAll(blockSelector))
    .filter(block => !block.querySelector(blockSelector))
    .map(block => normalise(block.textContent ?? ''))
    .filter(text => !!text);

  return blocks.length
    ? blocks.join('\n')
    : normalise(article.textContent ?? '');
}
