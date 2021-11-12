import './expedition-screen.css'

import { AttackAction } from 'engine/actions/attack'
import { MoveByAction } from 'engine/actions/move-by'
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

const SidebarColumns = 35

export interface ExpeditionScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionScreen = ({ navigateTo }: ExpeditionScreenProps) => {
  const [inMenus, setInMenus] = useState(false)
  const [inSpeech, setInSpeech] = useState(false)

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

  const keyMap = getKeyMap()
  const mapKeyHandler = useKeyHandler({
    [keyMap.MoveDown]: executePlayerMove(0, 1),
    [keyMap.MoveLeft]: executePlayerMove(-1, 0),
    [keyMap.MoveRight]: executePlayerMove(1, 0),
    [keyMap.MoveUp]: executePlayerMove(0, -1),
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
          Lorem ipsum dolor sit amet.
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
