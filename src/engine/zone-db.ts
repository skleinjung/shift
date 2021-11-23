import { dartLizard } from 'game-content/scripts/creatures/dart-lizard'
import { forest } from 'game-content/scripts/zones/forest'
import { reduce } from 'lodash/fp'

import { WorldScript } from './api/script-interfaces'

export type Zone = Readonly<{
  /** id of this zone */
  id: string

  /** ZoneScripts that define this zone */
  scripts: readonly WorldScript[]
}>

const zoneArray: readonly Zone[] = [
  {
    id: 'sanctuary',
    scripts: [
      forest,
      dartLizard,
    ],
  },
] as const

export const Zones = reduce((result, zone) => ({
  ...result,
  [zone.id]: zone,
}), {}, zoneArray) as Record<typeof zoneArray[number]['id'], Zone>

export type ZoneId = string
