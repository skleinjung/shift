/* eslint-disable @typescript-eslint/naming-convention */
import { CreatureTypeId } from '../creature-db'
import { TerrainTypeId } from '../terrain-db'

import { MapSymbol } from './map-symbol'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ColorValues = {
  AggressiveCreature: {
    background: 0x220000,
    color: 0x990000,
  },
  PassiveCreature: {
    color: 0x222200,
    background: 0x999900,
  },
  White: 0xffffff,
} as const

/** Map symbols for all creature types. */

export const CreatureSymbols: { default: MapSymbol } & { [k in CreatureTypeId]?: MapSymbol } = {
  default: {
    background: 0x002200,
    color: 0xffffff,
    symbol: 'z',
  },
  dart_lizard: {
    ...ColorValues.PassiveCreature,
    symbol: 'L',
  },
  goblin: {
    ...ColorValues.AggressiveCreature,
    symbol: 'g',
  },
  kobold: {
    ...ColorValues.PassiveCreature,
    symbol: 'k',
  },
  orc: {
    ...ColorValues.AggressiveCreature,
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
  brambles: {
    background: 0x559900,
    color: 0x553300,
    symbol: '+',
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
  heavy_brush: {
    background: 0x002200,
    color: 0x113300,
    symbol: '#',
  },
  light_brush_1: {
    background: 0x006600,
    color: 0x339900,
    symbol: '.',
  },
  light_brush_2: {
    background: 0x006600,
    color: 0x002200,
    symbol: '\'',
  },
  light_brush_3: {
    background: 0x115500,
    color: 0x339900,
    symbol: '`',
  },
  path: {
    background: 0x555500,
    color: 0x333300,
    symbol: ':',
  },
  water: {
    background: 0x0000cc,
    color: 0xccccff,
    symbol: ',',
  },
  water_shallow: {
    background: 0x00aadd,
    color: 0x0033aa,
    symbol: '`',
  },
  wall: {
    background: 0x333333,
    color: 0x555555,
    symbol: '#',
  },
} as const
