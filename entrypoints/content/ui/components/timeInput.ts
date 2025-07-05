import { formatTime, parseTime } from '~/utils/time'
import type { TimeInputElement } from '../../types/dom'
import { inputStyles, isDarkTheme } from '../styles'

interface TimeInputOptions {
  label: string
  value: number | null
  onChange: (value: number | null) => void
  onDoubleClick: () => number
}

export function createTimeInput(options: TimeInputOptions): TimeInputElement {
  const { label, onChange, onDoubleClick } = options
  let value = options.value

  const container = document.createElement('div') as TimeInputElement
  container.style.cssText = inputStyles.wrapper

  // Label
  const labelEl = document.createElement('label')
  labelEl.textContent = label
  labelEl.style.cssText = inputStyles.label(isDarkTheme())

  // Input container
  const inputContainer = document.createElement('div')
  inputContainer.style.cssText = inputStyles.container

  // Input
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = '00:00:00'
  input.value = value !== null ? formatTime(value) : ''
  input.style.cssText = inputStyles.input(isDarkTheme())

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

  // Clear button
  const clearBtn = document.createElement('button')
  clearBtn.type = 'button'
  clearBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 6 18"></path>
      <path d="m6 6 12 12"></path>
    </svg>
  `
  clearBtn.style.cssText = inputStyles.clearButton(
    isDarkTheme(),
    value !== null,
  )

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
    onChange(parsed)
    if (parsed === null) {
      target.value = ''
    } else {
      target.value = formatTime(parsed)
    }
  })

  input.addEventListener('dblclick', () => {
    const currentTime = onDoubleClick()
    onChange(currentTime)
    input.value = formatTime(currentTime)
  })

  clearBtn.addEventListener('click', () => {
    onChange(null)
    input.value = ''
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
