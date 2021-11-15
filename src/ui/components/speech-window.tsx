import { Speech } from 'engine/script-api'
import { noop } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useEngine } from 'ui/hooks/use-engine'

import { Modal } from './modal'
import { SpeechPanel } from './speech-panel'

export interface SpeechWindowProps {
  /** called when the speech window is hidden */
  onHideSpeech?: () => void

  /** called when the speech window is shown */
  onShowSpeech?: () => void
}

export const SpeechWindow = ({
  onHideSpeech = noop,
  onShowSpeech = noop,
}: SpeechWindowProps) => {
  const engine = useEngine()
  const [speech, setSpeech] = useState<Speech[] | undefined>(undefined)

  const handleComplete = useCallback(() => {
    setSpeech(undefined)
    onHideSpeech()
  }, [onHideSpeech])

  const handleSpeech = useCallback((newSpeech: Speech[]) => {
    onShowSpeech()
    setSpeech(newSpeech)
  }, [onShowSpeech])

  useEffect(() => {
    engine.on('speech', handleSpeech)
    return () => {
      engine.off('speech', handleSpeech)
    }
  }, [engine, handleSpeech])

  return speech === undefined ? null : (
    <Modal classes="fade-in">
      <SpeechPanel
        active={true}
        content={speech}
        onComplete={handleComplete}
      />
    </Modal>
  )
}
