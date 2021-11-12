import { Container } from 'engine/container'
import { Item } from 'engine/item'
import { noop, stubTrue } from 'lodash'
import { filter, find, flow, head, map } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'

import { ListItem, ListPanel, ListPanelProps } from './list-panel'

export interface ContainerContentsPanelProps extends Omit<ListPanelProps,
'items'
| 'onItemConsidered'
| 'onItemSelected'> {
  /** the container to render the contents of */
  container: Container

  /** optional filter for items; if specified, only items that return 'true' will be included in the list */
  itemFilter?: (item: Item) => boolean

  /** callback to invoke if the filtered item list is empty */
  onEmpty?: () => void

  /** Called when an item is 'considered' (hovered over, or navigated to with keyboard) */
  onItemConsidered?: (item: Item) => void

  /** Called when an item is selected via clicking or the 'enter' key */
  onItemSelected?: (item: Item) => void

  /** if true, the description of the considered item will be shown below the list */
  showItemDescription?: boolean

  /** Method used to create the 'left' anfd 'right' content for an item. (default: item name) */
  toListItem?: (item: Item) => Omit<ListItem, 'id'>
}

const defaultToListItem = (item: Item) => ({
  content: item.name,
})

export const ContainerContentsPanel = ({
  container,
  itemFilter = stubTrue,
  onEmpty = noop,
  onItemConsidered = noop,
  onItemSelected = noop,
  showItemDescription = false,
  toListItem = defaultToListItem,
  ...listPanelProps
}: ContainerContentsPanelProps) => {
  const [consideredItem, setConsideredItem] = useState<Item | undefined>(head(container.items))

  const getListItem = useCallback((item: Item): ListItem => ({
    id: `${item.id}`,
    ...toListItem(item),
  }), [toListItem])

  const items = flow(filter(itemFilter), map(getListItem))(container.items)

  useEffect(() => {
    if (items.length === 0) {
      onEmpty()
    }
  }, [items.length, onEmpty])

  const handleItemConsidered = useCallback((itemId: string) => {
    const item = find((item) => `${item.id}` === itemId, container.items)
    setConsideredItem(item)
    if (item !== undefined) {
      onItemConsidered(item)
    }
  }, [container.items, onItemConsidered])

  const handleItemSelected = useCallback((itemId: string) => {
    const item = find((item) => `${item.id}` === itemId, container.items)
    if (item !== undefined) {
      onItemSelected(item)
    }
  }, [container.items, onItemSelected])

  const getFooter = () => {
    return (showItemDescription && consideredItem !== undefined)
      ? <p className="container-contents-panel-item-description">{consideredItem.description}</p>
      : null
  }

  return (
    <ListPanel {...listPanelProps}
      footer={getFooter()}
      items={items}
      onItemConsidered={handleItemConsidered}
      onItemSelected={handleItemSelected}
    />
  )
}
