import { useCallback } from 'react'
import { useVignette } from 'ui/hooks/use-vignette'

import { Modal } from './modal'
import { SpeechPanel } from './speech-panel'

export const VignetteController = () => {
  const vignette = useVignette()

  const showNextPage = useCallback(() => {
    vignette?.advance()
  }, [vignette])

  return vignette === undefined || vignette?.speech === undefined ? null : (
    <Modal classes="fade-in">
      <SpeechPanel
        active={true}
        content={vignette.speech}
        onShowNext={showNextPage}
      />
    </Modal>
  )
}
