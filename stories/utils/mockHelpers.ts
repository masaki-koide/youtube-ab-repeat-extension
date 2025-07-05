export function mockYouTubeEnvironment(isDark = false) {
  // Mock YouTube's dark theme attribute
  if (isDark) {
    document.documentElement.setAttribute('dark', '')
  } else {
    document.documentElement.removeAttribute('dark')
  }
}

export function cleanupMocks() {
  document.documentElement.removeAttribute('dark')
}