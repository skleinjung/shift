import { Command } from 'engine/types'

import { help } from './help'
import { east, move, north, south, west } from './movement'

export const Commands: { [k: string]: Command } = {
  e: east,
  east,
  help,
  move,
  n: north,
  north,
  s: south,
  south,
  w: west,
  west,
}
