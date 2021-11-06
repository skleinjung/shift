import { ScreenMenu, ScreenMenuProps } from './screen-menu'

import './popup-menu.css'

export const PopupMenu = (props: ScreenMenuProps) => {
  return (
    <div className="popup-menu">
      <ScreenMenu {...props} />
    </div>
  )
}
