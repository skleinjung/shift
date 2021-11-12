import { join } from 'lodash/fp'
import { HTMLAttributes, PropsWithChildren } from 'react'
import { toClassName, WithExtraClasses } from 'ui/to-class-name'

import { FocusableDiv } from './focusable-div'
import './panel.css'

type InheritedProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'>

const LINE_HEIGHT = 20

export type PanelProps = InheritedProps & WithExtraClasses & PropsWithChildren<{
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

  /** fixed height of the panel (in text rows), or undefined if it should expand vertically */
  rows?: number | undefined

  /** Optional title to display in a fixed position above the panel content list. */
  title?: string
}>

export const Panel = ({
  active,
  children,
  classes = [],
  columns,
  containerClass,
  rows,
  title,
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
          className={toClassName(classes, 'content')}
          style={{
            height,
            maxHeight: height,
            maxWidth: width,
            minHeight: height,
            minWidth: width,
            width,
          }}>
          {title && <h2 className="panel-title">{title}</h2>}
          {children}
        </div>
      </FocusableDiv>
    </>
  )
}
