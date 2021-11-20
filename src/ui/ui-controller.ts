import { Speech, UiCallback, UiController, UiEventEmitter } from 'engine/api/ui-api'

export class ReactUiController extends UiEventEmitter implements UiController {
  public showSpeech (_speech: Speech[], callback?: UiCallback) {
    // noop
    callback?.()
  }
}
