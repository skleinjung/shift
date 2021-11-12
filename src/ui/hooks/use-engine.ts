import { World } from 'engine/world'
import { useContext, useEffect } from 'react'
import { EngineContext } from 'ui/context-engine'

import { useRerenderTrigger } from './use-rerender-trigger'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current game engine state. Rerenders when a vignette begins or ends. */
export const useEngine = () => {
  const [rerender] = useRerenderTrigger()
  const engine = useContext(EngineContext)

  useEffect(() => {
    const handleEvent = () => {
      rerender()
    }

    engine.on('vignette', handleEvent)
    engine.on('vignetteComplete', handleEvent)
    return () => {
      engine.off('vignette', handleEvent)
      engine.off('vignetteComplete', handleEvent)
    }
  }, [engine, rerender])

  return engine
}
