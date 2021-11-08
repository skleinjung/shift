import { AttackAction } from 'engine/actions/attack'
import { MoveByAction } from 'engine/actions/move-by'
import { UseInventoryItemAction } from 'engine/actions/use-inventory-item'
import { Item } from 'engine/item'
import { ItemInventoryAction } from 'engine/item-inventory-action'
import { Action } from 'engine/types'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilState, useResetRecoilState, useSetRecoilState } from 'recoil'
import { useGlobalKeyHandler } from 'ui/hooks/use-global-key-handler'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { useWorld } from 'ui/hooks/use-world'
import { endTurn, expeditionState } from 'ui/state/expedition'
import { gameState, pause, unpause } from 'ui/state/game'

import { ScreenName } from './app'
import { InventoryPanel } from './inventory-panel'
import { LogPanel } from './log-panel'
import { MapPanel } from './map-panel'
import { Panel } from './panel'
import { PlayerStatusPanel } from './player-status-panel'
import { PopupMenu } from './popup-menu'

import './expedition-screen.css'

const SidebarColumns = 45

enum SelectablePanels {
  Map = 0,
  Information,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __LENGTH,
  Options,
}

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const world = useWorld()

  const [ready, setReady] = useState(false)
  const [activePanel, setActivePanel] = useState<SelectablePanels>(SelectablePanels.Map)

  const resetExpedition = useResetRecoilState(expeditionState)
  const resetGame = useResetRecoilState(gameState)

  const updateExpedition = useSetRecoilState(expeditionState)

  const isComplete = world.expeditionEnded
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 })
  const [game, updateGame] = useRecoilState(gameState)

  useEffect(() => {
    resetExpedition()
    resetGame()
    setReady(true)
  }, [resetExpedition, resetGame])

  const handleActivatePanel = useCallback((panel: SelectablePanels) => () => {
    setActivePanel(panel)
  }, [])

  const handleEscape = useCallback(() => {
    if (game.paused) {
      updateGame(unpause)
    } else {
      updateGame(pause)
    }
  }, [game.paused, updateGame])

  const handleUnpause = useCallback(() => {
    updateGame(unpause)
  }, [updateGame])

  const updateViewport = useCallback((
    viewportSize: { width: number; height: number },
    viewportCenter: { x: number; y: number }
  ) => {
    const player = world.player

    const oldCenter = viewportCenter
    let newCenterX = oldCenter.x
    let newCenterY = oldCenter.y

    const SMALL_MAP_THRESHOLD = 15
    const SCROLL_THRESHOLD_PERCENT = 0.25

    if (player !== undefined) {
      if (viewportSize.width > SMALL_MAP_THRESHOLD && viewportSize.height > SMALL_MAP_THRESHOLD) {
        const left = Math.floor(oldCenter.x - (viewportSize.width / 2))
        const right = Math.floor(oldCenter.x + (viewportSize.width / 2) - 1)
        const top = Math.floor(oldCenter.y - (viewportSize.height / 2))
        const bottom = Math.floor(oldCenter.y + (viewportSize.height / 2) - 1)

        const minPeekColumns = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * viewportSize.width))
        const minPeekRows = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * viewportSize.height))

        const leftAdjust = Math.min(0, player.x - (left + minPeekColumns))
        const rightAdjust = Math.max(0, player.x - (right - minPeekColumns))
        const horizontalAdjust = leftAdjust !== 0 ? leftAdjust : rightAdjust
        newCenterX = oldCenter.x + horizontalAdjust

        const upAdjust = Math.min(0, player.y - (top + minPeekRows - 1))
        const downAdjust = Math.max(0, player.y - (bottom - minPeekRows + 1))
        const verticalAdjust = upAdjust !== 0 ? upAdjust : downAdjust
        newCenterY = oldCenter.y + verticalAdjust
      } else if (viewportSize.width > 0 && viewportSize.height > 0) {
        // just always center small maps
        newCenterX = player.x
        newCenterY = player.y
      }
    }

    if (newCenterX !== oldCenter.x || newCenterY !== oldCenter.y) {
      setViewportCenter({ x: newCenterX, y: newCenterY })
    }
  }, [world.player])

  const handleViewportResize = useCallback((width, height) => {
    const size = { width, height }
    setViewportSize(size)
    updateViewport(size, viewportCenter)
  }, [updateViewport, viewportCenter])

  const executeTurn = useCallback((playerAction: Action) => {
    if (!game.paused) {
      world.nextTurn(playerAction)

      // update our recoil state based on the new world state
      updateExpedition(endTurn)

      // recenter viewport based on player movement, if needed
      updateViewport(viewportSize, viewportCenter)
    }
  }, [game.paused, updateExpedition, updateViewport, viewportCenter, viewportSize, world])

  const executePlayerMove = useCallback((x: number, y: number) => () => {
    if (!game.paused) {
      const player = world.player
      const creature = world.map.getCreature(player.x + x, player.y + y)
      if (creature === undefined) {
        executeTurn(MoveByAction(player, x, y))
      } else {
        executeTurn(AttackAction(player, creature))
      }
    }
  }, [executeTurn, game.paused, world.map, world.player])

  const handleInventoryAction = useCallback((item: Item, action: ItemInventoryAction) => {
    executeTurn(UseInventoryItemAction(
      world.player,
      action.name,
      item
    ))
    setActivePanel(SelectablePanels.Map)
  }, [executeTurn, world])

  const mapKeyHandler = useKeyHandler({
    ArrowDown: executePlayerMove(0, 1),
    ArrowLeft: executePlayerMove(-1, 0),
    ArrowRight: executePlayerMove(1, 0),
    ArrowUp: executePlayerMove(0, -1),
  })

  const handlePauseMenuSelection = useCallback((item: string) => {
    switch (item) {
      case 'Resume':
        handleUnpause()
        break

      case 'Quit Expedition':
        navigateTo('title')
        break
    }
  }, [handleUnpause, navigateTo])

  useGlobalKeyHandler({
    Escape: handleEscape,
    Tab: () => setActivePanel((current) => (current + 1) % SelectablePanels.__LENGTH),
  })

  useEffect(() => {
    if (isComplete) {
      navigateTo('expedition-ended')
    }
  }, [isComplete, navigateTo])

  const renderPauseMenu = () => {
    return (
      <PopupMenu
        items={['Resume', 'Quit Expedition']}
        onSelectionConfirmed={handlePauseMenuSelection}
      />
    )
  }

  return (ready) ? (
    <div className="dungeon-screen">
      <div className="main-content">
        <MapPanel
          active={activePanel === SelectablePanels.Map && !game.paused}
          centerX={viewportCenter.x}
          centerY={viewportCenter.y}
          onClick={handleActivatePanel(SelectablePanels.Map)}
          onKeyDown={mapKeyHandler}
          onViewportSizeChanged={handleViewportResize}
        />

        <LogPanel world={world} />
      </div>

      <div className="sidebar">
        <PlayerStatusPanel />

        {/* <Panel columns={SidebarColumns} rows={5}>
          <PreFormattedText>{`You attack kobold!

🗡️ x5: 2  1  0  1  0  1
🛡️ x3: 0  1  0
💔 -2

🛡️ x3 - 0  1  0`}</PreFormattedText>
        </Panel> */}

        <InventoryPanel
          active={activePanel === SelectablePanels.Information && !game.paused}
          allowSelection={true}
          columns={SidebarColumns}
          onClick={handleActivatePanel(SelectablePanels.Information)}
          onInventoryAction={handleInventoryAction}
        />

        <Panel columns={SidebarColumns} rows={8}>
          Lorem ipsum dolor sit amet.
        </Panel>
      </div>

      {game.paused ? renderPauseMenu() : null}
    </div>
  ) : null
}
