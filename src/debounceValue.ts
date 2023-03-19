/**
 * Invokes the callback function after a wait time beginning after the return function stops being called.
 * 
 * @param callback - Function to call when done debouncing
 * @param wait - Wait time
 * @returns - Function to be called (repeatedly) by the action to be debounced (window resize, etc)
 */
export function debounce<T extends unknown[], U>(
    callback: (...args: T) => PromiseLike<U> | U,
    wait: number
  ) {
    let state:
      | undefined
      | {
          timeout: ReturnType<typeof setTimeout>
          promise: Promise<U>
          resolve: (value: U | PromiseLike<U>) => void
          reject: (value: any) => void
          latestArgs: T
        } = undefined
  
    return (...args: T): Promise<U> => {
      if (!state) {
        state = {} as any
        state!.promise = new Promise((resolve, reject) => {
          state!.resolve = resolve
          state!.reject = reject
        })
      }
      clearTimeout(state!.timeout)
      state!.latestArgs = args
      state!.timeout = setTimeout(() => {
        const s = state!
        state = undefined
        try {
          s.resolve(callback(...s.latestArgs))
        } catch (e) {
          s.reject(e)
        }
      }, wait)
  
      return state!.promise
    }
  }