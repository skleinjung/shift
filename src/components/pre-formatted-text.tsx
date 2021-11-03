import { PropsWithChildren } from 'react'

export const PreFormattedText = ({ children }: PropsWithChildren<Record<string, unknown>>) => (
  <div style={{ whiteSpace: 'pre' }}>{children}</div>
)
