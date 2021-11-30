import './expedition-screen.css'

import { CellCoordinate } from 'engine/map/map'
import { Action } from 'engine/types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { useCampaign, useGame } from 'ui/hooks/use-game'
import { useWorld } from 'ui/hooks/use-world'
import { InputManager } from 'ui/input/input-manager'
import { DefaultState } from 'ui/input/states'
import { InputCommand } from 'ui/input/types'
import { endTurn, expeditionState } from 'ui/state/expedition'
import { speechState } from 'ui/state/speech'
import { uiState } from 'ui/state/ui'

import { ScreenName } from './app'
import { CommandInputBox } from './command-input-box'
import { ExpeditionMenuController } from './expedition-menu-controller'
import { InventoryItemMenu } from './inventory-item-menu'
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
  const ui = useRecoilValue(uiState)
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | undefined>()

  const inSpeech = speech !== undefined && speech.speech.length > 0

  const campaign = useCampaign()
  const game = useGame()
  const world = useWorld()
  const updateExpedition = useSetRecoilState(expeditionState)

  const inputManagerRef = useRef<InputManager>(new InputManager(new DefaultState()))

  const isPaused = inMenus || inSpeech || enteringCommand || world.paused
  const isComplete = world.expeditionEnded

  // whenever we rerender, check if we have won
  useEffect(() => {
    if (campaign.victory) {
      navigateTo('victory')
    }
  })

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

  // add listeners for input manager events
  useEffect(() => {
    const commandListener = (command: InputCommand) => {
      command(game)
    }

    const currentInputManager = inputManagerRef.current
    currentInputManager.addListener('command', commandListener)

    return () => {
      currentInputManager.removeListener('command', commandListener)
    }
  }, [executeTurn, game])

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

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isPaused) {
      inputManagerRef.current.onKeyPress(game, event.key)
    }
  }, [game, isPaused])

  const handleMenuSelection = useCallback((selectedValue: number) => {
    inputManagerRef.current.onMenuSelection(game, selectedValue)
  }, [game])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    if (isComplete) {
      navigateTo('expedition-ended')
    }
  }, [isComplete, navigateTo])

  const getMenu = () => {
    switch (ui.activeMenu) {
      case 'inventory-item':
        return <InventoryItemMenu
          onItemSelected={handleMenuSelection}
          title="Which Item?"
        />

      default:
        return undefined
    }
  }

  return (
    <div className="dungeon-screen">
      <div className="main-content">
        <MapPanel
          active={!isPaused && ui.activeMenu === undefined}
          containerClass="expedition-panel map-canvas"
          focusedCell={focusedCell}
          onCellFocus={handleCellFocus}
          onMapClick={handleMapClick}
        />

        {!inSpeech && !enteringCommand && (
          <ExpeditionMenuController
            onHideMenu={handleHideMenu}
            onPlayerAction={executeTurn}
            onQuitExpedition={handleQuitExpedition}
            onShowMenu={handleShowMenu}
          />
        )}

        {getMenu()}

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
