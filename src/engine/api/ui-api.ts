/** A single piece of content that should be displayed during a dialog 'cutscene'. */
export interface Speech {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker?: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

export type UiApi = Readonly<{
  /**
    * Show the supplied speech content to the user.
    */
  showSpeech (speech: Speech[]): Promise<void>
}>

export type UiController = UiApi & {
  /** determines if the UI is ready to begin emitting events */
  ready: boolean
}
