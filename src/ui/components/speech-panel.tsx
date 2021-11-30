import './speech-panel.css'

import { Speech } from 'engine/api/ui-api'
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
  textDelay = 30,
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

  // callback invoked when the user indicates they want to advance the content
  const handleAdvanceContent = useCallback(() => {
    if (currentCharacter < (content[contentIndex]?.message?.length ?? 0)) {
      setCurrentCharacter(content[contentIndex]?.message?.length ?? 0)
    } else {
      handleNextPage()
    }
  }, [content, contentIndex, currentCharacter, handleNextPage])

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
    [keyMap.Confirm]: handleAdvanceContent,
  })

  const lastPage = contentIndex >= content.length - 1

  const getText = () => {
    return content[contentIndex].message.substring(0, currentCharacter)
  }

  return (
    <Panel
      {...panelProps}
      classes={[...classes, 'speech-panel']}
      onKeyDown={handleKeyDown}
      title={content[contentIndex].speaker}
    >
      <div className="speech-panel-message">{getText()}</div>
      <div className="speech-panel-controls" onClick={handleAdvanceContent}>{lastPage ? '(close)' : '(more)'}</div>
    </Panel>
  )
}
