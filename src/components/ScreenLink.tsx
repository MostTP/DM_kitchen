import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import type { Screen } from '../types'
import { screenPaths } from '../lib/routes'

interface ScreenLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> {
  to: Screen
  onNavigate: (screen: Screen) => void
  children: ReactNode
  onBeforeNavigate?: () => void
}

export function ScreenLink({
  to,
  onNavigate,
  onBeforeNavigate,
  children,
  ...props
}: ScreenLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return
    event.preventDefault()
    onBeforeNavigate?.()
    onNavigate(to)
  }

  return (
    <a {...props} href={screenPaths[to]} onClick={handleClick}>
      {children}
    </a>
  )
}
