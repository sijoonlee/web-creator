import type { LabelHTMLAttributes, ReactNode } from 'react'

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode
  text: ReactNode
}

export function Label({ children, className, text, ...props }: LabelProps) {
  return (
    <label className={['label', className].filter(Boolean).join(' ')} {...props}>
      <span className="label-text">{text}</span>
      {children}
    </label>
  )
}
