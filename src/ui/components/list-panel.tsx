import { map as mapS } from 'lodash'
import { compact, flow, isString, join } from 'lodash/fp'
import { useState } from 'react'

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
const getId = (item: string | ListItem) => isString(item) ? item : item.id ?? item.content

// extracts the left-side content from a list item
const getLeftContent = (item: string | ListItem) => isString(item) ? item : item.content

// extracts the (possibly undefined) right-side content from a list item
const getRightContent = (item: string | ListItem) => isString(item) ? undefined : item.rightContent

export interface ListPanelProps extends PanelProps {
  /** whether this list allows selection or not */
  allowSelection?: boolean

  /**
   * Items to display in the list. Any items that are simply a string will use that value as both
   * the ID and content.
   **/
  items: (ListItem | string)[]

  /** Optional title to display in a fixed position above the scrolling list. */
  title?: string
}

export const ListPanel = ({
  allowSelection,
  items,
  ...rest
}: ListPanelProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedIndex, setSelectedIndex] = useState(0)

  const createRow = (item: string | ListItem, index: number) => {
    const rightContent = getRightContent(item)

    const classes = flow(
      compact,
      join(' ')
    )([
      'list-panel-row',
      allowSelection ? 'selectable' : undefined,
      allowSelection && index === selectedIndex ? 'selected' : undefined,
    ])

    return (
      <div key={getId(item)} className={classes}>
        <div className="list-panel-left">{getLeftContent(item)}</div>
        {rightContent && <div className="list-panel-right">{rightContent}</div> }
      </div>
    )
  }

  return (
    <Panel {...rest}>
      {mapS(items, createRow)}
    </Panel>
  )
}
