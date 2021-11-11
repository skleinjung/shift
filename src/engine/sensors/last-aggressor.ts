import { Attack } from 'engine/combat'
import { Creature, Sensor } from 'engine/creature'

export class LastAggressorSensor implements Sensor<Creature | undefined> {
  /** the last creature to attack this one, or undefined */
  private _lastAggressor: Creature | undefined

  constructor (
    private readonly _creature: Creature
  ) {
    this._creature.on('defend', this._onDefend.bind(this))
  }

  private _onDefend ({ attacker }: Attack) {
    if (attacker instanceof Creature) {
      this._lastAggressor = attacker
    }
  }

  public get value (): Creature | undefined {
    return this._lastAggressor
  }
}
