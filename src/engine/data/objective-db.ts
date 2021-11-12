import { CreatureTypes } from 'engine/creature-db'
import { ObjectiveData } from 'engine/objective'
import { keys, reduce } from 'lodash/fp'

const objectivesArray = [
  {
    id: 'problem_of_scale',
    description: 'The lizards filling these caverns, while mostly harmless, are interfering with Wizardo\'s ' +
    'experiments. You are to kill "the whole bloody lot of them".',
    goal: 10,
    name: 'A Problem of Scale',
    targetType: CreatureTypes.kobold.id,
    type: 'kill',
  },
  {
    id: 'strange_blue_rock',
    description: 'After dispatching the lizard threat, Wizardo wants you to ' +
    'find a specific blue stone somewhere nearby.',
    goal: 1,
    name: 'Strange Blue Rock',
    targetType: CreatureTypes.kobold.id,
    type: 'kill',
  },
] as const

export const Objectives = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, objectivesArray) as Record<typeof objectivesArray[number]['id'], ObjectiveData>

export type ObjectiveId = keyof typeof Objectives
export const ObjectiveIds = keys(Objectives) as ObjectiveId[]
