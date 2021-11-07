import { join } from 'lodash/fp'
import { HTMLAttributes, PropsWithChildren } from 'react'

import { FocusableDiv } from './focusable-div'
import './panel.css'

type InheritedProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>

const LINE_HEIGHT = 20

export type PanelProps = InheritedProps & PropsWithChildren<{
  /** indicates if this panel is active -- that is, highlighted and receives input */
  active?: boolean

  /**
   * Fixed width of the panel (in text columns), or undefined if it should expand horizontally
   * If you put too much text horizontally in a container, a couple pixels might be visible before the
   * padding starts so do not "overstuff" a panel.
   **/
  columns?: number | undefined

  /** additional CSS classes to apply to the container element */
  containerClass?: string

  /** additional CSS classes to apply to the content element */
  className?: string

  /** fixed height of the panel (in text rows), or undefined if it should expand vertically */
  rows?: number | undefined
}>

export const Panel = ({
  active,
  children,
  className,
  columns,
  containerClass,
  rows,
  ...divProps
}: PanelProps) => {
  const containerClasses = ['container']
  if (columns === undefined) {
    containerClasses.push('dynamic-width')
  }
  if (rows === undefined) {
    containerClasses.push('dynamic-height')
  }

  if (active) {
    containerClasses.push('active')
  }

  if (containerClass !== undefined) {
    containerClasses.push(containerClass)
  }

  const height = rows !== undefined ? rows * LINE_HEIGHT : undefined
  const width = columns !== undefined ? `${columns}ch` : undefined

  return (
    <>
      <FocusableDiv {...divProps}
        className={join(' ', containerClasses)}
        focused={active}
      >
        <div
          className={className === undefined ? 'content' : `content ${className}`}
          style={{
            height,
            maxHeight: height,
            maxWidth: width,
            minHeight: height,
            minWidth: width,
            width,
          }}>
          {children}
        </div>
      </FocusableDiv>
    </>
  )
}
