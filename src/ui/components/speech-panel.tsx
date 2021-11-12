import './narration-panel.css'

import { Speech } from 'engine/engine'
import { noop } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'
import { WithExtraClasses } from 'ui/to-class-name'

import { Panel, PanelProps } from './panel'

export type SpeechPanelProps = WithExtraClasses & Omit<PanelProps, 'className'> & {
  /** speech content to display */
  content: Speech[]

  /** callback invoked when the narration has been fully displayed */
  onComplete?: () => void

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
  textDelay = 13,
  ...panelProps
}: SpeechPanelProps) => {
  const [contentIndex, setContentIndex] = useState(0)
  const [currentCharacter, setCurrentCharacter] = useState(1)

  const handleNextPage = useCallback(() => {
    if (contentIndex >= content.length - 1) {
      onComplete()
    } else {
      setCurrentCharacter(1)
      setContentIndex((current) => current + 1)
    }
  }, [content, contentIndex, onComplete])

  // if the message changes, reset the "typing" animation
  useEffect(() => {
    setCurrentCharacter(1)
  }, [content])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined
    if (content[contentIndex]?.message?.length > currentCharacter) {
      timeout = setTimeout(() => setCurrentCharacter((current) => current + 1), textDelay)
    }

    return () => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
    }
  }, [content, contentIndex, currentCharacter, textDelay])

  const keyMap = getKeyMap()
  const handleKeyDown = useKeyHandler({
    [keyMap.Confirm]: handleNextPage,
  })

  const lastPage = contentIndex >= content.length - 1

  const getText = () => {
    return content[contentIndex].message.substring(0, currentCharacter)
  }

  return (
    <Panel
      {...panelProps}
      classes={[...classes, 'narration-panel']}
      onKeyDown={handleKeyDown}
      title={content[contentIndex].speaker}
    >
      <div className="narration-panel-message">{getText()}</div>
      <div className="narration-panel-controls" onClick={handleNextPage}>{lastPage ? '(close)' : '(more)'}</div>
    </Panel>
  )
}
