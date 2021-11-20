import { Objective } from 'engine/objective'
import { find, head, map } from 'lodash/fp'
import { useCallback, useState } from 'react'
import { useCampaign } from 'ui/hooks/use-game'

import { ListItem, ListPanel, ListPanelProps } from './list-panel'

export type ObjectivePanelProps = Omit<ListPanelProps, 'items'> & {
  /** if true, the description of the 'considered' objective is shown */
  showDescriptions?: boolean
}

export const ObjectivePanel = ({
  showDescriptions = true,
  ...listPanelProps
}: ObjectivePanelProps) => {
  const campaign = useCampaign()
  const objectives = campaign.objectives

  const [considered, setConsidered] = useState<undefined | Objective>(head(objectives))

  const handleItemConsidered = useCallback((item: string) => {
    setConsidered(find((candidate) => candidate.name === item, objectives))
  }, [objectives])

  const toListItem = (objective: Objective): ListItem => ({
    content: objective.name,
    rightContent: `[${objective.progress}/${objective.goal}]`,
  })

  return (
    <ListPanel
      empty={<div>No active objectives.</div>}
      footer={considered && showDescriptions && <div>{considered.description}</div>}
      items={map(toListItem, objectives)}
      onItemConsidered={handleItemConsidered}
      title='Objectives'
      {...listPanelProps}
    />
  )
}
