import { ScriptApi } from 'engine/api/script-api'
import { Action } from 'engine/types'
import { TypedEventEmitter } from 'typed-event-emitter'

/** a command that should be invoked in response to player input */
export type InputCommand = (api: ScriptApi) => void | Promise<void>

export type InputEvents = {
  /** emitted when the player input indicates a command needs to be executed  */
  command: InputCommand
}

export class InputEventEmitter extends TypedEventEmitter<{
  [k in keyof InputEvents]: (event: InputEvents[k]) => void
}> {
  /** Helper function that emits a command causing the player to take the specified action. */
  public emitPlayerAction (action: Action) {
    this.emit('command', (api) => {
      api.player.nextAction = action
    })
  }
}

/** Types of input that a user can provide */
export type InputType = 'keypress' | 'menu-selection'

export interface KeypressInput {
  /** for keypress events, the key that was pressed */
  key: string

  /** name of the type of input provided */
  type: 'keypress'
}

export interface MenuSelectionInput {
  /**
   * value selected by the user
   *
   * TODO: probably a better type for this than number... but I have 3 hours left to finish :D
   */
  selection: number

  /** name of the type of input provided */
  type: 'menu-selection'
}

export type UserInput = {
  /** name of the type of input provided */
  type: InputType
} & (KeypressInput | MenuSelectionInput)

export interface UserInputMeta {
  /** input event emitter that can be used to execute actions or UI changes */
  inputEventEmitter: InputEventEmitter

  /** script API for interfacing with the game state */
  api: ScriptApi
}

export type InputPayload = UserInputMeta & {
  input: UserInput
}

export interface InputState {
  /** Called when this input state is entered. Should use the emitter to generate actions and/or commands. */
  enter? (emitter: InputEventEmitter): void

  /** Called when this input state is exited. Should use the emitter to generate actions and/or commands. */
  exit? (emitter: InputEventEmitter): void

  /**
   * Based on the current state and given input, returns a new InputState. If the user input is invalid for this
   * state or should not trigger a change, returns undefined.
   **/
  handleInput (input: InputPayload): InputState | undefined
}
