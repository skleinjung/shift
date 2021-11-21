import { Command } from 'engine/types'

import { help } from './help'

export const Commands: { [k: string]: Command } = {
  help,
}
