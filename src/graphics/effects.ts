import * as particles from '@pixi/particle-emitter'
import { Container } from 'pixi.js'

import creatureDeathSmokeConfig from './particles/death.json'

export type VisualEffect = (container: Container) => void

/** Plays a 'creature death' effect at the specified container. */
export const creatureDeath: VisualEffect = (container) => {
  new particles.Emitter(
    container,
    creatureDeathSmokeConfig
  ).playOnceAndDestroy()
}
