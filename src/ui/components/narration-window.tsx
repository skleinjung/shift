import { NarrationUnit } from 'engine/events'
import { useState } from 'react'

import { Panel, PanelProps } from './panel'

export interface NarrationPanelProps extends PanelProps {
  content: NarrationUnit[]
}

export const NarrationPanel = ({
  content,
  ...panelProps
}: NarrationPanelProps) => {
  const [contentIndex] = useState(0)

  return (
    <Panel {...panelProps}>
      <div>{content[contentIndex]}</div>
    </Panel>
  )
}
