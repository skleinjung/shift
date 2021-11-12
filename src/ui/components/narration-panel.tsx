import './narration-panel.css'

import { NarrationUnit } from 'engine/events'
import { useCallback, useEffect, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'
import { WithExtraClasses } from 'ui/to-class-name'

import { Panel, PanelProps } from './panel'

export type NarrationPanelProps = WithExtraClasses & Omit<PanelProps, 'className'> & {
  /** narration content to display */
  content: NarrationUnit[]

  /** callback invoked when the narration has been fully displayed */
  onComplete: () => void

  /** delay in ms between each character */
  textDelay?: number
}

export const NarrationPanel = ({
  classes = [],
  content,
  onComplete,
  textDelay = 13,
  ...panelProps
}: NarrationPanelProps) => {
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

  return contentIndex >= content.length ? null : (
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
