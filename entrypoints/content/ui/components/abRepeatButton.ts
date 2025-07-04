import type { ABRepeatButtonElement } from '../../types/dom'
import { buttonStyles } from '../styles'

export interface ABRepeatButtonOptions {
  enabled: boolean
  onClick: () => void
}

export function createABRepeatButton(
  options: ABRepeatButtonOptions,
): ABRepeatButtonElement {
  const { onClick } = options
  let enabled = options.enabled

  const button = document.createElement('button') as ABRepeatButtonElement
  button.setAttribute('aria-label', 'AB Repeat')
  button.title = 'AB Repeat'

  // SVG Icon
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="17 1 21 5 17 9"></polyline>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
      <polyline points="7 23 3 19 7 15"></polyline>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
  `

  // Apply base styles
  Object.assign(button.style, buttonStyles.base)
  button.style.color = enabled ? '#ff0000' : 'white'

  // Hover effect
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = buttonStyles.hover
  })

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'transparent'
  })

  // Click handler
  button.addEventListener('click', onClick)

  // Update function to change enabled state
  button._updateEnabled = (newEnabled: boolean) => {
    enabled = newEnabled
    button.style.color = enabled ? '#ff0000' : 'white'
  }

  return button
}
