/** converts the event name (for use in calls to 'on'), into a handler function name in scripts */
export type EventHandlerName<T extends string> = `on${Capitalize<T>}`

export const Empty = {} as const
export type EmptyEvent = typeof Empty
