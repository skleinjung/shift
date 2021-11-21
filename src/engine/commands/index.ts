import { Command } from 'engine/types'

import { help } from './help'
import { east, move, north, south, west } from './movement'
import { say } from './say'

export const Commands: { [k: string]: Command } = {
  e: east,
  east,
  help,
  move,
  n: north,
  north,
  say,
  s: south,
  south,
  w: west,
  west,
}
