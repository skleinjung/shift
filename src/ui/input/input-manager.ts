import { ScriptApi } from 'engine/api/script-api'

import { InputEventEmitter, InputState, UserInput } from './types'

export class InputManager extends InputEventEmitter {
  private _state: InputState

  constructor (defaultState: InputState) {
    super()
    this._state = defaultState
  }

  /** process a user keypress */
  public onKeyPress (api: ScriptApi, key: string) {
    this._handleInput(api, {
      key,
      type: 'keypress',
    })
  }

  /** process a user's menu selection */
  public onMenuSelection (api: ScriptApi, selection: number) {
    ('onmenujsel')
    this._handleInput(api, {
      selection,
      type: 'menu-selection',
    })
  }

  private _handleInput (api: ScriptApi, input: UserInput) {
    const nextState = this._state.handleInput({
      api,
      input,
      inputEventEmitter: this,
    })

    if (nextState !== undefined) {
      this._state.exit?.(this)
      this._state = nextState
      this._state.enter?.(this)
    }
  }
}
