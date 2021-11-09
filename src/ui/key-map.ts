export interface KeyMap {
  Confirm: string
  Get: string
  MoveUp: string
  MoveDown: string
  MoveLeft: string
  MoveRight: string
}

const KeyMaps = {
  Sean: {
    Confirm: 'Enter',
    Get: 'g',
    MoveUp: 'e',
    MoveDown: 'd',
    MoveLeft: 's',
    MoveRight: 'f',
  },
  EveryoneElse: {
    Confirm: 'Enter',
    Get: 'g',
    MoveUp: 'w',
    MoveDown: 's',
    MoveLeft: 'a',
    MoveRight: 'd',
  },
}

export const getKeyMap = (): KeyMap => KeyMaps.Sean
