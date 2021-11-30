import { World } from 'engine/world'
import { useEffect } from 'react'

import { useGame } from './use-game'
import { useRerenderTrigger } from './use-rerender-trigger'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current world state or, optionally, a subset of it. Will rerender each turn. */
export const useWorld = () => {
  const [rerender] = useRerenderTrigger()
  const game = useGame()
  const world = game.world

  useEffect(() => {
    const doRerender = () => {
      rerender()
    }

    game.on('worldChange', doRerender)
    world.on('update', doRerender)
    return () => {
      game.off('worldChange', doRerender)
      world.off('update', doRerender)
    }
  }, [game, rerender, world])

  return world
}
