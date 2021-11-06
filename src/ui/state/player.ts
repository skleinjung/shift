import { CreatureAttributes, CreatureAttributeSet } from 'engine/creature'
import { Player as PlayerEntity } from 'engine/player'
import { Damageable, Entity, Positionable } from 'engine/types'
import { pick } from 'lodash/fp'
import { atom } from 'recoil'

export type Player = Pick<Damageable, 'dead'> & Entity & CreatureAttributeSet & Positionable

export const emptyPlayer = (): Player => ({
  dead: false,
  defense: 0,
  health: 0,
  healthMax: 0,
  id: -1,
  melee: 0,
  name: 'Unknown Hero',
  x: 0,
  y: 0,
})

export const playerState = atom<Player>({
  key: 'playerState',
  default: emptyPlayer(),
})

export const fromEntity = (player: PlayerEntity): Player => {
  return pick([
    ...CreatureAttributes,
    'dead',
    'id',
    'name',
    'x',
    'y',
  ], player)
}
