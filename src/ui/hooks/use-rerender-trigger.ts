import { useCallback, useState } from 'react'

/**
 * Returns a function that will rerender the component, and a numeric value that is unique per
 * rerender.
 **/
export const useRerenderTrigger = (): [() => void, number] => {
  const [counter, setCounter] = useState(0)
  const trigger = useCallback(() => {
    setCounter((counter) => counter + 1)
  }, [])

  return [trigger, counter]
}
