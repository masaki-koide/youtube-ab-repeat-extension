import type { ABRepeatState } from '../../types'
import type { ABRepeatFormElement, TimeInputElement } from '../../types/dom'
import { formStyles, isDarkTheme } from '../styles'
import { createTimeInput } from './timeInput'

interface ABRepeatFormOptions {
  state: ABRepeatState
  onStartTimeChange: (time: number | null) => void
  onEndTimeChange: (time: number | null) => void
  getCurrentTime: () => number
}

export function createABRepeatForm(
  options: ABRepeatFormOptions,
): ABRepeatFormElement {
  const { state, onStartTimeChange, onEndTimeChange, getCurrentTime } = options

  const form = document.createElement('div') as ABRepeatFormElement
  form.style.cssText = formStyles.container(isDarkTheme(), state.enabled)

  const content = document.createElement('div')
  content.style.cssText = formStyles.content

  const startInput = createTimeInput({
    label: 'A',
    value: state.startTime,
    onChange: onStartTimeChange,
    onDoubleClick: getCurrentTime,
  })

  const endInput = createTimeInput({
    label: 'B',
    value: state.endTime,
    onChange: onEndTimeChange,
    onDoubleClick: getCurrentTime,
  })

  content.appendChild(startInput)
  content.appendChild(endInput)
  form.appendChild(content)

  // Store references for updates
  form._startInput = startInput
  form._endInput = endInput
  form._updateState = (newState: ABRepeatState) => {
    form.style.cssText = formStyles.container(isDarkTheme(), newState.enabled)
    ;(startInput as TimeInputElement)._updateValue?.(newState.startTime)
    ;(endInput as TimeInputElement)._updateValue?.(newState.endTime)
  }

  return form
}
