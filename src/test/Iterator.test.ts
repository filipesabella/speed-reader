import { expect } from 'chai';
import { Iterator } from "../main/Iterator";

describe('Iterator', () => {
  let iterator = new Iterator(['a', 'b', 'c']);
  let empty = new Iterator([]);

  beforeEach(() => {
    iterator = new Iterator(['a', 'b', 'c']);
    empty = new Iterator([]);
  });

  it('returns the current element', () => {
    iterator.next();
    expect(iterator.current()).to.equal('a');
    expect(empty.current()).to.equal(undefined);
  });

  it('returns the next element', () => {
    iterator.next();
    expect(iterator.next()).to.equal('b');
    expect(empty.next()).to.equal(undefined);
  });

  it('returns the previous element', () => {
    iterator.next();
    iterator.next();
    expect(iterator.previous()).to.equal('a');
    expect(empty.previous()).to.equal(undefined);
  });

  it('returns if the iteration has ended', () => {
    expect(iterator.ended()).to.be.false;
    iterator.next();
    expect(iterator.ended()).to.be.false;
    iterator.next();
    expect(iterator.ended()).to.be.false;
    iterator.next();
    expect(iterator.ended()).to.be.true;

    expect(empty.ended()).to.be.true;
  });

  it('reduces from the current index', () => {
    iterator.next();
    iterator.next();

    const result = iterator.reduceRemainder((acc, e) => acc + e, '');
    expect(result).to.equal('bc');
  })
});
