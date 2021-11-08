import { Action } from 'engine/types'
import { isBoolean, isObject } from 'lodash'
import { isString } from 'lodash/fp'

/** given one of the multiple options for an action result, determine if it means 'success' */
export const isOk = (result: ReturnType<Action['execute']>): boolean => {
  if (isBoolean(result)) {
    return result
  } else if (isObject(result)) {
    return result.ok
  } else {
    return true
  }
}

/** given one of the multiple options for an action result, determine what message to log, if any */
export const getResultMessage = (result: ReturnType<Action['execute']>): string | undefined => {
  if (isString(result)) {
    return result
  } else if (isObject(result)) {
    return result.message
  } else {
    return undefined
  }
}
