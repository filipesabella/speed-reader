export class Iterator<T> {
  array: T[];
  index: number;

  constructor(array: T[]) {
    this.array = array;
    this.index = -1;
  }

  public previous(): T {
    this.index = Math.max(0, this.index - 1);
    return this.array[this.index];
  }

  public next(): T {
    this.index = Math.min(this.array.length - 1, this.index + 1);
    return this.array[this.index];
  }

  public ended(): boolean {
    return this.index === this.array.length - 1;
  }

  public reduceRemainder<K>(fn: (acc: K, curr: T) => K, initialValue: K) {
    return this.array.slice(this.index).reduce(fn, initialValue);
  }
}
