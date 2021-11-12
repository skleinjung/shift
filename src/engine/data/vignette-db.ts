import { VignetteConfig } from 'engine/vignette'
import { keys, reduce } from 'lodash/fp'

const vignettesArray = [
  {
    id: 'problem_of_scale__first_kill',
    steps: {
      speech: [
        {
          message: 'Yes, yes. Just like that.',
          speaker: 'Wizardo',
        },
        {
          message: 'Well? What are you waiting for? Kill the rest!',
          speaker: 'Wizardo',
        },
      ],
      type: 'speech',
    },
  },
] as const

export const Vignettes = reduce((result, type) => ({
  ...result,
  [type.id]: type,
}), {}, vignettesArray) as Record<typeof vignettesArray[number]['id'], VignetteConfig>

export type VignetteId = keyof typeof Vignettes
export const ObjectiveIds = keys(Vignettes) as VignetteId[]
