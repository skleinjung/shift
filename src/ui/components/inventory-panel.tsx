import { Item } from 'engine/item'
import { ItemInventoryAction } from 'engine/item-inventory-action'
import { get, map, noop } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { useWorld } from 'ui/hooks/use-world'

import { ContainerContentsPanel } from './container-contents-panel'
import { ListPanel, ListPanelProps } from './list-panel'

import './inventory-panel.css'

export type InventoryPanelProps = Omit<
ListPanelProps, 'items' | 'title' | 'container' | 'onItemConsidered' | 'onItemSelected'
> & {
  /** callback invoked when a user attempts to execute an inventory action on an item */
  onInventoryAction?: (item: Item, action: ItemInventoryAction) => void
}

export const InventoryPanel = ({
  active,
  onInventoryAction = noop,
  ...rest
}: InventoryPanelProps) => {
  const creature = useWorld().player
  const [selectedItem, setSelectedItem] = useState<Item | undefined>()

  // if the user tabs out of the list, clear the item selection to avoid confusion
  useEffect(() => {
    if (!active) {
      setSelectedItem(undefined)
    }
  }, [active])

  const handleItemAction = useCallback((name: string) => {
    if (selectedItem !== undefined) {
      if (name === 'Back') {
        // just go back to inventory screen
        setSelectedItem(undefined)
      } else {
        // real item action, let's invoke it
        const action = selectedItem.getInventoryAction(name)
        if (action !== undefined) {
          onInventoryAction(selectedItem, action)
          setSelectedItem(undefined)
        }
      }
    }
  }, [onInventoryAction, selectedItem])

  return selectedItem === undefined ? (
    <ContainerContentsPanel {...rest}
      active={active}
      container={creature.inventory}
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
