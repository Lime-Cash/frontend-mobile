import "jest-extended";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTruthy(): R;
      toBeNull(): R;
      not: Matchers<R>;
    }
  }
}
