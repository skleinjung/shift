import { noop } from 'lodash/fp'
import { useCallback, useEffect } from 'react'

/**
 * Registers a 'keydown' handler on the window, and unregisters it when the component is unmounted.
 * Te handlerMap parameter is the same structure as the one used by the `useKeyHandler` hook.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 */
export const useGlobalKeyHandler = (handlerMap: Record<string, () => void>) => {
  const handler = useCallback((event: KeyboardEvent) => {
    const keyHandler = handlerMap[event.key] ?? noop
    keyHandler()
  }, [handlerMap])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handler])
}
