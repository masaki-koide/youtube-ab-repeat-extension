export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function parseTime(timeStr: string): number | null {
  const parts = timeStr.split(':').map((p) => Number.parseInt(p, 10))

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null
  }

  const [hours, minutes, seconds] = parts
  return hours * 3600 + minutes * 60 + seconds
}
