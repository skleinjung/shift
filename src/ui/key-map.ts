export interface KeyMap {
  CancelCommand: string
  Confirm: string
  EnterCommand: string
  Get: string
  Give: string
  MoveUp: string
  MoveDown: string
  MoveLeft: string
  MoveRight: string
  OpenInventory: string
  OpenObjectives: string
  Travel: string
  Wait: string
}

const KeyMaps = {
  Sean: {
    CancelCommand: 'Escape',
    Confirm: 'Enter',
    EnterCommand: 'Enter',
    Get: 'g',
    Give: 't',
    MoveUp: 'e',
    MoveDown: 'd',
    MoveLeft: 's',
    MoveRight: 'f',
    OpenInventory: 'b',
    OpenObjectives: 'j',
    Travel: '>',
    Wait: ' ',
  },
  EveryoneElse: {
    CancelCommand: 'Escape',
    Confirm: 'Enter',
    EnterCommand: 'Enter',
    Get: 'g',
    Give: 't',
    MoveUp: 'w',
    MoveDown: 's',
    MoveLeft: 'a',
    MoveRight: 'd',
    OpenInventory: 'i',
    OpenObjectives: 'j',
    Travel: '>',
    Wait: ' ',
  },
}

export const getKeyMap = (): KeyMap => KeyMaps.Sean
