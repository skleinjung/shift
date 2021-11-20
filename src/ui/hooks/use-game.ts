import { World } from 'engine/world'
import { useContext } from 'react'
import { GameControllerContext } from 'ui/context-game'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current game controller. */
export const useGame = () => {
  const game = useContext(GameControllerContext)
  if (game === undefined) {
    throw new Error('useGame called outside of an <GameControllerContext.Provider ...>')
  }
  return game
}

/** Returns the current game engine state. */
export const useEngine = () => {
  return useGame().engine
}

/** Returns the current campaign. Will rerender when the campaign dispatches an 'update' event. */
export const useCampaign = () => {
  return useGame().campaign
}

export const useUi = () => {
  return useGame().ui
}
