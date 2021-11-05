import { CreatureType, CreatureTypes, PlayerCreatureTypeId } from 'db/creatures'
import { atom, selector } from 'recoil'

const InitialLinkValue = 50

export interface Player extends CreatureType {
  /** player's current health */
  health: number

  /** the strength of the player's link to the current expedition's location */
  link: number
}

export const newPlayer = (): Player => ({
  ...CreatureTypes[PlayerCreatureTypeId],
  health: 10,
  link: InitialLinkValue,
})

export const playerState = atom<Player>({
  key: 'playerState',
  default: newPlayer(),
})

export const isExpeditionComplete = selector({
  key: 'isExpeditionComplete',
  get: ({ get }) => {
    const player = get(playerState)
    return player.link < 1 || player.health < 1
  },
})

export const endTurn = (player: Player): Player => ({
  ...player,
  link: player.link - 1,
})

export const dealDamage = (amount: number) => (player: Player): Player => ({
  ...player,
  health: player.health - amount,
})
