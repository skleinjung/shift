import './narration-panel.css'

import { NarrationUnit } from 'engine/events'
import { useCallback, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'

import { Panel, PanelProps } from './panel'

export interface NarrationPanelProps extends PanelProps {
  /** narration content to display */
  content: NarrationUnit[]

  /** callback invoked when the narration has been fully displayed */
  onComplete: () => void
}

export const NarrationPanel = ({
  content,
  onComplete,
  ...panelProps
}: NarrationPanelProps) => {
  const [contentIndex, setContentIndex] = useState(0)

  const handleNextPage = useCallback(() => {
    if (contentIndex >= content.length - 1) {
      onComplete()
    } else {
      setContentIndex((current) => current + 1)
    }
  }, [content, contentIndex, onComplete])

  const keyMap = getKeyMap()
  const handleKeyDown = useKeyHandler({
    [keyMap.Confirm]: handleNextPage,
  })

  const lastPage = contentIndex >= content.length - 1

  return contentIndex >= content.length ? null : (
    <Panel
      {...panelProps}
      className="narration-panel"
      onKeyDown={handleKeyDown}
      title={content[contentIndex].speaker}
    >
      <div className="narration-panel-message">{content[contentIndex].message}</div>
      <div className="narration-panel-controls" onClick={handleNextPage}>{lastPage ? '(close)' : '(more)'}</div>
    </Panel>
  )
}
