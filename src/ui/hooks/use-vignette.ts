import { World } from 'engine/world'
import { useEffect } from 'react'

import { useEngine } from './use-engine'
import { useRerenderTrigger } from './use-rerender-trigger'

export type WorldSelector<T extends any = any> = (world: World) => T

/** Returns the current vignette, if there is one. Will rerender whenever the vignette is advanced. */
export const useVignette = () => {
  const [rerender] = useRerenderTrigger()
  const vignette = useEngine().vignette

  useEffect(() => {
    const handleEvent = () => {
      rerender()
    }

    if (vignette !== undefined) {
      vignette.on('advance', handleEvent)
      return () => {
        vignette.off('advance', handleEvent)
      }
    } else {
      return () => { /* no cleanup */ }
    }
  }, [rerender, vignette])

  return vignette
}
