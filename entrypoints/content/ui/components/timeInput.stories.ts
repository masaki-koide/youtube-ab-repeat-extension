import type { Meta, StoryObj } from '@storybook/html'
import { expect, userEvent, within } from '@storybook/test'
import type { TimeInputElement } from '~/entrypoints/content/types/dom'
import { withTheme } from '~/stories/decorators/themeDecorator'
import { createTimeInput } from './timeInput'

interface TimeInputArgs {
  label: string
  value: number | null
  onChange?: (value: number | null) => void
  onDoubleClick?: () => number
}

const meta: Meta<TimeInputArgs> = {
  title: 'Components/TimeInput',
  decorators: [withTheme],
  argTypes: {
    label: {
      control: 'text',
      description: 'Input label (A or B)',
      defaultValue: 'A',
    },
    value: {
      control: 'number',
      description: 'Time value in seconds',
      defaultValue: null,
    },
    onChange: {
      action: 'changed',
      description: 'Value change handler',
    },
    onDoubleClick: {
      action: 'doubleClicked',
      description: 'Double click handler to get current time',
    },
  },
}

export default meta
type Story = StoryObj<TimeInputArgs>

const createDefaultHandlers = (args: TimeInputArgs) => ({
  onChange:
    args.onChange ||
    ((value: number | null) => console.log('Changed to:', value)),
  onDoubleClick:
    args.onDoubleClick ||
    (() => {
      console.log('Double clicked, returning current time: 125')
      return 125
    }),
})

const renderTimeInput = (args: TimeInputArgs): TimeInputElement => {
  const input = createTimeInput({
    label: args.label,
    value: args.value,
    ...createDefaultHandlers(args),
  })
  return input
}

export const Empty: Story = {
  args: {
    label: 'A',
    value: null,
  },
  render: renderTimeInput,
}

export const WithValue: Story = {
  args: {
    label: 'B',
    value: 125, // 2:05
  },
  render: renderTimeInput,
}

export const Interactive: Story = {
  args: {
    label: 'A',
    value: null,
  },
  render: (args) => {
    let currentValue = args.value
    const input = createTimeInput({
      label: args.label,
      value: currentValue,
      onChange: (value) => {
        currentValue = value
        console.log('Value changed to:', value)
        input._updateValue?.(value)
      },
      onDoubleClick: () => {
        const mockTime = 180 // 3:00
        console.log('Getting current time:', mockTime)
        return mockTime
      },
    })
    return input
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('00:00:00') as HTMLInputElement

    // Test typing a valid time
    await userEvent.clear(input)
    await userEvent.type(input, '01:30:45')
    await userEvent.tab() // Trigger change event
    await expect(input).toHaveValue('01:30:45')

    // Test clear button appears
    const clearButton = canvas.getByRole('button')
    await expect(clearButton).toBeVisible()

    // Test clearing
    await userEvent.click(clearButton)
    await expect(input).toHaveValue('')
  },
}

export const DoubleClickDemo: Story = {
  render: () => {
    const container = document.createElement('div')
    container.style.padding = '20px'
    container.innerHTML =
      '<p style="margin-bottom: 10px;">Double-click the input to set current time (simulated as 02:30)</p>'

    const mockCurrentTime = 150 // 2:30
    const input = createTimeInput({
      label: 'A',
      value: null,
      onChange: (value) => {
        console.log('Value changed to:', value)
        input._updateValue?.(value)
      },
      onDoubleClick: () => {
        console.log('Current time:', mockCurrentTime)
        return mockCurrentTime
      },
    })

    container.appendChild(input)
    return container
  },
}

export const DarkAndLight: Story = {
  render: () => {
    const container = document.createElement('div')
    container.style.display = 'flex'
    container.style.gap = '20px'
    container.style.padding = '20px'

    // Light theme
    const lightContainer = document.createElement('div')
    lightContainer.style.flex = '1'
    lightContainer.style.padding = '20px'
    lightContainer.style.backgroundColor = '#ffffff'
    lightContainer.innerHTML =
      '<h3 style="margin-bottom: 10px;">Light Theme</h3>'

    const lightInput = createTimeInput({
      label: 'A',
      value: 65, // 1:05
      onChange: (value) => console.log('Light input:', value),
      onDoubleClick: () => 120,
    })
    lightContainer.appendChild(lightInput)

    // Dark theme
    const darkContainer = document.createElement('div')
    darkContainer.style.flex = '1'
    darkContainer.style.padding = '20px'
    darkContainer.style.backgroundColor = '#0f0f0f'

    // Temporarily set dark theme
    document.documentElement.setAttribute('dark', '')

    darkContainer.innerHTML =
      '<h3 style="color: white; margin-bottom: 10px;">Dark Theme</h3>'
    const darkInput = createTimeInput({
      label: 'B',
      value: 245, // 4:05
      onChange: (value) => console.log('Dark input:', value),
      onDoubleClick: () => 300,
    })
    darkContainer.appendChild(darkInput)

    // Reset theme
    document.documentElement.removeAttribute('dark')

    container.appendChild(lightContainer)
    container.appendChild(darkContainer)

    return container
  },
}
