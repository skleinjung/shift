import { MenuName } from 'engine/api/ui-api'
import { atom } from 'recoil'

export interface UiState {
  /** the current menu being displayed, if any */
  activeMenu: MenuName | undefined
}

export const newUi = (): UiState => ({
  activeMenu: undefined,
})

export const uiState = atom<UiState>({
  key: 'uiState',
  default: newUi(),
})
