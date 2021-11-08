import { Item } from 'engine/item'
import { noop } from 'lodash'
import { toLower } from 'lodash/fp'
import { useCallback } from 'react'
import { useWorld } from 'ui/hooks/use-world'

import { ContainerContentsPanel } from './container-contents-panel'
import { PanelProps } from './panel'

export interface ItemInteractionPanelProps extends PanelProps {
  /** the name of the interaction */
  interaction: string

  /**
   * callback that is invoked the user selects an (item, interaction) pair. This callback should perform
   * the intended interaction.
   **/
  onInteraction: (item: Item, interaction: string) => void

  /** callback invoked if there are items supporting the selected interaction in the player's cell */
  onNoValidInteractions?: (interaction: string) => void

  /** title of the 'select item' list, which defaults to '<interaction> which item?' */
  title?: string
}

export const ItemInteractionPanel = ({
  interaction,
  onInteraction,
  onNoValidInteractions = noop,
  title,
  ...rest
}: ItemInteractionPanelProps) => {
  const world = useWorld()
  const map = world.map
  const player = world.player

  const itemFilter = useCallback((item: Item) => {
    return item.getInteraction(interaction) !== undefined
  }, [interaction])

  const handleItemSelect = useCallback((item: Item) => {
    onInteraction(item, interaction)
  }, [interaction, onInteraction])

  const handleEmpty = useCallback(() => {
    onNoValidInteractions(interaction)
  }, [interaction, onNoValidInteractions])

  return (
    <ContainerContentsPanel {...rest}
      allowSelection={true}
      container={map.getCell(player.x, player.y)}
      itemFilter={itemFilter}
      onEmpty={handleEmpty}
      onItemSelected={handleItemSelect}
      title={title ?? `${interaction} which item?`}
    >
      <p>There no more items to {toLower(interaction)} here.</p>
    </ContainerContentsPanel>
  )
}
