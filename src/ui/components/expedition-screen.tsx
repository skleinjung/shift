import './expedition-screen.css'

import { AttackAction } from 'engine/actions/attack'
import { DoNothing } from 'engine/actions/do-nothing'
import { MoveByAction } from 'engine/actions/move-by'
import { CellCoordinate } from 'engine/map/map'
import { Action } from 'engine/types'
import { useCallback, useEffect, useState } from 'react'
import { useSetRecoilState } from 'recoil'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { useWorld } from 'ui/hooks/use-world'
import { getKeyMap } from 'ui/key-map'
import { endTurn, expeditionState } from 'ui/state/expedition'

import { ScreenName } from './app'
import { ExpeditionMenuController } from './expedition-menu-controller'
import { InventoryPanel } from './inventory-panel'
import { LogPanel } from './log-panel'
import { MapPanel } from './map-panel'
import { ObjectivePanel } from './objective-panel'
import { Panel } from './panel'
import { PlayerStatusPanel } from './player-status-panel'
import { SpeechWindow } from './speech-window'
import { TileDescriptionPanel } from './tile-description-panel'

const SidebarColumns = 45

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const [inMenus, setInMenus] = useState(false)
  const [inSpeech, setInSpeech] = useState(false)
  const [highlightedCell, setHighlightedCell] = useState<CellCoordinate | undefined>()

  const world = useWorld()
  const updateExpedition = useSetRecoilState(expeditionState)

  const isPaused = inMenus || inSpeech || world.paused
  const isComplete = world.expeditionEnded

  const handleQuitExpedition = useCallback(() => {
    navigateTo('title')
  }, [navigateTo])

  const handleShowMenu = useCallback(() => {
    setInMenus(true)
  }, [])

  const handleHideMenu = useCallback(() => {
    setInMenus(false)
  }, [])

  const handleShowSpeech = useCallback(() => {
    setInSpeech(true)
  }, [])

  const handleHideSpeech = useCallback(() => {
    setInSpeech(false)
  }, [])

  const executeTurn = useCallback((playerAction: Action) => {
    world.player.nextAction = playerAction

    // update our recoil state based on the new world state
    updateExpedition(endTurn)
  }, [updateExpedition, world.player])

  const executePlayerMove = useCallback((x: number, y: number) => () => {
    if (!isPaused) {
      const player = world.player

      // stop auto-pathfinding, if we were in the middle of it
      player.destination = undefined

      const creature = world.map.getCreature(player.x + x, player.y + y)
      if (creature === undefined) {
        executeTurn(new MoveByAction(player, x, y))
      } else {
        executeTurn(new AttackAction(player, creature))
      }
    }
  }, [executeTurn, isPaused, world.map, world.player])

  const handleMapClick = useCallback((x: number, y: number) => {
    world.player.destination = { x, y }
  }, [world.player])

  const handleMapHighlight = useCallback((x: number, y: number) => {
    setHighlightedCell((previous) => {
      return x === previous?.x && y === previous?.y
        ? previous
        : { x, y }
    })
  }, [])

  const keyMap = getKeyMap()
  const mapKeyHandler = useKeyHandler({
    [keyMap.MoveDown]: executePlayerMove(0, 1),
    [keyMap.MoveLeft]: executePlayerMove(-1, 0),
    [keyMap.MoveRight]: executePlayerMove(1, 0),
    [keyMap.MoveUp]: executePlayerMove(0, -1),
    [keyMap.Wait]: () => executeTurn(DoNothing),
  })

  useEffect(() => {
    if (isComplete) {
      navigateTo('expedition-ended')
    }
  }, [isComplete, navigateTo])

  return (
    <div className="dungeon-screen">
      <div className="main-content">
        <MapPanel
          active={!isPaused}
          containerClass="expedition-panel"
          focusedCell={highlightedCell}
          onMapClick={handleMapClick}
          onMapHover={handleMapHighlight}
          onKeyDown={mapKeyHandler}
        />

        <div className='main-content-footer'>
          <LogPanel
            containerClass="expedition-panel expedition-screen-log"
            style={{ flex: 1 }}
            world={world}
          />

          <TileDescriptionPanel
            containerClass="expedition-panel expedition-screen-tile-description"
            style={{ flex: 1 }}
          />
        </div>
      </div>

      <div className="sidebar">
        <PlayerStatusPanel
          containerClass="expedition-panel"
        />

        <ObjectivePanel
          active={false}
          allowSelection={false}
          columns={SidebarColumns}
          containerClass="expedition-panel"
          rows={7}
          showDescriptions={false}
        />

        <InventoryPanel
          active={false}
          allowSelection={false}
          columns={SidebarColumns}
          containerClass="expedition-panel"
          showSlot={true}
        />

        <Panel
          containerClass="expedition-panel"
          columns={SidebarColumns}
          rows={8}
        >
          {highlightedCell && `(${highlightedCell.x}, ${highlightedCell.y})`}
        </Panel>
      </div>

      <SpeechWindow
        onHideSpeech={handleHideSpeech}
        onShowSpeech={handleShowSpeech}
      />
      {!inSpeech && (
        <ExpeditionMenuController
          onHideMenu={handleHideMenu}
          onPlayerAction={executeTurn}
          onQuitExpedition={handleQuitExpedition}
          onShowMenu={handleShowMenu}
        />
      ) }
    </div>
  )
}
