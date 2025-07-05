import type { Meta, StoryObj } from '@storybook/html'
import { expect, userEvent, within } from '@storybook/test'
import type { ABRepeatState } from '~/entrypoints/content/types'
import type { ABRepeatFormElement } from '~/entrypoints/content/types/dom'
import { withTheme } from '~/stories/decorators/themeDecorator'
import { type ABRepeatFormOptions, createABRepeatForm } from './abRepeatForm'

type ABRepeatFormArgs = Omit<ABRepeatFormOptions, 'state'> & {
  enabled: boolean
  startTime: number | null
  endTime: number | null
}

const meta: Meta<ABRepeatFormArgs> = {
  title: 'Components/ABRepeatForm',
  decorators: [withTheme],
  argTypes: {
    enabled: {
      control: 'boolean',
      description: 'Whether the form is visible',
      defaultValue: true,
    },
    startTime: {
      control: 'number',
      description: 'Start time in seconds',
      defaultValue: null,
    },
    endTime: {
      control: 'number',
      description: 'End time in seconds',
      defaultValue: null,
    },
    onStartTimeChange: {
      action: 'startTimeChanged',
      description: 'Start time change handler',
    },
    onEndTimeChange: {
      action: 'endTimeChanged',
      description: 'End time change handler',
    },
    getCurrentTime: {
      action: 'getCurrentTime',
      description: 'Get current video time',
    },
  },
}

export default meta
type Story = StoryObj<ABRepeatFormArgs>

const createFormHandlers = (args: ABRepeatFormArgs, mockTime = 100) => ({
  onStartTimeChange:
    args.onStartTimeChange ||
    ((time: number | null) => console.log('Start time:', time)),
  onEndTimeChange:
    args.onEndTimeChange ||
    ((time: number | null) => console.log('End time:', time)),
  getCurrentTime:
    args.getCurrentTime ||
    (() => {
      console.log('Getting current time')
      return mockTime
    }),
  getVideoDuration: () => {
    console.log('Getting video duration')
    return 300 // Mock 5 minutes video
  },
})

const renderForm = (
  args: ABRepeatFormArgs,
  options?: { mockTime?: number; wrapInContainer?: boolean },
): ABRepeatFormElement | HTMLDivElement => {
  const state: ABRepeatState = {
    enabled: args.enabled,
    startTime: args.startTime,
    endTime: args.endTime,
  }

  const form = createABRepeatForm({
    state,
    ...createFormHandlers(args, options?.mockTime),
  })

  if (options?.wrapInContainer) {
    const container = document.createElement('div')
    container.innerHTML = '<p>Form is hidden when disabled (enabled: false)</p>'
    container.appendChild(form)
    return container
  }

  return form
}

export const Hidden: Story = {
  args: {
    enabled: false,
    startTime: null,
    endTime: null,
  },
  render: (args) => renderForm(args, { wrapInContainer: true }),
}

export const Empty: Story = {
  args: {
    enabled: true,
    startTime: null,
    endTime: null,
  },
  render: (args) => renderForm(args),
}

export const WithTimes: Story = {
  args: {
    enabled: true,
    startTime: 65, // 1:05
    endTime: 185, // 3:05
  },
  render: (args) => renderForm(args, { mockTime: 125 }),
}

export const Interactive: Story = {
  args: {
    enabled: true,
    startTime: null,
    endTime: null,
  },
  render: (args) => {
    let state: ABRepeatState = {
      enabled: args.enabled,
      startTime: args.startTime,
      endTime: args.endTime,
    }

    let mockCurrentTime = 0

    const form = createABRepeatForm({
      state,
      onStartTimeChange: (time) => {
        state = { ...state, startTime: time }
        form._updateState?.(state)
        console.log('Start time changed:', time)
        args.onStartTimeChange?.(time)
      },
      onEndTimeChange: (time) => {
        state = { ...state, endTime: time }
        form._updateState?.(state)
        console.log('End time changed:', time)
        args.onEndTimeChange?.(time)
      },
      getCurrentTime: () => {
        mockCurrentTime += 30 // Simulate progression
        console.log('Current time:', mockCurrentTime)
        return mockCurrentTime
      },
      getVideoDuration: () => 300, // 5 minutes video
    })

    return form
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByPlaceholderText(
      '00:00:00',
    ) as HTMLInputElement[]

    // Set start time
    await userEvent.clear(inputs[0])
    await userEvent.type(inputs[0], '00:30:00')
    await userEvent.tab()
    await expect(inputs[0]).toHaveValue('00:30:00')

    // Set end time
    await userEvent.clear(inputs[1])
    await userEvent.type(inputs[1], '02:15:30')
    await userEvent.tab()
    await expect(inputs[1]).toHaveValue('02:15:30')
  },
}

export const SimulatedVideoPlayer: Story = {
  render: () => {
    const container = document.createElement('div')
    container.style.width = '640px'
    container.style.margin = '0 auto'

    // Mock video player
    const videoContainer = document.createElement('div')
    videoContainer.style.backgroundColor = '#000'
    videoContainer.style.height = '360px'
    videoContainer.style.marginBottom = '10px'
    videoContainer.style.display = 'flex'
    videoContainer.style.alignItems = 'center'
    videoContainer.style.justifyContent = 'center'
    videoContainer.style.color = '#fff'
    videoContainer.style.fontSize = '24px'
    videoContainer.innerHTML =
      '<div>Mock Video Player<br><span style="font-size: 16px">Current Time: <span id="currentTime">00:00:00</span></span></div>'

    let currentTime = 0
    const updateTimeDisplay = () => {
      const hours = Math.floor(currentTime / 3600)
      const minutes = Math.floor((currentTime % 3600) / 60)
      const seconds = Math.floor(currentTime % 60)
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      const timeEl = container.querySelector('#currentTime')
      if (timeEl) timeEl.textContent = timeStr
    }

    // Simulate video playback
    setInterval(() => {
      currentTime = (currentTime + 1) % 300 // Loop every 5 minutes
      updateTimeDisplay()
    }, 1000)

    let state: ABRepeatState = {
      enabled: true,
      startTime: null,
      endTime: null,
    }

    const form = createABRepeatForm({
      state,
      onStartTimeChange: (time) => {
        state = { ...state, startTime: time }
        form._updateState?.(state)
        console.log('Start time set to:', time)
      },
      onEndTimeChange: (time) => {
        state = { ...state, endTime: time }
        form._updateState?.(state)
        console.log('End time set to:', time)
      },
      getCurrentTime: () => currentTime,
      getVideoDuration: () => 300, // 5 minutes video
    })

    const hint = document.createElement('div')
    hint.style.textAlign = 'center'
    hint.style.fontSize = '14px'
    hint.style.color = '#666'
    hint.innerHTML = `
      <p style="margin: 5px 0;">Double-click the inputs to set current video time</p>
      <p style="margin: 5px 0;">Use mouse scroll to adjust time (Normal: ±1s, Shift: ±10s, Ctrl: ±1m)</p>
    `

    container.appendChild(videoContainer)
    container.appendChild(form)
    container.appendChild(hint)

    return container
  },
}
