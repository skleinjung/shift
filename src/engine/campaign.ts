import { forEach, upperFirst } from 'lodash/fp'

import { WorldScript } from './api/script-interfaces'
import { EventHandlerName } from './events/types'
import { WorldEventNames, WorldEvents } from './events/world'
import { Objective } from './objective'
import { Player } from './player'
import { World } from './world'
import { Zone, ZoneId, Zones } from './zone-db'

const StaticWorldScripts: readonly WorldScript[] = [
  {
    onInitialize: ({ api }) => {
      api.addCreature(new Player())
    },
  },
] as const

/**
 * The Campaign represents all game and player state that persists beyond a single zone.
 */
export class Campaign {
  /** record of how many times each zone has been visited */
  private _timesVisited: Record<ZoneId, number> = {}

  /** the hero's current objectives */
  private _objectives: Objective[] = []

  public defaultZone: ZoneId | undefined
  private _zones: Record<ZoneId, Zone> = {}

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
    return [...StaticWorldScripts, ...Zones[id].scripts]
  }

  private _registerZoneScripts (world: World, { scripts }: Zone) {
    forEach((script) => {
      forEach((eventName) => {
        const handlerName = `on${upperFirst(eventName)}` as EventHandlerName<keyof WorldEvents>
        const handler = script[handlerName]

        if (handler !== undefined) {
          world.on(eventName, (event: any) => {
            handler({ ...event, api: this })
          })
        }
      }, WorldEventNames)
    }, [...StaticWorldScripts, ...scripts])
  }
}

export class DemoCampaign extends Campaign {
  constructor () {
    super()

    this.addZone(Zones.sanctuary)
    this.addZone(Zones.forest)
    this.defaultZone = Zones.sanctuary.id
  }
}
