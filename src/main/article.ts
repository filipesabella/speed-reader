import { Readability } from '@mozilla/readability';

const blockSelector = [
  'address',
  'article',
  'aside',
  'blockquote',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'li',
  'main',
  'ol',
  'p',
  'pre',
  'section',
  'table',
  'td',
  'th',
  'tr',
  'ul',
].join(', ');

// a run of text and the block it belongs to. a line break is its own piece
type Piece = { block: Element | null, text: string } | 'break';

const pieces = (root: Element): Piece[] => {
  const walker = root.ownerDocument.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
  );
  const nodes: Node[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  return nodes.flatMap((node): Piece[] =>
    node.nodeName === 'BR'
      ? ['break']
      : node.nodeType === Node.TEXT_NODE
      ? [{
        block: node.parentElement?.closest(blockSelector) ?? null,
        text: node.textContent ?? '',
      }]
      : []
  );
};

// text only joins the previous line while it stays in the same block, so the
// text around a nested block (a list item's label before its sub-list, a
// blockquote's intro before its paragraphs) keeps its own line
const toLines = (pieces: Piece[]): string[] =>
  pieces.reduce(
    ({ lines, block }, piece) =>
      piece === 'break'
        ? { lines: [...lines, ''], block: undefined }
        : piece.block === block
        ? {
          lines: [...lines.slice(0, -1), lines[lines.length - 1] + piece.text],
          block,
        }
        : { lines: [...lines, piece.text], block: piece.block },
    { lines: [] as string[], block: undefined as Element | null | undefined },
  ).lines;

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

// the main article of the page as one paragraph per line, so that paragraph
// ends get the same longer pause as line breaks in selected text.
// Readability mutates the document it's given, hence the clone.
export function articleText(doc: Document): string {
  const article = new Readability(doc.cloneNode(true) as Document).parse();
  if (!article?.content) return '';

  const content = new DOMParser()
    .parseFromString(article.content, 'text/html').body;

  return toLines(pieces(content))
    .map(normalise)
    .filter(line => !!line)
    .join('\n');
}
