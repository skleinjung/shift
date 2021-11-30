import { Item } from 'engine/item'
import { noop } from 'lodash/fp'
import { useCallback } from 'react'
import { useWorld } from 'ui/hooks/use-world'

import { ContainerContentsPanel, ContainerContentsPanelProps } from './container-contents-panel'
import { Modal } from './modal'

export type InventoryItemMenuProps = Omit<
ContainerContentsPanelProps, 'active' | 'container' | 'onItemSelected'
> & {
  onItemSelected?: (itemId: number) => void
}

export const InventoryItemMenu = ({
  onItemSelected = noop,
  ...rest
}: InventoryItemMenuProps) => {
  const creature = useWorld().player
  const handleSelection = useCallback((item: Item) => {
    onItemSelected(item.id)
  }, [onItemSelected])

  return (
    <Modal>
      <ContainerContentsPanel {...rest}
        active={true}
        allowSelection={true}
        container={creature.inventory}
        onItemSelected={handleSelection}
      />
    </Modal>
  )
}
