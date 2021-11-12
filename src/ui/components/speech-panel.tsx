import './narration-panel.css'

import { Speech } from 'engine/vignette'
import { noop } from 'lodash'
import { useEffect, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'
import { WithExtraClasses } from 'ui/to-class-name'

import { Panel, PanelProps } from './panel'

export type SpeechPanelProps = WithExtraClasses & Omit<PanelProps, 'className'> & {
  /** speech content to display */
  content: Speech

  /** callback invoked when the narration has been fully displayed */
  onComplete?: () => void

  /** invoked when the user advances the narration (clicks 'more', etc.) */
  onShowNext: () => void

  /** delay in ms between each character */
  textDelay?: number
}

/**
 * Display speech content (speaker, message) pair using a delayed "type in" effect.
 */
export const SpeechPanel = ({
  classes = [],
  content,
  onComplete = noop,
  onShowNext,
  textDelay = 13,
  ...panelProps
}: SpeechPanelProps) => {
  const [currentCharacter, setCurrentCharacter] = useState(1)

  // if the message changes, reset the "typing" animation
  useEffect(() => {
    setCurrentCharacter(1)
  }, [content.message])

  // once full text is "typed", call onComplete
  useEffect(() => {
    if (currentCharacter >= content.message.length) {
      onComplete()
    }
  }, [content.message, currentCharacter, onComplete])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (content.message.length > currentCharacter) {
      timeout = setTimeout(() => setCurrentCharacter((current) => current + 1), textDelay)
    }

    return () => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
    }
  }, [content, currentCharacter, textDelay])

  const keyMap = getKeyMap()
  const handleKeyDown = useKeyHandler({
    [keyMap.Confirm]: onShowNext,
  })

  const getText = () => {
    return content.message.substring(0, currentCharacter)
  }

  return (
    <Panel
      {...panelProps}
      classes={[...classes, 'narration-panel']}
      onKeyDown={handleKeyDown}
      title={content.speaker}
    >
      <div className="narration-panel-message">{getText()}</div>
      <div className="narration-panel-controls" onClick={onShowNext}>(next)</div>
    </Panel>
  )
}
