import { PropsWithChildren } from 'react'

export interface PreFormattedTextOptions {
  /** optional CSS class names to apply to the text container */
  className?: string
}

export const PreFormattedText = ({ className = '', children }: PropsWithChildren<PreFormattedTextOptions>) => (
  <div className={className} style={{ whiteSpace: 'pre' }}>{children}</div>
)
