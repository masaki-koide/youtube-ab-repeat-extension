import type { ABRepeatState } from '../types'
import type { ABRepeatButtonElement, ABRepeatFormElement } from '../types/dom'
import { createABRepeatButton } from './components/abRepeatButton'
import { createABRepeatForm } from './components/abRepeatForm'

interface DOMManagerOptions {
  onToggleRepeat: () => void
  onStartTimeChange: (time: number | null) => void
  onEndTimeChange: (time: number | null) => void
  getCurrentTime: () => number
}

interface DOMManager {
  insertButton(state: ABRepeatState): void
  insertForm(state: ABRepeatState): void
  updateUI(state: ABRepeatState): void
  cleanup(): void
}

export function createDOMManager(options: DOMManagerOptions): DOMManager {
  const { onToggleRepeat, onStartTimeChange, onEndTimeChange, getCurrentTime } =
    options

  let buttonContainer: HTMLElement | null = null
  let formContainer: HTMLElement | null = null
  let button: ABRepeatButtonElement | null = null
  let form: ABRepeatFormElement | null = null

  return {
    insertButton(state: ABRepeatState): void {
      const timeDisplay = document.querySelector('.ytp-time-display')
      if (!timeDisplay || buttonContainer) return

      buttonContainer = document.createElement('div')
      buttonContainer.className = 'yt-ab-repeat-button-container'
      buttonContainer.style.cssText =
        'display: inline-flex; align-items: center;'

      button = createABRepeatButton({
        enabled: state.enabled,
        onClick: onToggleRepeat,
      })

      buttonContainer.appendChild(button)
      timeDisplay.parentNode?.insertBefore(
        buttonContainer,
        timeDisplay.nextSibling,
      )
    },

    insertForm(state: ABRepeatState): void {
      if (formContainer) return

      const insertionPoints = [
        { selector: '#clarify-box', position: 'afterend' },
        { selector: '#below', position: 'afterbegin' },
        { selector: '#primary-inner', position: 'afterbegin' },
        { selector: '#columns #primary', position: 'afterbegin' },
      ]

      for (const { selector, position } of insertionPoints) {
        const target = document.querySelector(selector)
        if (target) {
          formContainer = document.createElement('div')
          formContainer.className = 'yt-ab-repeat-form-container'
          formContainer.style.cssText = 'width: 100%; margin: 0; padding: 0;'

          form = createABRepeatForm({
            state,
            onStartTimeChange,
            onEndTimeChange,
            getCurrentTime,
          })

          formContainer.appendChild(form)

          if (position === 'afterend') {
            target.parentNode?.insertBefore(formContainer, target.nextSibling)
          } else {
            target.insertBefore(formContainer, target.firstChild)
          }
          break
        }
      }
    },

    updateUI(state: ABRepeatState): void {
      // Update button
      if (button) {
        button._updateEnabled?.(state.enabled)
      }

      // Update form
      if (form) {
        form._updateState?.(state)
      }
    },

    cleanup(): void {
      buttonContainer?.remove()
      formContainer?.remove()

      buttonContainer = null
      formContainer = null
      button = null
      form = null
    },
  }
}
