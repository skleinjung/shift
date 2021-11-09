export interface KeyMap {
  Confirm: string
  Get: string
  MoveUp: string
  MoveDown: string
  MoveLeft: string
  MoveRight: string
  OpenInventory: string
}

const KeyMaps = {
  Sean: {
    Confirm: 'Enter',
    Get: 'g',
    MoveUp: 'e',
    MoveDown: 'd',
    MoveLeft: 's',
    MoveRight: 'f',
    OpenInventory: 'b',
  },
  EveryoneElse: {
    Confirm: 'Enter',
    Get: 'g',
    MoveUp: 'w',
    MoveDown: 's',
    MoveLeft: 'a',
    MoveRight: 'd',
    OpenInventory: 'i',
  },
}

export const getKeyMap = (): KeyMap => KeyMaps.Sean
