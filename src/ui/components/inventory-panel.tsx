import { Item } from 'engine/item'
import { find, get, head, map } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { playerState } from 'ui/state/player'

import { ContainerContentsPanel } from './container-contents-panel'
import { ListPanel, ListPanelProps } from './list-panel'

export type ItemAction = {
  /** name of this action, to display in the list */
  name: string

  /** invoke the action, for the given item */
  execute: (item: Item) => void
}

export type InventoryPanelProps = Omit<
ListPanelProps, 'items' | 'title' | 'container' | 'onItemConsidered' | 'onItemSelected'
> & {
  /** given an item in the inventory, return a set of actions the user can perform on that item */
  getItemActions: (item: Item) => ItemAction[]
}

export const InventoryPanel = ({
  active,
  getItemActions,
  ...rest
}: InventoryPanelProps) => {
  const player = useRecoilValue(playerState)
  const [selectedItem, setSelectedItem] = useState(head(player.inventory.contents))

  // if the user tabs out of the list, clear the item selection to avoid confusion
  useEffect(() => {
    if (!active) {
      setSelectedItem(undefined)
    }
  }, [active])

  const handleItemAction = useCallback((action: string) => {
    if (selectedItem !== undefined) {
      find(
        (availableAction) => availableAction.name === action,
        getItemActions(selectedItem)
      )?.execute(selectedItem)
    }

    setSelectedItem(undefined)
  }, [getItemActions, selectedItem])

  return selectedItem === undefined ? (
    <ContainerContentsPanel {...rest}
      active={active}
      container={player.inventory}
      onItemSelected={setSelectedItem}
      title="Inventory"
    />
  ) : (
    <ListPanel {...rest}
      active={active}
      allowSelection={true}
      items={[...map(get('name'), getItemActions(selectedItem)), 'Back']}
      onItemSelected={handleItemAction}
      title={selectedItem.name}
    />
  )
}
