import { Creature, Sensor } from 'engine/creature'
import { CreatureEvents } from 'engine/events/creature-events'

export class LastAggressorSensor implements Sensor<Creature | undefined> {
  /** the last creature to attack this one, or undefined */
  private _lastAggressor: Creature | undefined

  constructor (
    private readonly _creature: Creature
  ) {
    this._creature.on('defend', this._onDefend.bind(this))
  }

  private _onDefend ({ attack }: CreatureEvents['defend']) {
    const attacker = attack.attacker
    if (attacker instanceof Creature) {
      this._lastAggressor = attacker
    }
  }

  public get value (): Creature | undefined {
    return this._lastAggressor
  }
}
