// @vitest-environment jsdom
import {
  describe,
  expect,
  it,
} from 'vitest';
import { articleText } from '../main/article';

const paragraph = (n: number) =>
  `Paragraph ${n} is long enough to look like real prose to Readability,`
  + ' which scores blocks by their length and their commas, so it needs'
  + ' a sentence or two, and then some more, before it counts.';

const page = (body: string) =>
  new DOMParser().parseFromString(
    `<html><head><title>A title</title></head><body>${body}</body></html>`,
    'text/html',
  );

describe('articleText', () => {
  it('returns the article paragraphs one per line, without the chrome', () => {
    const doc = page(`
      <nav><a href="/">Home</a> <a href="/about">About</a></nav>
      <article>
        <p>${paragraph(1)}</p>
        <p>${paragraph(2)}</p>
        <ul><li><p>A list item
          split over lines</p></li></ul>
        <p>${paragraph(3)}</p>
      </article>
      <footer>Copyright footer</footer>
    `);

    expect(articleText(doc).split('\n')).to.deep.equal([
      paragraph(1),
      paragraph(2),
      'A list item split over lines',
      paragraph(3),
    ]);
  });

  it('keeps the text around nested blocks on its own line', () => {
    const doc = page(`
      <article>
        <p>${paragraph(1)}</p>
        <ul><li>Parent item<ul><li>Child item</li></ul></li></ul>
        <blockquote>Quoted intro<p>${paragraph(2)}</p></blockquote>
        <div>Loose text <em>with emphasis</em><p>${
      paragraph(3)
    }</p>and after</div>
        <p>A line<br>broken in two</p>
      </article>
    `);

    expect(articleText(doc).split('\n')).to.deep.equal([
      paragraph(1),
      'Parent item',
      'Child item',
      'Quoted intro',
      paragraph(2),
      'Loose text with emphasis',
      paragraph(3),
      'and after',
      'A line',
      'broken in two',
    ]);
  });

  it('leaves the original document untouched', () => {
    const doc = page(`<article><p>${paragraph(1)}</p></article><nav>x</nav>`);
    const before = doc.body.innerHTML;

    articleText(doc);

    expect(doc.body.innerHTML).to.equal(before);
  });

  it('returns an empty string for pages without an article', () => {
    expect(articleText(page(''))).to.equal('');
  });
});
