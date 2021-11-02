import { findIndex, map, noop } from 'lodash/fp'
import React, { useCallback, useState } from 'react'
import './title-screen.css'

interface MenuProps {
  /** the item to select when the list first renders */
  initialSelection?: string

  items: string[]

  /** called when the user selects an item, but has not confirmed */
  onItemSelected?: (item: string) => void

  /** called when a user confirms a selection, with 'enter' or clciking */
  onSelectionConfirmed?: (item: string) => void
}

const Menu = ({
  initialSelection,
  items,
  onItemSelected = noop,
  onSelectionConfirmed = noop,
}: MenuProps) => {
  const [selectedItem, setSelectedItem] = useState(initialSelection ?? items[0])

  // update the focus when a new UL element is created
  const refCallback = useCallback((ul: HTMLUListElement) => {
    ul?.focus()
  }, [])

  // handle blur events by taking focus back
  // works on this screen, because we only have one element that we want to handle input
  const handleBlur = useCallback((event: React.FocusEvent<HTMLUListElement>) => {
    event.target.focus()
  }, [])

  // notify listeners of a selection change, and update UI
  const select = useCallback((item: string) => {
    onItemSelected(item)
    setSelectedItem(item)
  }, [onItemSelected, setSelectedItem])

  // notify listeners the user has confirmed their choice
  const confirmSelection = useCallback((item: string) => {
    onSelectionConfirmed(item)
  }, [onSelectionConfirmed])

  // navigate the menu via arrow keys
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown': {
        const index = findIndex((item) => item === selectedItem, items)
        const nextIndex = (index + 1) % items.length
        select(items[nextIndex])
        break
      }

      case 'ArrowUp': {
        const index = findIndex((item) => item === selectedItem, items)
        const nextIndex = index === 0 ? items.length - 1 : index - 1
        select(items[nextIndex])
        break
      }

      case 'Enter':
        confirmSelection(selectedItem)
        break
    }
  }, [confirmSelection, items, select, selectedItem])

  // navigate the menu via mouse
  const handleHover = useCallback((item: string) => () => {
    select(item)
  }, [select])

  // confirm selection by clicking
  const handleClick = useCallback((item: string) => () => {
    select(item)
    confirmSelection(item)
  }, [confirmSelection, select])

  return (
    <ul
      onBlur={handleBlur}
      onKeyDown={handleKeyPress}
      ref={refCallback}
      tabIndex={0}
    >
      {map((name: string) => (
        <li
          key={name}
          className={selectedItem === name ? 'selected' : ''}
          onMouseEnter={handleHover(name)}
          onClick={handleClick(name)}
        >
          {name}
        </li>
      ), items)}
    </ul>
  )
}

export const TitleScreen = () => {
  return (
    <>
      <h1>Shift</h1>
      <Menu
        items={['New Game', 'Exit']}
        onSelectionConfirmed={(item) => {
          // eslint-disable-next-line no-console
          console.log('confirmed:', item)
        }}
      />
    </>
  )
}
