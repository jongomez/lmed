/**
 * @param f callback
 * @param wait milliseconds
 * @param promiseRejectValue when the promise is rejected, it will be rejected with this value.
 * @returns Promise
 */
export function debouncePromise<T extends (...args: any[]) => any>(
  fetchSuggestion: T,
  delayBeforeFetching: number,
  promiseRejectValue: any = undefined
) {
  let cancelPreviousFetch: () => void | undefined;

  // type Awaited<T> = T extends PromiseLike<infer U> ? U : T
  type ReturnT = Awaited<ReturnType<T>>;
  const wrapFunc = (...args: Parameters<T>): Promise<ReturnT> => {
    cancelPreviousFetch?.();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => resolve(fetchSuggestion(...args)),
        delayBeforeFetching
      );

      cancelPreviousFetch = () => {
        clearTimeout(timer);

        if (promiseRejectValue !== undefined) {
          reject(promiseRejectValue);
        }
      };
    });
  };

  return wrapFunc;
}
