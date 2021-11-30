import { MenuName, Speech, UiApi, UiController } from 'engine/api/ui-api'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { speechState } from 'ui/state/speech'
import { uiState } from 'ui/state/ui'

export class RebindableUiController implements UiController {
  public bound = false
  private _bindings?: UiApi

  public get ready () {
    return this._bindings !== undefined
  }

  public bind (ui: UiApi) {
    this.bound = true
    this._bindings = ui
  }

  public unbind () {
    this._bindings = undefined
  }

  public async showMenu (menu: MenuName | undefined) {
    if (this._bindings === undefined) {
      throw new Error('The UI is not ready.')
    }

    await this._bindings.showMenu(menu)
  }

  public async showSpeech (speech: Speech[]) {
    if (this._bindings === undefined) {
      throw new Error('The UI is not ready.')
    }

    await this._bindings.showSpeech(speech)
  }
}

export interface UiControllerBindingProps {
  ui: RebindableUiController
}

export const UiControllerBinding = ({ children, ui }: PropsWithChildren<UiControllerBindingProps>) => {
  const setSpeech = useSetRecoilState(speechState)
  const setUi = useSetRecoilState(uiState)

  const showMenu = useCallback(async (menu: MenuName | undefined) => {
    setUi({ activeMenu: menu })
  }, [setUi])

  const showSpeech = useCallback(async (speech: Speech[]) => {
    return new Promise<void>((resolve) => {
      setSpeech({
        onComplete: resolve,
        speech,
      })
    })
  }, [setSpeech])

  useEffect(() => {
    ui.bind({
      showMenu,
      showSpeech,
    })

    return () => {
      ui.unbind()
    }
  }, [showMenu, showSpeech, ui])

  return <>{children}</>
}
