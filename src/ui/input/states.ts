import { AttackAction } from 'engine/actions/attack'
import { DoNothing } from 'engine/actions/do-nothing'
import { GiveAction } from 'engine/actions/give'
import { MoveByAction } from 'engine/actions/move-by'
import { ScriptApi } from 'engine/api/script-api'
import { Item } from 'engine/item'
import { getPortalDestination } from 'game-content/portal'
import { find } from 'lodash/fp'
import { getKeyMap } from 'ui/key-map'

import { InputEventEmitter, InputPayload, InputState, KeypressInput, MenuSelectionInput } from './types'

export class BaseInputState implements InputState {
  public handleInput ({ api, inputEventEmitter, input }: InputPayload): InputState | undefined {
    switch (input.type) {
      case 'keypress':
        return this.handleKeypress(input, inputEventEmitter, api)
      case 'menu-selection':
        return this.handleMenuSelection(input, inputEventEmitter, api)
      default:
        return undefined
    }
  }

  /** handler for input events of type 'keypress' */
  protected handleKeypress (
    _input: KeypressInput,
    _inputEventEmitter: InputEventEmitter,
    _api: ScriptApi
  ): InputState | undefined {
    return undefined
  }

  /** handler for input events of type 'menu-selection' */
  protected handleMenuSelection (
    _input: MenuSelectionInput,
    _inputEventEmitter: InputEventEmitter,
    _api: ScriptApi
  ): InputState | undefined {
    return undefined
  }
}

export class DefaultState extends BaseInputState {
  protected handleKeypress ({ key }: KeypressInput, inputEventEmitter: InputEventEmitter, api: ScriptApi) {
    const emitMoveAction = (x: number, y: number) => {
      // stop auto-pathfinding, if we were in the middle of it
      api.player.destination = undefined

      const creature = api.getMapTile(api.player.x + x, api.player.y + y)?.creature
      if (creature === undefined) {
        inputEventEmitter.emitPlayerAction(new MoveByAction(api.player, x, y))
      } else {
        inputEventEmitter.emitPlayerAction(new AttackAction(api.player, creature))
      }
    }

    const keyMap = getKeyMap()
    switch (key) {
      case keyMap.Give:
        if (api.player.inventory.items.length < 1) {
          api.showMessage('> Trade: You have nothing to trade.')
        } else {
          return new GiveItemSelectionState()
        }
        break
      case keyMap.MoveDown:
        emitMoveAction(0, 1)
        break
      case keyMap.MoveLeft:
        emitMoveAction(-1, 0)
        break
      case keyMap.MoveRight:
        emitMoveAction(1, 0)
        break
      case keyMap.MoveUp:
        emitMoveAction(0, -1)
        break
      case keyMap.Travel:
        inputEventEmitter.emit('command', (api) => {
          const destination = getPortalDestination(api, api.player.x, api.player.y)
          if (destination === undefined) {
            api.showMessage('> Travel: There is no portal here.')
          } else {
            api.showMessage(`> Travel: ${destination}`)
            api.loadZone(destination)
          }
        })
        break
      case keyMap.Wait:
        inputEventEmitter.emitPlayerAction(DoNothing)
        break
    }

    return undefined
  }
}

export class GiveItemSelectionState extends BaseInputState {
  public enter (emitter: InputEventEmitter): void {
    emitter.emit('command', (api) => {
      api.showMessage('> Trade: Which item?')
      api.showMenu('inventory-item')
    })
  }

  public exit (emitter: InputEventEmitter): void {
    emitter.emit('command', (api) => {
      api.showMenu(undefined)
    })
  }

  protected handleKeypress ({ key }: KeypressInput, _: InputEventEmitter, api: ScriptApi) {
    const keyMap = getKeyMap()
    switch (key) {
      case keyMap.CancelCommand:
        api.showMessage('> Trade: Cancelled.')
        return new DefaultState()
    }

    return undefined
  }

  protected handleMenuSelection (
    { selection }: MenuSelectionInput,
    _: InputEventEmitter,
    api: ScriptApi
  ): InputState | undefined {
    const item = find((item) => item.id === selection, api.player.inventory.items)
    if (item !== undefined) {
      return new GiveDirectionSelectionState(item)
    } else {
      api.showMessage('> Trade: No such item.')
    }

    return new DefaultState()
  }
}

export class GiveDirectionSelectionState extends BaseInputState {
  constructor (
    private _item: Item
  ) {
    super()
  }

  public enter (emitter: InputEventEmitter): void {
    emitter.emit('command', (api) => {
      api.showMessage(`> Trade: Give ${this._item.name} to whom?`)
    })
  }

  protected handleKeypress ({ key }: KeypressInput, inputEventEmitter: InputEventEmitter, api: ScriptApi) {
    const emitGiveAction = (x: number, y: number) => {
      const player = api.player
      const recipient = api.getMapTile(player.x + x, player.y + y)?.creature

      if (recipient === undefined) {
        api.showMessage('> Trade: There is nobody there.')
      } else {
        inputEventEmitter.emitPlayerAction(new GiveAction(api.player, this._item, recipient))
      }

      return new DefaultState()
    }

    const keyMap = getKeyMap()
    switch (key) {
      case keyMap.CancelCommand:
        api.showMessage('> Trade: Cancelled.')
        return new DefaultState()
      case keyMap.MoveDown:
        return emitGiveAction(0, 1)
      case keyMap.MoveLeft:
        return emitGiveAction(-1, 0)
      case keyMap.MoveRight:
        return emitGiveAction(1, 0)
      case keyMap.MoveUp:
        return emitGiveAction(0, -1)
    }

    return undefined
  }
}
