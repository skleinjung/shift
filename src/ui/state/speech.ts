import { Speech } from 'engine/api/ui-api'
import { noop } from 'lodash/fp'
import { atom } from 'recoil'

export interface SpeechState {
  /** callback to notify when speech display is complete */
  onComplete: () => void

  /** speech content to display */
  speech: Speech[]
}

export const newSpeech = (): SpeechState => ({
  onComplete: noop,
  speech: [],
})

export const speechState = atom<SpeechState | undefined>({
  key: 'speechState',
  default: undefined,
})
