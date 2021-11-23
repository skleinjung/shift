import { DemoCampaign } from 'engine/campaign'
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

/**
 * Returns the current campaign. Will rerender when the game dispatches an 'update' event.
 *
 * TODO: this returns a new object every time, and is not implemented correctly at the moment
 **/
export const useCampaign = () => {
  return new DemoCampaign()
}

export const useUi = () => {
  return useGame().ui
}
