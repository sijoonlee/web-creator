import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type BaseButtonProps = {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
}

type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never
  }

type LinkButtonProps = BaseButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export type ButtonProps = NativeButtonProps | LinkButtonProps

function getButtonClassName(variant: ButtonVariant, className?: string) {
  return ['button', `button-${variant}`, className].filter(Boolean).join(' ')
}

export function Button(props: ButtonProps) {
  const { children, className, variant = 'primary' } = props
  const buttonClassName = getButtonClassName(variant, className)

  if ('href' in props) {
    const linkProps = props as LinkButtonProps
    const {
      children: linkChildren,
      className: _linkClassName,
      variant: _linkVariant,
      ...anchorProps
    } = linkProps

    return (
      <a className={buttonClassName} {...anchorProps}>
        {linkChildren}
      </a>
    )
  }

  const nativeProps = props as NativeButtonProps
  const {
    children: buttonChildren,
    className: _buttonClassName,
    variant: _buttonVariant,
    type = 'button',
    ...buttonProps
  } = nativeProps

  return (
    <button className={buttonClassName} type={type} {...buttonProps}>
      {buttonChildren}
    </button>
  )
}
