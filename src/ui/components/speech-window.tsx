import { useCallback } from 'react'
import { useRecoilState } from 'recoil'
import { speechState } from 'ui/state/speech'

import { Modal } from './modal'
import { SpeechPanel } from './speech-panel'

export interface SpeechWindowProps {
  /** called when the speech window is hidden */
  onHideSpeech?: () => void

  /** called when the speech window is shown */
  onShowSpeech?: () => void
}

export const SpeechWindow = () => {
  const [speech, setSpeech] = useRecoilState(speechState)

  const handleComplete = useCallback(() => {
    speech?.onComplete()
    setSpeech(undefined)
  }, [setSpeech, speech])

  return speech === undefined ? null : (
    <Modal classes="fade-in">
      <SpeechPanel
        active={true}
        content={speech.speech}
        onComplete={handleComplete}
      />
    </Modal>
  )
}
