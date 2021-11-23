import './expedition-screen.css'

import { AttackAction } from 'engine/actions/attack'
import { DoNothing } from 'engine/actions/do-nothing'
import { MoveByAction } from 'engine/actions/move-by'
import { CellCoordinate } from 'engine/map/map'
import { Action } from 'engine/types'
import { useCallback, useEffect, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useGame } from 'ui/hooks/use-game'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { useWorld } from 'ui/hooks/use-world'
import { getKeyMap } from 'ui/key-map'
import { endTurn, expeditionState } from 'ui/state/expedition'
import { speechState } from 'ui/state/speech'

import { ScreenName } from './app'
import { CommandInputBox } from './command-input-box'
import { ExpeditionMenuController } from './expedition-menu-controller'
import { InventoryPanel } from './inventory-panel'
import { LogPanel } from './log-panel'
import { MapPanel } from './map-panel'
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
  const [enteringCommand, setEnteringCommand] = useState(false)
  const speech = useRecoilValue(speechState)
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | undefined>()

  const inSpeech = speech !== undefined && speech.speech.length > 0

  const game = useGame()
  const world = useWorld()
  const updateExpedition = useSetRecoilState(expeditionState)

  const isPaused = inMenus || inSpeech || enteringCommand || world.paused
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const executeCommand = useCallback((command: string) => {
    setEnteringCommand(false)
    game.executeCommand(command)
  }, [game])

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

  const beginCommandEntry = useCallback(() => {
    setEnteringCommand(true)
  }, [setEnteringCommand])

  const cancelCommandEntry = useCallback(() => {
    setEnteringCommand(false)
  }, [])

  const handleMapClick = useCallback((x: number, y: number) => {
    if (!isPaused) {
      world.player.destination = { x, y }
    }
  }, [isPaused, world.player])

  const handleCellFocus = useCallback((cell) => {
    setFocusedCell((previous) => {
      if (cell === undefined) {
        return cell
      }

      return cell.x === previous?.x && cell.y === previous?.y
        ? previous
        : cell
    })
  }, [])

  const keyMap = getKeyMap()
  const mapKeyHandler = useKeyHandler({
    [keyMap.EnterCommand]: beginCommandEntry,
    [keyMap.MoveDown]: executePlayerMove(0, 1),
    [keyMap.MoveLeft]: executePlayerMove(-1, 0),
    [keyMap.MoveRight]: executePlayerMove(1, 0),
    [keyMap.MoveUp]: executePlayerMove(0, -1),
    [keyMap.Travel]: () => executeCommand('use portal'),
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
          containerClass="expedition-panel map-canvas"
          focusedCell={focusedCell}
          onCellFocus={handleCellFocus}
          onMapClick={handleMapClick}
          onKeyDown={mapKeyHandler}
        />

        {!inSpeech && !enteringCommand && (
          <ExpeditionMenuController
            onHideMenu={handleHideMenu}
            onPlayerAction={executeTurn}
            onQuitExpedition={handleQuitExpedition}
            onShowMenu={handleShowMenu}
          />
        )}

        <div className='main-content-footer'>
          <SpeechWindow classes={inSpeech ? ['fade-in'] : ['fade-out']} />

          {!inSpeech &&
            <TileDescriptionPanel
              containerClass="expedition-panel expedition-screen-tile-description fade-in"
            />}

          {/* <TooltipPanel
            containerClass="expedition-panel expedition-screen-tooltip"
            focusedTile={focusedCell
              ? world.map.getMapTile(focusedCell.x, focusedCell.y)
              : undefined}ee
          /> */}
        </div>

      </div>

      <div className="sidebar">
        <PlayerStatusPanel
          containerClass="expedition-panel"
        />

        {/* <ObjectivePanel
          active={false}
          allowSelection={false}
          columns={SidebarColumns}
          containerClass="expedition-panel"
          rows={7}
          showDescriptions={false}
        /> */}

        <InventoryPanel
          active={false}
          allowSelection={false}
          columns={SidebarColumns}
          containerClass="expedition-panel"
          showSlot={true}
        />

        <LogPanel
          columns={SidebarColumns}
          containerClass="expedition-panel"
          rows={14}
          world={world}
        />

        <CommandInputBox
          active={enteringCommand}
          onCancel={cancelCommandEntry}
          onCommand={executeCommand}
        />
      </div>
    </div>
  )
}
