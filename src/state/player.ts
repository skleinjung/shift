import { atom, selector } from 'recoil'

import { Creature } from './creature'

const InitialLinkValue = 50

export interface Player extends Creature {
  /** player's current health */
  health: number

  /** player's maximum health value */
  healthMax: number

  /** the strength of the player's link to the current expedition's location */
  link: number

  /** player's character name */
  name: string
}

export const newPlayer = (): Player => ({
  color: 0xffffff,
  health: 10,
  healthMax: 10,
  link: InitialLinkValue,
  name: 'Mystericus the Untitled',
  symbol: '@',
  x: 0,
  y: 0,
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
