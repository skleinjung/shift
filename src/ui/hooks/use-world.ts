import { World } from 'engine/world'
import { useContext, useEffect } from 'react'
import { GameContext } from 'ui/game-context'

import { useRerenderTrigger } from './use-rerender-trigger'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current world state or, optionally, a subset of it. Will rerender each turn. */
export const useWorld = () => {
  const [rerender] = useRerenderTrigger()
  const world = useContext(GameContext)

  useEffect(() => {
    const handleTurnEvent = () => {
      rerender()
    }

    world.on('turn', handleTurnEvent)
    return () => {
      world.off('turn', handleTurnEvent)
    }
  }, [rerender, world])

  return world
}
