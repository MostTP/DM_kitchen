import type { Screen } from '../types'

export const screenPaths: Record<Screen, string> = {
  home: '/',
  menu: '/menu',
  customize: '/customize',
  cart: '/cart',
  checkout: '/checkout',
  payment: '/payment',
  success: '/success',
  track: '/account',
  admin: '/admin',
  'admin-login': '/admin/login',
}

const screensByPath = Object.fromEntries(
  Object.entries(screenPaths).map(([screen, path]) => [path, screen as Screen]),
) as Record<string, Screen>

export function getScreenFromPath(pathname: string): Screen {
  return screensByPath[pathname.replace(/\/+$/, '') || '/'] ?? 'home'
}
