export interface ConsoleApi {
  /**
   * Executes the given command string.
   */
  executeCommand (commandString: string): void

  /**
   * Shows the specified console message to the user
   */
  showMessage (message: string): void
}
