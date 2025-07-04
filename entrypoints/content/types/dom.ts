import type { ABRepeatState } from './index'

// DOM要素の拡張インターフェース
export interface ABRepeatButtonElement extends HTMLElement {
  _updateEnabled?: (enabled: boolean) => void
}

export interface ABRepeatFormElement extends HTMLElement {
  _startInput?: HTMLElement
  _endInput?: HTMLElement
  _updateState?: (state: ABRepeatState) => void
}

export interface TimeInputElement extends HTMLElement {
  _updateValue?: (value: number | null) => void
}
