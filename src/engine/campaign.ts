import { forEach } from 'lodash/fp'

import { WorldScript } from './api/script-interfaces'
import { CreatureEventNames } from './events/creature'
import { Objective } from './objective'
import { Player } from './player'
import { Zone, ZoneId, Zones } from './zone-db'

/**
 * The Campaign represents all game and player state that persists beyond a single zone.
 */
export class Campaign {
  /** record of how many times each zone has been visited */
  private _timesVisited: Record<ZoneId, number> = {}

  /** the hero's current objectives */
  private _objectives: Objective[] = []

  /** the persistent player object */
  private _player = new Player()

  public defaultZone: ZoneId | undefined
  private _zones: Record<ZoneId, Zone> = {}

  private _injectPlayer: WorldScript = {
    onInitialize: ({ api }) => {
      // TODO: force removing all events here is a hack required because player wasn't persistent until 11th hour
      forEach((eventName) => {
        this._player.removeAllListeners(eventName)
      }, CreatureEventNames)

      this._player.removeAllListeners('move')
      this._player.moveTo(0, 0)
      api.addCreature(this._player)
    },
  }

  /** Retrieves the player's active objectives */
  public get objectives (): readonly Objective[] {
    return this._objectives
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
  }

  public addZone (zone: Zone) {
    this._zones[zone.id] = zone
  }

  public getTimesVisited (id: ZoneId): number {
    return this._timesVisited[id] ?? 0
  }

  public getZoneScripts (id: ZoneId) {
    this._timesVisited[id] = this.getTimesVisited(id) + 1
    return [this._injectPlayer, ...Zones[id].scripts]
  }
}

export class DemoCampaign extends Campaign {
  constructor () {
    super()

    this.addZone(Zones.sanctuary)
    this.addZone(Zones.forest)
    this.addZone(Zones.troll_lair)
    this.defaultZone = Zones.sanctuary.id
  }
}
