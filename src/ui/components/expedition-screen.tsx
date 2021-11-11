import { AttackAction } from 'engine/actions/attack'
import { InteractWithItemAction } from 'engine/actions/interact-with-item'
import { MoveByAction } from 'engine/actions/move-by'
import { UseInventoryItemAction } from 'engine/actions/use-inventory-item'
import { Item } from 'engine/item'
import { ItemInventoryAction } from 'engine/item-inventory-action'
import { Action } from 'engine/types'
import { toLower } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { useResetRecoilState, useSetRecoilState } from 'recoil'
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
import { Panel } from './panel'
import { PlayerStatusPanel } from './player-status-panel'
import { ScreenMenu } from './screen-menu'

import './expedition-screen.css'

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
  Pause,
  InteractWithItem,
  Inventory
}

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const world = useWorld()

  const [ready, setReady] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>(ModalMode.None)
  const [modelArgument, setModalArgument] = useState<string | undefined>()
  const [activePanel, setActivePanel] = useState<SelectablePanels>(SelectablePanels.Map)

  const resetExpedition = useResetRecoilState(expeditionState)

  const updateExpedition = useSetRecoilState(expeditionState)

  const isComplete = world.expeditionEnded
  const [, setViewportSize] = useState({ width: 0, height: 0 })
  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 })

  const paused = modalMode !== ModalMode.None

  const playerX = world.player.x
  const playerY = world.player.y

  useEffect(() => {
    resetExpedition()
    setReady(true)
  }, [resetExpedition])

  const handleActivatePanel = useCallback((panel: SelectablePanels) => () => {
    setActivePanel(panel)
  }, [])

  const handleEscape = useCallback(() => {
    if (modalMode !== ModalMode.None) {
      // close any open modals
      setModalMode(ModalMode.None)
      setModalArgument(undefined)
      setActivePanel(SelectablePanels.Map)
    } else {
      // pause, with the default pause modal visible
      setModalMode(ModalMode.Pause)
      setModalArgument(undefined)
    }
  }, [modalMode])

  const updateViewport = useCallback((
    viewportSize: { width: number; height: number },
    viewportCenter: { x: number; y: number }
  ) => {
    const oldCenter = viewportCenter
    let newCenterX = oldCenter.x
    let newCenterY = oldCenter.y

    const SMALL_MAP_THRESHOLD = 15
    const SCROLL_THRESHOLD_PERCENT = 0.40

    if (viewportSize.width > SMALL_MAP_THRESHOLD && viewportSize.height > SMALL_MAP_THRESHOLD) {
      const left = Math.floor(oldCenter.x - (viewportSize.width / 2))
      const right = Math.floor(oldCenter.x + (viewportSize.width / 2) - 1)
      const top = Math.floor(oldCenter.y - (viewportSize.height / 2))
      const bottom = Math.floor(oldCenter.y + (viewportSize.height / 2) - 1)

      const minPeekColumns = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * viewportSize.width))
      const minPeekRows = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * viewportSize.height))

      const leftAdjust = Math.min(0, playerX - (left + minPeekColumns))
      const rightAdjust = Math.max(0, playerX - (right - minPeekColumns))
      const horizontalAdjust = leftAdjust !== 0 ? leftAdjust : rightAdjust
      newCenterX = oldCenter.x + horizontalAdjust

      const upAdjust = Math.min(0, playerY - (top + minPeekRows - 1))
      const downAdjust = Math.max(0, playerY - (bottom - minPeekRows + 1))
      const verticalAdjust = upAdjust !== 0 ? upAdjust : downAdjust
      newCenterY = oldCenter.y + verticalAdjust
    } else if (viewportSize.width > 0 && viewportSize.height > 0) {
      // just always center small maps
      newCenterX = playerX
      newCenterY = playerY
    }

    if (newCenterX !== oldCenter.x || newCenterY !== oldCenter.y) {
      setViewportCenter({ x: newCenterX, y: newCenterY })
    }
  }, [playerX, playerY])

  const handleViewportResize = useCallback((width, height) => {
    const size = { width, height }
    setViewportSize(size)
    updateViewport(size, viewportCenter)
  }, [updateViewport, viewportCenter])

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
      setModalMode(ModalMode.InteractWithItem)
      setModalArgument(interactionName)
    }
  }, [interactWithItem, world])

  const handleNoMoreItemInteractions = useCallback((interaction: string) => {
    world.logMessage(`There are no more items to ${toLower(interaction)} here.`)
    setModalMode(ModalMode.None)
    setModalArgument(undefined)
  }, [world])

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
        setModalMode(ModalMode.None)
        break

      case 'Quit Expedition':
        navigateTo('title')
        break
    }
  }, [navigateTo])

  const toggleModal = useCallback((modal: ModalMode) => () => {
    if (modalMode === modal) {
      setModalMode(ModalMode.None)
    } else {
      setModalMode(modal)
    }
  }, [modalMode])

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
    switch (modalMode) {
      case ModalMode.Pause:
        return (
          <ScreenMenu
            classes="pause-menu"
            items={['Resume', 'Quit Expedition']}
            onSelectionConfirmed={handlePauseMenuSelection}
          />
        )

      case ModalMode.InteractWithItem:
        return (
          <ItemInteractionPanel
            active={true}
            columns={SidebarColumns}
            interaction={modelArgument ?? 'Get'}
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

  return (ready) ? (
    <div className="dungeon-screen">
      <div className="main-content">
        <MapPanel
          active={activePanel === SelectablePanels.Map && !paused}
          centerX={viewportCenter.x}
          centerY={viewportCenter.y}
          containerClass="expedition-panel"
          onClick={handleActivatePanel(SelectablePanels.Map)}
          onMapClick={handleMapClick}
          onKeyDown={mapKeyHandler}
          onViewportSizeChanged={handleViewportResize}
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
  ) : null
}
