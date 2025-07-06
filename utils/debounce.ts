interface DebouncedFunction<Args extends unknown[]> {
  (...args: Args): void
  cancel(): void
}

export function debounce<Args extends unknown[], Return>(
  func: (...args: Args) => Return,
  wait: number,
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const debounced = ((...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = undefined
    }, wait)
  }) as DebouncedFunction<Args>

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return debounced
}
