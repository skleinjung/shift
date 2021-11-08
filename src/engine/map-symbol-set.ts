import { CreatureTypeId } from './creature-db'
import { MapSymbol } from './map-symbol'
import { TerrainTypeId } from './terrain-db'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ColorValues = {
  White: 0xffffff,
} as const

/** Map symbols for all creature types. */

export const CreatureSymbols: { [k in CreatureTypeId | 'default']: MapSymbol } = {
  default: {
    background: 0x002200,
    color: 0xffffff,
    symbol: 'z',
  },
  goblin: {
    background: 0x220000,
    color: 0x990000,
    symbol: 'g',
  },
  kobold: {
    background: 0x220000,
    color: 0x990000,
    symbol: 'k',
  },
  orc: {
    background: 0x220000,
    color: 0x990000,
    symbol: 'o',
  },
  player: {
    background: 0x002200,
    color: 0xffffff,
    symbol: '@',
  },
}

/** Map symbols for all types of items. */
export const ItemSymbols: { [k in 'default' | 'multiple']: MapSymbol } = {
  default: {
    color: 0xffffff,
    symbol: '(',
  },
  multiple: {
    color: 0x00ff00,
    symbol: '(',
  },
} as const

/** Map symbols for all types of terrain. */
export const TerrainSymbols: { [k in TerrainTypeId]: MapSymbol } = {
  default: {
    background: 0,
    color: 0,
    symbol: ' ',
  },
  door: {
    background: 0x111111,
    color: 0x555555,
    symbol: '+',
  },
  floor: {
    background: 0x111111,
    color: 0x222222,
    symbol: '.',
  },
  water: {
    background: 0x0000cc,
    color: 0x0096ff,
    symbol: '`',
  },
  wall: {
    background: 0x333333,
    color: 0x555555,
    symbol: '#',
  },
} as const
