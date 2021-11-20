/** A single piece of content that should be displayed during a dialog 'cutscene'. */
export interface Speech {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

export type UiApi = Readonly<{
  /**
   * Shows the specified message to the user, in the expedition log panel
   */
  showMessage (message: string): void

  /**
    * Show the supplied speech content to the user.
    * TODO: determine when it's done, so scripts can do more...
    */
  showSpeech (speech: Speech[]): void
}>
