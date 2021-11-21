import { Creature } from 'engine/creature'
import { TypedEventEmitter } from 'typed-event-emitter'

import { CreatureEventEmitter } from './creature'

type ManagedCreature = Omit<Creature, keyof CreatureEventEmitter>

export type EventManagerEvents = {
  /** Emitted when a new creature is registered with the event manager. */
  registerCreature: { creature: ManagedCreature; eventEmitter: CreatureEventEmitter }

  /** Emitted when a creature is removed from the event manager. */
  unregisterCreature: { creatureId: number; eventEmitter: CreatureEventEmitter }
}

type EventManagerEventTypes = { [k in keyof EventManagerEvents]: (event: EventManagerEvents[k]) => void }

export class EventManager extends TypedEventEmitter<EventManagerEventTypes> {
  private _creatureEventEmitters: Record<number, CreatureEventEmitter> = {}

  public creature (id: number): CreatureEventEmitter | undefined {
    return this._creatureEventEmitters[id]
  }

  /** Registers a CreatureEventEmitter for the given creature */
  public registerCreature (creature: Creature, eventEmitter: CreatureEventEmitter) {
    this._creatureEventEmitters[creature.id] = eventEmitter
    this.emit('registerCreature', { creature, eventEmitter: this._creatureEventEmitters[creature.id] })
  }

  /** Removes a creature from the event manager */
  public unregisterCreature (id: number) {
    if (this._creatureEventEmitters[id] !== undefined) {
      this.emit('unregisterCreature', { creatureId: id, eventEmitter: this._creatureEventEmitters[id] })
      delete this._creatureEventEmitters[id]
    }
  }
}
