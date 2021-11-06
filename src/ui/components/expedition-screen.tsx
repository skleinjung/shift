/* eslint-disable no-console */
import { AttackAction } from 'engine/actions/attack'
import { MoveByAction } from 'engine/actions/move-by'
import { Action } from 'engine/types'
import { World } from 'engine/world'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil'
import { useGlobalKeyHandler } from 'ui/hooks/use-global-key-handler'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { endTurn, expeditionState, isExpeditionComplete } from 'ui/state/expedition'
import { gameState, pause, unpause } from 'ui/state/game'
import { playerState } from 'ui/state/player'

import { ScreenName } from './app'
import { ListPanel } from './list-panel'
import { LogPanel } from './log-panel'
import { MapPanel } from './map-panel'
import { Panel } from './panel'
import { PlayerStatusPanel } from './player-status-panel'
import { PopupMenu } from './popup-menu'
import { PreFormattedText } from './pre-formatted-text'

import './expedition-screen.css'

const SidebarColumns = 30

enum SelectablePanels {
  Information = 0,
  Map,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __LENGTH,
}

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const world = useRef<World | null>()
  const [ready, setReady] = useState(false)
  const [activePanel, setActivePanel] = useState<SelectablePanels>(SelectablePanels.Map)

  const resetExpedition = useResetRecoilState(expeditionState)
  const resetGame = useResetRecoilState(gameState)
  const resetPlayer = useResetRecoilState(playerState)

  const updateExpedition = useSetRecoilState(expeditionState)
  const updatePlayer = useSetRecoilState(playerState)

  const isComplete = useRecoilValue(isExpeditionComplete)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })
  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 })
  const [game, updateGame] = useRecoilState(gameState)

  useEffect(() => {
    world.current = new World()
    resetExpedition()
    resetGame()
    resetPlayer()
    setReady(true)
  }, [resetExpedition, resetGame, resetPlayer])

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
    const player = world.current?.player

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
  }, [])

  const handleViewportResize = useCallback((width, height) => {
    const size = { width, height }
    setViewportSize(size)
    updateViewport(size, viewportCenter)
  }, [updateViewport, viewportCenter])

  const executeTurn = useCallback((playerAction: Action) => {
    if (!game.paused && world.current) {
      world.current.nextTurn(playerAction)

      // update our recoil state based on the new world state
      updateExpedition(endTurn)
      updatePlayer((player) => {
        if (world.current) {
          const worldPlayer = world.current?.player
          return {
            ...player,
            health: worldPlayer.health,
          }
        }

        return player
      })

      updateViewport(viewportSize, viewportCenter)
    }
  }, [game.paused, updateExpedition, updatePlayer, updateViewport, viewportCenter, viewportSize])

  const executePlayerMove = useCallback((x: number, y: number) => () => {
    if (!game.paused && world.current) {
      const player = world.current.player
      const creatureId = world.current.map.getCreatureId(player.x + x, player.y + y)
      if (creatureId === undefined) {
        executeTurn(MoveByAction(player, x, y))
      } else {
        executeTurn(AttackAction(player, world.current.creatures[creatureId]))
      }
    }
  }, [executeTurn, game.paused])

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

  return ready ? (
    <div className="dungeon-screen">
      <div className="sidebar">
        <PlayerStatusPanel />

        <Panel columns={SidebarColumns} rows={5}>
          <PreFormattedText>{`You attack kobold!

🗡️ x5: 2  1  0  1  0  1
🛡️ x3: 0  1  0
💔 -2

🛡️ x3 - 0  1  0`}</PreFormattedText>
        </Panel>

        <ListPanel
          active={activePanel === SelectablePanels.Information && !game.paused}
          allowSelection={true}
          columns={SidebarColumns}
          items={[
            'Foo',
            'Bar',
            {
              id: 'baz',
              content: 'The Bazzle',
              rightContent: '0 / 3 / 1',
            },
          ]}
        >
        </ListPanel>

        <Panel columns={SidebarColumns} rows={8}>
          Lorem ipsum dolor sit amet.
        </Panel>
      </div>

      {world.current &&
        <div className="main-content">
          <MapPanel
            active={activePanel === SelectablePanels.Map && !game.paused}
            centerX={viewportCenter.x}
            centerY={viewportCenter.y}
            onKeyDown={mapKeyHandler}
            onViewportSizeChanged={handleViewportResize}
            world={world.current}
          />

          <LogPanel world={world.current} />
        </div>
      }

      {game.paused ? renderPauseMenu() : null}
    </div>
  ) : null
}
