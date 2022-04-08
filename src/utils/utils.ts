type NonNullable<T> = T extends null | undefined ? never : T;

// Util to force TS to understand a value is truthy (ish)
export function myAssert<T>(
    value: T,
    message?: string
  ): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
      throw Error(message);
    }
  }
