import { CreatureTypes } from 'engine/creature-db'
import { Objective } from 'engine/objective'
import { atom } from 'recoil'

export interface Expedition {
  /** objectives for the current expedition */
  objectives: Objective[]

  /** the current turn number */
  turn: number
}

export const newExpedition = (): Expedition => ({
  objectives: [
    new Objective({
      description: 'The lizards filling these caverns, while mostly harmless, are interfering with Wizardo\'s ' +
      'experiments. You are to kill "the whole bloody lot of them".',
      goal: 10,
      name: 'A Problem of Scale',
      targetType: CreatureTypes.kobold.id,
      type: 'kill',
    }),
    new Objective({
      description: 'After dispatching the lizard threat, Wizardo wants you to ' +
      'find a specific blue stone somewhere nearby.',
      goal: 1,
      name: 'Strange Blue Rock',
      targetType: CreatureTypes.kobold.id,
      type: 'kill',
    }),
  ],
  turn: 1,
})

export const expeditionState = atom<Expedition>({
  key: 'expeditionState',
  default: newExpedition(),
})

export const endTurn = (expedition: Expedition): Expedition => ({
  ...expedition,
  turn: expedition.turn + 1,
})
