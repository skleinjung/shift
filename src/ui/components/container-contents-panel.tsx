import { Container } from 'engine/container'
import { Item } from 'engine/item'
import { noop } from 'lodash'
import { find, map } from 'lodash/fp'
import { useCallback } from 'react'

import { ListItem, ListPanel, ListPanelProps } from './list-panel'

export interface ContainerContentsPanelProps extends Omit<ListPanelProps,
'items'
| 'onItemConsidered'
| 'onItemSelected'> {
  /** the container to render the contents of */
  container: Container

  /** Called when an item is 'considered' (hovered over, or navigated to with keyboard) */
  onItemConsidered?: (item: Item) => void

  /** Called when an item is selected via clicking or the 'enter' key */
  onItemSelected?: (item: Item) => void
}

export const ContainerContentsPanel = ({
  container,
  onItemConsidered = noop,
  onItemSelected = noop,
  ...listPanelProps
}: ContainerContentsPanelProps) => {
  const toListItem = (item: Item): ListItem => {
    return {
      id: `${item.id}`,
      content: item.name,
    }
  }

  const handleItemConsidered = useCallback((itemId: string) => {
    const item = find((item) => `${item.id}` === itemId, container.contents)
    if (item !== undefined) {
      onItemConsidered(item)
    }
  }, [container.contents, onItemConsidered])

  const handleItemSelected = useCallback((itemId: string) => {
    const item = find((item) => `${item.id}` === itemId, container.contents)
    if (item !== undefined) {
      onItemSelected(item)
    }
  }, [container.contents, onItemSelected])

  return (
    <ListPanel {...listPanelProps}
      items={map(toListItem, container.contents)}
      onItemConsidered={handleItemConsidered}
      onItemSelected={handleItemSelected}
    />
  )
}
