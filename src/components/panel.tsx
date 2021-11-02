import { join } from 'lodash/fp'
import { PropsWithChildren } from 'react'
import './panel.css'

export interface PanelProps {
  /** indicates if this panel is active -- that is, highlighted and receives input */
  active?: boolean

  /**
   * Fixed width of the panel (in text columns), or undefined if it should expand horizontally
   * If you put too much text horizontally in a container, a couple pixels might be visible before the
   * padding starts so do not "overstuff" a panel.
   **/
  columns?: number | undefined

  /** fixed height of the panel (in text rows), or undefined if it should expand vertically */
  rows?: number | undefined
}

export const Panel = ({
  active,
  children,
  columns,
  rows,
}: PropsWithChildren<PanelProps>) => {
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

  const height = rows !== undefined ? rows * 16 : undefined
  const width = columns !== undefined ? `${columns}ch` : undefined

  return (
    <>
      <div className={join(' ', containerClasses)}>
        <div className="content" style={{
          height,
          maxHeight: height,
          maxWidth: width,
          minHeight: height,
          minWidth: width,
          width,
        }}>
          {children}
        </div>
      </div>
    </>
  )
}
