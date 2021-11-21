import './command-input-box.css'

import { noop } from 'lodash/fp'
import { HTMLAttributes, useCallback, useState } from 'react'
import { useKeyHandler } from 'ui/hooks/use-key-handler'
import { getKeyMap } from 'ui/key-map'

export interface CommandInputBoxProps extends HTMLAttributes<HTMLInputElement> {
  active?: boolean

  onCancel?: () => void
  onCommand: (command: string) => void
}

export const CommandInputBox = ({
  active = false,
  onCancel = noop,
  onCommand,
  ...rest
}: CommandInputBoxProps) => {
  const [input, setInput] = useState('')

  const refCallback = useCallback((input: HTMLInputElement) => {
    if (active) {
      input?.focus()
    }
  }, [active])

  // handle blur events by taking focus back... make sure only one component is using this!
  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    event.target.focus()
  }, [])

  const handleCancel = useCallback(() => {
    onCancel()
    setInput('')
  }, [onCancel])

  const keyMap = getKeyMap()
  const keyHandler = useKeyHandler({
    [keyMap.CancelCommand]: handleCancel,
  })

  return (
    <form
      className="command-input-box"
      onSubmit={() => {
        if (input.length === 0) {
          handleCancel()
        } else {
          onCommand(input)
        }

        setInput('')
      }}
    >
      <input {...rest}
        className={active ? 'active' : ''}
        onBlur={active ? handleBlur : undefined}
        onChange={(event) => {
          setInput(event.target.value)
        }}
        onKeyUp={keyHandler}
        ref={refCallback}
        type="text"
        value={input}
      />
    </form>
  )
}
