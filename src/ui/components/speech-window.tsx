import { useCallback } from 'react'
import { useRecoilState } from 'recoil'
import { speechState } from 'ui/state/speech'
import { WithExtraClasses } from 'ui/to-class-name'

import { PanelProps } from './panel'
import { SpeechPanel } from './speech-panel'

export type SpeechWindowProps = WithExtraClasses & Omit<PanelProps, 'className'>

export const SpeechWindow = (props: SpeechWindowProps) => {
  const [speech, setSpeech] = useRecoilState(speechState)

  const handleComplete = useCallback(() => {
    speech?.onComplete()
    setSpeech(undefined)
  }, [setSpeech, speech])

  return speech === undefined ? null : (
    <SpeechPanel {...props}
      active={true}
      classes="fade-in"
      content={speech.speech}
      onComplete={handleComplete}
    />
  )
}
