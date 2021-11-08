import { HTMLAttributes, ReactNode } from 'react'
import { toClassName, WithExtraClasses } from 'ui/to-class-name'

import './modal.css'

type InheritedProps = Omit<HTMLAttributes<HTMLElement>, 'className'>

export type ModalProps = InheritedProps & WithExtraClasses & {
  /** modal content */
  children: ReactNode
}

export const Modal = ({ children, classes, ...rest }: ModalProps) => {
  return (
    <div {...rest} className={toClassName(classes, 'modal')}>{children}</div>
  )
}
