import { CreatureType, CreatureTypes } from 'db/creatures'
import { atom } from 'recoil'

export interface Player extends CreatureType {
  /** player's current health */
  health: number
}

export const newPlayer = (): Player => ({
  ...CreatureTypes.player,
  health: 10,
})

export const playerState = atom<Player>({
  key: 'playerState',
  default: newPlayer(),
})

export const dealDamage = (amount: number) => (player: Player): Player => ({
  ...player,
  health: player.health - amount,
})
