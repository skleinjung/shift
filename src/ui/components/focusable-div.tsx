import { HTMLAttributes, useCallback } from 'react'

type InheritedProps = Omit<HTMLAttributes<HTMLDivElement>, 'onBlur' | 'tabIndex'>

export interface FocusableDivProps extends InheritedProps {
  /** true if this element should have focus */
  focused?: boolean
}

export const FocusableDiv = ({
  children,
  focused,
  ...divProps
}: FocusableDivProps) => {
  // update the focus when a new UL element is created
  const refCallback = useCallback((div: HTMLDivElement) => {
    if (focused) {
      div?.focus()
    }
  }, [focused])

  // handle blur events by taking focus back... make sure only one component is using this!
  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    event.target.focus()
  }, [])

  return (
    <div {...divProps}
      onBlur={focused ? handleBlur : undefined}
      ref={refCallback}
      tabIndex={focused ? 0 : undefined}
    >
      {children}
    </div>
  )
}
