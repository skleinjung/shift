import { find, map } from 'lodash/fp'
import { useCallback } from 'react'

import { ScreenMenu } from './screen-menu'

export interface PauseMenuOption {
  /** method to call when the user selects this option */
  onSelected: () => void

  /** name of this option, to display in the menu */
  name: string
}

export interface PauseMenuProps {
  /** menu options */
  options: PauseMenuOption[]
}

export const PauseMenu = ({ options }: PauseMenuProps) => {
  const handleSelectonConfirmed = useCallback((item: string) => {
    const selected = find((candidate) => candidate.name === item, options)
    selected?.onSelected()
  }, [options])

  return (
    <ScreenMenu
      classes="pause-menu"
      items={map((option) => option.name, options)}
      onSelectionConfirmed={handleSelectonConfirmed}
    />
  )
}
