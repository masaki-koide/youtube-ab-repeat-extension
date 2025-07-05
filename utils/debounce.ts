export function debounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function debounced(...args: Args) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = undefined
    }, wait)
  }
}
