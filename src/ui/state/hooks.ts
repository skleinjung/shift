import { useCallback } from 'react'
import { RecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

export type Dispatch<T> = (action: (state: T) => T) => void

export const useDispatch = <T>(state: RecoilState<T>) => {
  const setter = useSetRecoilState(state)
  return useCallback((action: (state: T) => T) => setter(action), [setter])
}

export const useModel = <T>(state: RecoilState<T>): T & { dispatch: Dispatch<T> } => {
  const stateValue = useRecoilValue(state)
  const dispatch = useDispatch(state)

  return {
    ...stateValue,
    dispatch,
  }
}
