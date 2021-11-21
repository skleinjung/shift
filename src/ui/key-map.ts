export interface KeyMap {
  CancelCommand: string
  Confirm: string
  EnterCommand: string
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
    CancelCommand: 'Escape',
    Confirm: 'Enter',
    EnterCommand: 'Enter',
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
    CancelCommand: 'Escape',
    Confirm: 'Enter',
    EnterCommand: 'Enter',
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
