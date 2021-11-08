import { Action } from 'engine/types'

/** Do nothing this turn */
class NoopAction implements Action {
  public execute () {
    // do nothing
  }
}

export const DoNothing = new NoopAction()
