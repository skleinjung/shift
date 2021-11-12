import './expedition-screen.css'

import { AttackAction } from 'engine/actions/attack'
import { InteractWithItemAction } from 'engine/actions/interact-with-item'
import { MoveByAction } from 'engine/actions/move-by'
import { UseInventoryItemAction } from 'engine/actions/use-inventory-item'
import { NarrationUnit } from 'engine/events'
import { Item } from 'engine/item'
import { ItemInventoryAction } from 'engine/item-inventory-action'
import { Action } from 'engine/types'
import { forEach, toLower } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { useGlobalKeyHandler } from 'ui/hooks/use-global-key-handler'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { useWorld } from 'ui/hooks/use-world'
import { getKeyMap } from 'ui/key-map'
import { endTurn, expeditionState } from 'ui/state/expedition'

import { ScreenName } from './app'
import { InventoryPanel } from './inventory-panel'
import { ItemInteractionPanel } from './item-interaction-panel'
import { LogPanel } from './log-panel'
import { MapPanel } from './map-panel'
import { Modal } from './modal'
import { NarrationPanel } from './narration-panel'
import { Panel } from './panel'
import { PlayerStatusPanel } from './player-status-panel'
import { ScreenMenu } from './screen-menu'

const SidebarColumns = 35

enum SelectablePanels {
  Map = 0,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __LENGTH,
  Information,
  Options,
}

/** Type of modal to display. Modals are used when a user initiates an action that requires multiple inputs. */
enum ModalMode {
  None = 0,
  Dialog,
  InteractWithItem,
  Inventory,
  Pause,
}

interface ModalState {
  mode: ModalMode
  argument?: any
}

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const world = useWorld()

  const [modal, setModal] = useState<ModalState>({ mode: ModalMode.None })
  const [activePanel, setActivePanel] = useState<SelectablePanels>(SelectablePanels.Map)

  const updateExpedition = useSetRecoilState(expeditionState)

  const isComplete = world.expeditionEnded

  const paused = modal.mode !== ModalMode.None

  // listen for narration events, so we can display them
  useEffect(() => {
    const handler = (content: NarrationUnit[]) => {
      forEach((unit) => {
        world.logMessage(`${unit.speaker}: ${unit.message}`)
      }, content)
      setModal({ mode: ModalMode.Dialog, argument: content })
    }

    world.on('narration', handler)
    return () => {
      world.off('narration', handler)
    }
  }, [world])

  const handleActivatePanel = useCallback((panel: SelectablePanels) => () => {
    setActivePanel(panel)
  }, [])

  const closeModal = useCallback(() => {
    setModal({ mode: ModalMode.None })
    setActivePanel(SelectablePanels.Map)
  }, [])

  const handleEscape = useCallback(() => {
    if (modal.mode !== ModalMode.None) {
      closeModal()
    } else {
      // pause, with the default pause modal visible
      setModal({ mode: ModalMode.Pause })
    }
  }, [closeModal, modal.mode])

  const executeTurn = useCallback((playerAction: Action) => {
    world.player.nextAction = playerAction

    // update our recoil state based on the new world state
    updateExpedition(endTurn)
  }, [updateExpedition, world])

  const executePlayerMove = useCallback((x: number, y: number) => () => {
    if (!paused) {
      const player = world.player
      const creature = world.map.getCreature(player.x + x, player.y + y)
      if (creature === undefined) {
        executeTurn(new MoveByAction(player, x, y))
      } else {
        executeTurn(new AttackAction(player, creature))
      }
    }
  }, [executeTurn, paused, world.map, world.player])

  const handleMapClick = useCallback((x: number, y: number) => {
    world.player.destination = { x, y }
  }, [world.player])

  const interactWithItem = useCallback((item: Item, interaction: string) => {
    executeTurn(new InteractWithItemAction(
      world.player,
      interaction,
      item
    ))
  }, [executeTurn, world.player])

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
      setModal({ mode: ModalMode.InteractWithItem, argument: interactionName })
    }
  }, [interactWithItem, world])

  const handleNoMoreItemInteractions = useCallback((interaction: string) => {
    world.logMessage(`There are no more items to ${toLower(interaction)} here.`)
    closeModal()
  }, [closeModal, world])

  const handleInventoryAction = useCallback((item: Item, action: ItemInventoryAction) => {
    executeTurn(new UseInventoryItemAction(
      world.player,
      action.name,
      item
    ))
    setActivePanel(SelectablePanels.Map)
  }, [executeTurn, world])

  const keyMap = getKeyMap()
  const mapKeyHandler = useKeyHandler({
    [keyMap.Get]: beginItemInteraction('Get'),
    [keyMap.MoveDown]: executePlayerMove(0, 1),
    [keyMap.MoveLeft]: executePlayerMove(-1, 0),
    [keyMap.MoveRight]: executePlayerMove(1, 0),
    [keyMap.MoveUp]: executePlayerMove(0, -1),
  })

  const handlePauseMenuSelection = useCallback((item: string) => {
    switch (item) {
      case 'Resume':
        closeModal()
        break

      case 'Quit Expedition':
        navigateTo('title')
        break
    }
  }, [closeModal, navigateTo])

  const toggleModal = useCallback((mode: ModalMode) => () => {
    if (modal.mode === mode) {
      closeModal()
    } else {
      setModal({ mode })
    }
  }, [closeModal, modal.mode])

  useGlobalKeyHandler({
    Escape: handleEscape,
    [keyMap.OpenInventory]: toggleModal(ModalMode.Inventory),
    Tab: () => setActivePanel((current) => (current + 1) % SelectablePanels.__LENGTH),
  })

  useEffect(() => {
    if (isComplete) {
      navigateTo('expedition-ended')
    }
  }, [isComplete, navigateTo])

  const getModalContent = () => {
    switch (modal.mode) {
      case ModalMode.Dialog:
        return (
          <NarrationPanel
            active={true}
            classes="fade-in"
            content={modal.argument ?? []}
            onComplete={() => {
              closeModal()
            }}
          />
        )

      case ModalMode.InteractWithItem:
        return (
          <ItemInteractionPanel
            active={true}
            columns={SidebarColumns}
            interaction={modal.argument ?? 'Get'}
            onNoValidInteractions={handleNoMoreItemInteractions}
            onInteraction={interactWithItem}
          />
        )

      case ModalMode.Inventory:
        return (
          <InventoryPanel
            active={true}
            allowSelection={true}
            columns={SidebarColumns}
            onClick={handleActivatePanel(SelectablePanels.Information)}
            onInventoryAction={handleInventoryAction}
            showSlot={true}
          />
        )

      case ModalMode.Pause:
        return (
          <ScreenMenu
            classes="pause-menu"
            items={['Resume', 'Quit Expedition']}
            onSelectionConfirmed={handlePauseMenuSelection}
          />
        )
    }

    return undefined
  }

  const renderModal = () => {
    const content = getModalContent()
    return content === undefined ? null : (
      <Modal>
        {content}
      </Modal>
    )
  }

  return (
    <div className="dungeon-screen">
      <div className="main-content">
        <MapPanel
          active={activePanel === SelectablePanels.Map && !paused}
          containerClass="expedition-panel"
          onClick={handleActivatePanel(SelectablePanels.Map)}
          onMapClick={handleMapClick}
          onKeyDown={mapKeyHandler}
        />

        <LogPanel
          containerClass="expedition-panel"
          world={world}
        />
      </div>

      <div className="sidebar">
        <PlayerStatusPanel
          containerClass="expedition-panel"
        />

        <InventoryPanel
          active={false}
          allowSelection={false}
          columns={SidebarColumns}
          containerClass="expedition-panel"
          onClick={handleActivatePanel(SelectablePanels.Information)}
          onInventoryAction={handleInventoryAction}
          showSlot={true}
        />

        <Panel
          containerClass="expedition-panel"
          columns={SidebarColumns}
          rows={8}
        >
          Lorem ipsum dolor sit amet.
        </Panel>
      </div>

      {renderModal()}
    </div>
  )
}
