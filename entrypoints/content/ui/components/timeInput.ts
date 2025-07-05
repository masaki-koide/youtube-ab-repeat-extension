import { formatTime, parseTime } from '~/utils/time'
import type { TimeInputElement } from '../../types/dom'
import { inputStyles, isDarkTheme } from '../styles'

// Time adjustment step constants (in seconds)
const TIME_STEP = {
  DEFAULT: 1, // 1 second
  WITH_SHIFT: 10, // 10 seconds
  WITH_CTRL: 60, // 1 minute
} as const

export interface TimeInputOptions {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onDoubleClick: () => number
  getVideoDuration?: () => number
}

export function createTimeInput(options: TimeInputOptions): TimeInputElement {
  const { label, onChange, onDoubleClick } = options
  let value = options.value

  const container = document.createElement('div') as TimeInputElement
  container.style.cssText = inputStyles.wrapper

  // Label
  const labelEl = document.createElement('label')
  labelEl.textContent = label

  // Input container
  const inputContainer = document.createElement('div')
  inputContainer.style.cssText = inputStyles.container

  // Input
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = '00:00:00'
  input.value = value !== null ? formatTime(value) : ''

  // Clear button
  const clearBtn = document.createElement('button')
  clearBtn.type = 'button'
  clearBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `

  // Apply styles
  labelEl.style.cssText = inputStyles.label(isDarkTheme())
  input.style.cssText = inputStyles.input(isDarkTheme())
  clearBtn.style.cssText = inputStyles.clearButton(
    isDarkTheme(),
    value !== null,
  )

  // Focus styles
  input.addEventListener('focus', () => {
    input.style.borderColor = isDarkTheme()
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(0, 0, 0, 0.2)'
  })

  input.addEventListener('blur', () => {
    input.style.borderColor = isDarkTheme()
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)'
  })

  clearBtn.addEventListener('mouseenter', () => {
    clearBtn.style.backgroundColor = isDarkTheme()
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.1)'
  })

  clearBtn.addEventListener('mouseleave', () => {
    clearBtn.style.backgroundColor = isDarkTheme()
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)'
  })

  // Event handlers
  input.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement
    const parsed = parseTime(target.value)
    value = parsed // Update internal value
    onChange(parsed)
    if (parsed === null) {
      target.value = ''
    } else {
      target.value = formatTime(parsed)
    }
    updateClearButton()
  })

  input.addEventListener('dblclick', () => {
    const currentTime = onDoubleClick()
    value = currentTime // Update internal value
    onChange(currentTime)
    input.value = formatTime(currentTime)
    updateClearButton()
  })

  clearBtn.addEventListener('click', () => {
    value = null // Update internal value
    onChange(null)
    input.value = ''
    updateClearButton()
  })

  // Helper function to calculate time adjustment step
  const getTimeStep = (event: WheelEvent): number => {
    if (event.ctrlKey) return TIME_STEP.WITH_CTRL
    if (event.shiftKey) return TIME_STEP.WITH_SHIFT
    return TIME_STEP.DEFAULT
  }

  // Helper function to calculate new time value with bounds checking
  const calculateNewTime = (
    currentValue: number,
    deltaY: number,
    step: number,
  ): number | null => {
    const direction = deltaY > 0 ? 1 : -1 // positive deltaY = scroll down = increase
    const newValue = currentValue + direction * step

    // Check lower bound
    if (newValue < 0) return null

    // Check upper bound
    const maxDuration = options.getVideoDuration?.() ?? Number.MAX_SAFE_INTEGER
    if (newValue > maxDuration) return null

    return newValue
  }

  // Wheel event handler for scrolling time adjustment
  input.addEventListener('wheel', (e) => {
    e.preventDefault()

    const currentValue = value ?? 0
    const step = getTimeStep(e)
    const newValue = calculateNewTime(currentValue, e.deltaY, step)

    if (newValue === null) return

    value = newValue
    onChange(newValue)
    input.value = formatTime(newValue)
    updateClearButton()
  })

  // Update clear button visibility
  const updateClearButton = () => {
    clearBtn.style.display = value !== null ? 'flex' : 'none'
  }

  // Assemble
  inputContainer.appendChild(input)
  inputContainer.appendChild(clearBtn)
  container.appendChild(labelEl)
  container.appendChild(inputContainer)

  // Store references for updates
  container._updateValue = (newValue: number | null) => {
    value = newValue
    input.value = newValue !== null ? formatTime(newValue) : ''
    updateClearButton()
  }

  return container
}
