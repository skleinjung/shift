import { World } from 'engine/world'
import { useEffect } from 'react'

import { useEngine } from './use-engine'
import { useRerenderTrigger } from './use-rerender-trigger'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current world state or, optionally, a subset of it. Will rerender each turn. */
export const useWorld = () => {
  const [rerender] = useRerenderTrigger()
  const world = useEngine().world

  useEffect(() => {
    const handleTurnEvent = () => {
      rerender()
    }

    world.on('update', handleTurnEvent)
    return () => {
      world.off('update', handleTurnEvent)
    }
  }, [rerender, world])

  return world
}
