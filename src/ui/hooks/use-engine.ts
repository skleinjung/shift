import { World } from 'engine/world'
import { useContext } from 'react'
import { EngineContext } from 'ui/context-engine'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current game engine state. */
export const useEngine = () => {
  const engine = useContext(EngineContext)
  return engine
}
