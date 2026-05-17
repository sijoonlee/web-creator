import type { HTMLAttributes, ReactNode } from 'react'

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode
  level?: HeadingLevel
}

export function Heading({
  children,
  className,
  level = 2,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as const

  return (
    <Component
      className={['heading', `heading-${level}`, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  )
}
