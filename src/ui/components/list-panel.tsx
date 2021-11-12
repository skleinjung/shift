import { map as mapS } from 'lodash'
import { compact, flow, isString, join, noop } from 'lodash/fp'
import { ReactNode, useCallback, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'

import { Panel, PanelProps } from './panel'

import './list-panel.css'

export interface ListItem {
  /** id to use when this item is selected, which defaults to the 'content' */
  id?: string

  /** content to display left-justfied in the list */
  content: string

  /** content to display right-justfied in the list */
  rightContent?: string
}

// extracts the id from a list item
const getId = (item: string | ListItem) => isString(item) ? item : item?.id ?? item.content

// extracts the left-side content from a list item
const getLeftContent = (item: string | ListItem) => isString(item) ? item : item.content

// extracts the (possibly undefined) right-side content from a list item
const getRightContent = (item: string | ListItem) => isString(item) ? undefined : item.rightContent

export interface ListPanelProps extends Omit<PanelProps, 'children'> {
  /** whether this list allows selection or not */
  allowSelection?: boolean

  /** optional content to display when the list is empty */
  empty?: ReactNode

  /** optional content to display below the list */
  footer?: ReactNode

  /**
   * Items to display in the list. Any items that are simply a string will use that value as both
   * the ID and content.
   **/
  items: (ListItem | string)[]

  /** called when the user selects an item, but has not confirmed */
  onItemConsidered?: (item: string) => void

  /** called when a user confirms a selection, with 'enter' or clciking */
  onItemSelected?: (itemId: string) => void
}

export const ListPanel = ({
  active = false,
  allowSelection,
  empty = <p>There are no items to display.</p>,
  footer = null,
  items,
  onItemConsidered = noop,
  onItemSelected = noop,
  ...rest
}: ListPanelProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const consider = useCallback((index: number) => {
    const selection = getId(items[index])
    if (selection !== undefined) {
      onItemConsidered(selection)
    }

    setSelectedIndex(index)
  }, [items, onItemConsidered])

  const moveSelectionUp = useCallback(() => {
    consider(selectedIndex === 0 ? items.length - 1 : selectedIndex - 1)
  }, [items.length, consider, selectedIndex])

  const moveSelectionDown = useCallback(() => {
    consider((selectedIndex + 1) % items.length)
  }, [items.length, consider, selectedIndex])

  const confirmSelection = useCallback((index: number) => {
    const selection = getId(items[index])
    if (selection !== undefined) {
      onItemSelected(selection)
    }
    setSelectedIndex(index)
  }, [items, onItemSelected])

  const handleClick = useCallback((index: number) => () => {
    if (allowSelection) {
      consider(index)
      confirmSelection(index)
    }
  }, [allowSelection, confirmSelection, consider])

  const handleConfirmKey = useCallback(() => {
    confirmSelection(selectedIndex)
  }, [confirmSelection, selectedIndex])

  const keyMap = getKeyMap()
  const handleKeyDown = useKeyHandler({
    [keyMap.MoveUp]: moveSelectionUp,
    [keyMap.MoveDown]: moveSelectionDown,
    [keyMap.Confirm]: handleConfirmKey,
  })

  const createRow = (item: string | ListItem, index: number) => {
    const rightContent = getRightContent(item)

    const classes = flow(
      compact,
      join(' ')
    )([
      'list-panel-row',
      allowSelection ? 'selectable' : undefined,
      active && allowSelection && index === selectedIndex ? 'selected' : undefined,
    ])

    return (
      <li key={getId(item)}
        className={classes}
        onClick={handleClick(index)}
      >
        <div className="list-panel-left">{getLeftContent(item)}</div>
        {rightContent && <div className="list-panel-right">{rightContent}</div> }
      </li>
    )
  }

  const getListItems = () => (
    <ul className="list-panel-body">
      {mapS(items, createRow)}
    </ul>
  )

  const getEmptyContent = () => empty && (
    <div className="list-panel-body list-panel-empty">
      {empty}
    </div>
  )

  return (
    <Panel {...rest}
      active={active}
      onKeyDown={handleKeyDown}
    >
      {items.length > 0 ? getListItems() : getEmptyContent()}
      {footer &&
      <div className="list-panel-footer">
        {footer}
      </div>}
    </Panel>
  )
}
