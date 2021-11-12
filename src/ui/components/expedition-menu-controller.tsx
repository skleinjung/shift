import { InteractWithItemAction } from 'engine/actions/interact-with-item'
import { UseInventoryItemAction } from 'engine/actions/use-inventory-item'
import { Item } from 'engine/item'
import { ItemInventoryAction } from 'engine/item-inventory-action'
import { Action } from 'engine/types'
import { noop } from 'lodash'
import { toLower } from 'lodash/fp'
import { useCallback, useState } from 'react'
import { useGlobalKeyHandler } from 'ui/hooks/use-global-key-handler'
import { useWorld } from 'ui/hooks/use-world'
import { getKeyMap } from 'ui/key-map'

import { InventoryPanel } from './inventory-panel'
import { ItemInteractionPanel } from './item-interaction-panel'
import { Modal } from './modal'
import { ObjectivePanel } from './objective-panel'
import { PauseMenu } from './pause-menu'

/** Type of menu to display. Modals are used when a user initiates an action that requires multiple inputs. */
enum MenuMode {
  None = 0,
  InteractWithItem,
  Inventory,
  Objectives,
  Pause,
}

interface MenuState {
  mode: MenuMode
  argument?: any
}

export interface ExpeditionMenuControllerProps {
  /** called when the menus are hidden */
  onHideMenu?: () => void

  /* callback notified if the user indicates the expedition should end */
  onQuitExpedition: () => void

  /** callback used when the UI should trigger a turn-consuming action */
  onPlayerAction: (action: Action) => void

  /** called when the menus are shown */
  onShowMenu?: () => void
}

export const ExpeditionMenuController = ({
  onHideMenu = noop,
  onPlayerAction,
  onQuitExpedition,
  onShowMenu = noop,
}: ExpeditionMenuControllerProps) => {
  const world = useWorld()
  const [menu, setMenu] = useState<MenuState>({ mode: MenuMode.None })

  const closeMenu = useCallback(() => {
    setMenu({ mode: MenuMode.None })
    onHideMenu()
  }, [onHideMenu])

  const openMenu = useCallback((menu: MenuState) => {
    onShowMenu()
    setMenu(menu)
  }, [onShowMenu])

  const interactWithItem = useCallback((item: Item, interaction: string) => {
    onPlayerAction(new InteractWithItemAction(
      world.player,
      interaction,
      item
    ))
  }, [onPlayerAction, world.player])

  const toggleModal = useCallback((newMenu: MenuState) => () => {
    if (menu.mode === newMenu.mode) {
      closeMenu()
    } else {
      openMenu(newMenu)
    }
  }, [menu.mode, closeMenu, openMenu])

  const beginItemInteraction = useCallback((interactionName: string) => () => {
    const player = world.player
    const candidateItems = world.map.getInteractableItems(player.x, player.y, interactionName)
    if (candidateItems.length === 0) {
      // no items
      world.logMessage(`There are no items to ${toLower(interactionName)} here.`)
    } else if (candidateItems.length === 1) {
      // just one item, pick it up directly
      interactWithItem(candidateItems[0], interactionName)
    } else {
      // multiple items, use a modal to pick one
      openMenu({ argument: interactionName, mode: MenuMode.InteractWithItem })
    }
  }, [interactWithItem, openMenu, world])

  const handleNoMoreItemInteractions = useCallback((interaction: string) => {
    world.logMessage(`There are no more items to ${toLower(interaction)} here.`)
    closeMenu()
  }, [closeMenu, world])

  const handleInventoryAction = useCallback((item: Item, action: ItemInventoryAction) => {
    onPlayerAction(new UseInventoryItemAction(
      world.player,
      action.name,
      item
    ))
  }, [onPlayerAction, world])

  const handleEscape = useCallback(() => {
    if (menu.mode !== MenuMode.None) {
      closeMenu()
    } else {
      openMenu({ mode: MenuMode.Pause })
    }
  }, [closeMenu, menu.mode, openMenu])

  const keyMap = getKeyMap()
  useGlobalKeyHandler({
    Escape: handleEscape,
    [keyMap.Get]: beginItemInteraction('Get'),
    [keyMap.OpenInventory]: toggleModal({ mode: MenuMode.Inventory }),
    [keyMap.OpenObjectives]: toggleModal({ mode: MenuMode.Objectives }),
  })

  const getModalContent = () => {
    switch (menu.mode) {
      case MenuMode.InteractWithItem:
        return (
          <ItemInteractionPanel
            active={true}
            interaction={menu.argument ?? 'Get'}
            onNoValidInteractions={handleNoMoreItemInteractions}
            onInteraction={interactWithItem}
          />
        )

      case MenuMode.Inventory:
        return (
          <InventoryPanel
            active={true}
            allowSelection={true}
            onInventoryAction={handleInventoryAction}
            showSlot={true}
          />
        )

      case MenuMode.Objectives:
        return (
          <ObjectivePanel
            active={true}
            allowSelection={true}
            classes="modal-panel-objectives"
          />
        )

      case MenuMode.Pause:
        return (
          <PauseMenu options={[
            {
              name: 'Resume',
              onSelected: closeMenu,
            },
            {
              name: 'Quit Expedition',
              onSelected: onQuitExpedition,
            },
          ]}/>
        )

      default:
        return undefined
    }
  }

  const content = getModalContent()
  return content === undefined ? null : (
    <Modal>
      {content}
    </Modal>
  )
}
