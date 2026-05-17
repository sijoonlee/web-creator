import type { InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, type = 'text', ...props }: InputProps) {
  return (
    <input
      className={['input', className].filter(Boolean).join(' ')}
      type={type}
      {...props}
    />
  )
}
