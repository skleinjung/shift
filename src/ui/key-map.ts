export interface KeyMap {
  Confirm: string
  Get: string
  MoveUp: string
  MoveDown: string
  MoveLeft: string
  MoveRight: string
  OpenInventory: string
  OpenObjectives: string
  Wait: string
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
    OpenObjectives: 'j',
    Wait: ' ',
  },
  EveryoneElse: {
    Confirm: 'Enter',
    Get: 'g',
    MoveUp: 'w',
    MoveDown: 's',
    MoveLeft: 'a',
    MoveRight: 'd',
    OpenInventory: 'i',
    OpenObjectives: 'j',
    Wait: ' ',
  },
}

export const getKeyMap = (): KeyMap => KeyMaps.Sean
