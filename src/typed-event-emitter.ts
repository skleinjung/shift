import EventEmitter from 'events'

import TypedEmitter from 'typed-emitter'

type Arguments<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void] ? [] : [T]

type TypedEventEmitterImpl<TEvents> = TypedEmitter<TEvents> & EventEmitter

export class TypedEventEmitter<Events = any> implements TypedEmitter<Events> {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  private _eventEmitter: TypedEventEmitterImpl<Events>

  constructor () {
    this._eventEmitter = new EventEmitter({ captureRejections: true }) as unknown as TypedEventEmitterImpl<Events>
  }

  public addListener<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.addListener(event, listener)
    return this
  }

  public on<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.on(event, listener)
    return this
  }

  public once<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.once(event, listener)
    return this
  }

  public prependListener<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.prependListener(event, listener)
    return this
  }

  public prependOnceListener<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.prependOnceListener(event, listener)
    return this
  }

  public off<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.off(event, listener)
    return this
  }

  public removeAllListeners<E extends keyof Events> (event?: E): this {
    this._eventEmitter.removeAllListeners(event)
    return this
  }

  public removeListener<E extends keyof Events> (event: E, listener: Events[E]): this {
    this._eventEmitter.removeListener(event, listener)
    return this
  }

  public emit<E extends keyof Events> (event: E, ...args: Arguments<Events[E]>): boolean {
    return this._eventEmitter.emit(event, ...args)
  }

  public eventNames (): (keyof Events)[] {
    return this._eventEmitter.eventNames() as (keyof Events)[]
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public rawListeners<E extends keyof Events> (event: E): Function[] {
    return this._eventEmitter.rawListeners(event)
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public listeners<E extends keyof Events> (event: E): Function[] {
    return this._eventEmitter.listeners(event)
  }

  public listenerCount<E extends keyof Events> (event: E): number {
    return this._eventEmitter.listenerCount(event)
  }

  public getMaxListeners (): number {
    return this._eventEmitter.getMaxListeners()
  }

  public setMaxListeners (maxListeners: number): this {
    this._eventEmitter.setMaxListeners(maxListeners)
    return this
  }
}
