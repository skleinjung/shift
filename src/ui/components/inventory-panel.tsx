import { Item } from 'engine/item'
import { get, head, map, noop } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { playerState } from 'ui/state/player'

import { ContainerContentsPanel } from './container-contents-panel'
import { ListPanel, ListPanelProps } from './list-panel'

import './inventory-panel.css'

export type InventoryPanelProps = Omit<
ListPanelProps, 'items' | 'title' | 'container' | 'onItemConsidered' | 'onItemSelected'
> & {
  /** callback invoked when a user attempts to execute an inventory action on an item */
  onInventoryAction?: (item: Item, action: string) => void
}

export const InventoryPanel = ({
  active,
  onInventoryAction = noop,
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
      onInventoryAction(selectedItem, action)
      setSelectedItem(undefined)
    }
  }, [onInventoryAction, selectedItem])

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
      items={[...map(get('name'), selectedItem.inventoryActions), 'Back']}
      onItemSelected={handleItemAction}
      title={selectedItem.name}
    >
      {selectedItem?.description &&
        <p className="inventory-panel-item-description">{selectedItem.description}</p>
      }
    </ListPanel>
  )
}
