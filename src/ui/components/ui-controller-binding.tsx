import { Speech, UiApi, UiController, UiControllerEventEmitter } from 'engine/api/ui-api'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { speechState } from 'ui/state/speech'

export class RebindableUiController extends UiControllerEventEmitter implements UiController {
  public bound = false
  private _bindings?: UiApi

  public bind (ui: UiApi) {
    this.bound = true
    this._bindings = ui
  }

  public unbind () {
    this._bindings = undefined
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

  const showSpeech = useCallback(async (speech: Speech[]) => {
    return new Promise<void>((resolve) => {
      setSpeech({
        onComplete: resolve,
        speech,
      })
    })
  }, [setSpeech])

  useEffect(() => {
    const wasBound = ui.bound
    ui.bind({
      showSpeech,
    })

    if (!wasBound) {
      ui.emit('ready', { ui })
    }

    return () => {
      ui.unbind()
    }
  }, [showSpeech, ui])

  return <>{children}</>
}
