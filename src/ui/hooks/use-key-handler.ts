import { noop } from 'lodash/fp'
import React, { useCallback } from 'react'

/**
 * Creates a 'keydown' handler function that can be registered as a listener on a specific component
 * The handler will dispatch to one of a set of key handlers whenever a key is pressed. The handlers
 * are provided via the `handlerMap`. The map keys are the key values (i.e. `event.key`), and the
 * value is a no-arg function that will be called when that key is pressed.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export const useKeyHandler = (handlerMap: Record<string, () => void>) => {
  return useCallback((event: React.KeyboardEvent) => {
    const keyHandler = handlerMap[event.key] ?? noop
    keyHandler()
  }, [handlerMap])
}
