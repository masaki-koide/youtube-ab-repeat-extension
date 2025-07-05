import type { Meta, StoryObj } from '@storybook/html'
import { expect, userEvent, within } from '@storybook/test'
import { withTheme } from '~/stories/decorators/themeDecorator'
import { createABRepeatButton } from './abRepeatButton'

interface ABRepeatButtonArgs {
  enabled: boolean
  onClick?: () => void
}

const meta: Meta<ABRepeatButtonArgs> = {
  title: 'Components/ABRepeatButton',
  decorators: [withTheme],
  argTypes: {
    enabled: {
      control: 'boolean',
      description: 'Whether AB repeat is enabled',
      defaultValue: false,
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
}

export default meta
type Story = StoryObj<ABRepeatButtonArgs>

const renderButton = (args: ABRepeatButtonArgs): HTMLDivElement => {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    display: inline-flex;
    background-color: #0f0f0f;
    padding: 10px;
    border-radius: 8px;
  `

  const button = createABRepeatButton({
    enabled: args.enabled,
    onClick: args.onClick || (() => console.log('Button clicked')),
  })

  wrapper.appendChild(button)
  return wrapper
}

export const Default: Story = {
  args: {
    enabled: false,
  },
  render: renderButton,
}

export const Enabled: Story = {
  args: {
    enabled: true,
  },
  render: renderButton,
}

export const Interactive: Story = {
  args: {
    enabled: false,
  },
  render: (args) => {
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
      display: inline-flex;
      background-color: #0f0f0f;
      padding: 10px;
      border-radius: 8px;
    `

    let enabled = args.enabled
    const button = createABRepeatButton({
      enabled,
      onClick: () => {
        enabled = !enabled
        button._updateEnabled?.(enabled)
        console.log('AB Repeat toggled:', enabled)
      },
    })

    wrapper.appendChild(button)
    return wrapper
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Find button inside wrapper
    const button = canvas.getByRole('button')

    // Test initial state
    await expect(button).toHaveAttribute('aria-label', 'AB Repeat')
    await expect(button).toHaveStyle('color: rgb(255, 255, 255)')

    // Test click
    await userEvent.click(button)
    await expect(button).toHaveStyle('color: rgb(255, 0, 0)')

    // Test click again
    await userEvent.click(button)
    await expect(button).toHaveStyle('color: rgb(255, 255, 255)')
  },
}

export const WithHoverEffect: Story = {
  render: () => {
    const container = document.createElement('div')
    container.style.padding = '20px'
    container.style.backgroundColor = '#0f0f0f'
    container.innerHTML =
      '<p style="color: white; margin-bottom: 10px;">Hover over the button to see the effect</p>'

    const button = createABRepeatButton({
      enabled: false,
      onClick: () => console.log('Button clicked'),
    })

    container.appendChild(button)
    return container
  },
}
