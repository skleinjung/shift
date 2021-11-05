/* eslint-disable max-len */
import { useKeyHandler } from 'hooks/use-key-handler'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState, useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil'
import { endTurn, expeditionState, InitialLinkValue, isExpeditionComplete } from 'state/expedition'
import { gameState, pause, unpause } from 'state/game'
import { playerState } from 'state/player'
import { Action, AttackAction, MoveByAction } from 'world/actions'
import { World } from 'world/world'

import { ScreenName } from './app'
import { MapPanel } from './map-panel'
import { Panel } from './panel'
import { PopupMenu } from './popup-menu'
import { PreFormattedText } from './pre-formatted-text'

import './expedition-screen.css'

const SidebarColumns = 30

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

const PlayerStatusPanel = () => {
  const expedition = useRecoilValue(expeditionState)
  const player = useRecoilValue(playerState)

  const status = `Health: ${player.health}/${player.healthMax}
Link  : ${Math.floor(expedition.link / InitialLinkValue * 100)}%
Turn  : ${expedition.turn}`

  return (
    <Panel columns={SidebarColumns} rows={3}>
      <PreFormattedText>{status}</PreFormattedText>
    </Panel>
  )
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const world = useRef<World | null>()
  const [ready, setReady] = useState(false)

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

  const handlePause = useCallback(() => {
    updateGame(pause)
  }, [updateGame])

  const handleUnpause = useCallback(() => {
    updateGame(unpause)
  }, [updateGame])

  const updateViewport = useCallback((viewportSize: { width: number; height: number }, viewportCenter: { x: number; y: number }) => {
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
        executeTurn(MoveByAction(x, y))
      } else {
        executeTurn(AttackAction(creatureId))
      }
    }
  }, [executeTurn, game.paused])

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

  useKeyHandler({
    ArrowDown: executePlayerMove(0, 1),
    ArrowLeft: executePlayerMove(-1, 0),
    ArrowRight: executePlayerMove(1, 0),
    ArrowUp: executePlayerMove(0, -1),
    Escape: handlePause,
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

        <Panel columns={SidebarColumns}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>

        <Panel columns={SidebarColumns} rows={10}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>

        <Panel columns={SidebarColumns} rows={5}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam porta ac diam at facilisis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent bibendum auctor congue. Morbi a dapibus tortor. Quisque in faucibus justo, sit amet vehicula lectus. Maecenas pellentesque tincidunt lectus, in convallis ipsum ullamcorper nec. Nulla fermentum aliquam eros, ut molestie massa venenatis at. Nulla faucibus tempus metus, et faucibus ipsum volutpat eget. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Morbi et nulla non enim euismod gravida sit amet ut dui. Nulla et eros eget nisi consequat tincidunt. Praesent mollis dui congue dignissim venenatis. Curabitur est nulla, eleifend ut orci eget, porttitor lobortis lorem. Vivamus turpis magna, pulvinar sed dolor vel, congue aliquet turpis. Pellentesque dictum sollicitudin gravida. Ut a est sed tortor pretium tempus. Morbi eget scelerisque orci. In rutrum odio est, eu faucibus massa viverra ut. Fusce convallis iaculis cursus. Proin sed neque a dui vehicula faucibus. Praesent sit amet bibendum sapien, ultrices sagittis sapien. Etiam facilisis dapibus orci eget aliquet. Nam congue porttitor varius. Integer maximus arcu id ullamcorper placerat. Donec quis egestas mi, at ultricies dolor. Mauris rutrum urna sed eros consequat semper. Aliquam tincidunt in elit at feugiat. Morbi et lorem congue, facilisis mi ac, fringilla enim. Cras aliquam lacus ut augue porttitor pulvinar. Fusce in lectus turpis. Donec consectetur enim quis blandit sagittis. Mauris interdum lectus nisi, vel rhoncus turpis laoreet sed. Sed egestas finibus tempor. Nullam rutrum dapibus turpis, ut vehicula justo vehicula in. Praesent eu augue fermentum, malesuada ex et, vestibulum nulla. Duis condimentum rutrum velit non aliquam. Donec maximus nisi metus, et vehicula nisi aliquet non. Curabitur arcu neque, tempor nec ipsum id, imperdiet sollicitudin neque. Praesent bibendum tristique dapibus. Morbi aliquet fringilla mauris, sed sodales risus porttitor nec. Quisque bibendum tincidunt dolor, vitae faucibus neque scelerisque id. Proin ut consequat ligula. Quisque rhoncus augue at libero ultrices, non imperdiet lorem laoreet. Donec tempor tempor sem condimentum ornare. Curabitur elementum sollicitudin convallis. Integer et laoreet arcu, laoreet laoreet turpis. Aenean sit amet nibh ut nisi suscipit laoreet vitae et odio. Duis aliquet commodo ligula porttitor fermentum. Maecenas convallis molestie nulla, nec rhoncus tortor suscipit sed. Pellentesque eu erat ut nisl pretium interdum. Nulla sagittis, neque at faucibus luctus, tortor ligula laoreet mi, at efficitur justo mauris eu sem. Praesent blandit volutpat quam, facilisis bibendum enim pharetra a. Vestibulum eu euismod urna.
        </Panel>
      </div>

      {world.current &&
        <div className="main-content">
          <MapPanel
            centerX={viewportCenter.x}
            centerY={viewportCenter.y}
            onViewportSizeChanged={handleViewportResize}
            world={world.current}
          />
        </div>
      }

      {game.paused ? renderPauseMenu() : null}
    </div>
  ) : null
}
