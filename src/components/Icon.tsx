import type { ReactNode } from 'react'

const iconPaths: Record<string, ReactNode> = {
  home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  cart: <><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M3 4h2l2.4 11.2a2 2 0 002 1.6h7.8a2 2 0 001.9-1.4L21 7H6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 7-7 8-7s7 2 8 7"/></>,
  back: <path d="M15 18l-6-6 6-6"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  trash: <><path d="M3 6h18M8 6V3h8v3M6 6l1 15h10l1-15M10 10v7M14 10v7"/></>,
  truck: <><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
  bag: <><path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2"/></>,
  person: <><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.7-4.1 3.2-6 7-6s6.3 1.9 7 6"/></>,
  phone: <><path d="M7 3h10v18H7z"/><path d="M10 6h4M11 18h2"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1116 0z"/><circle cx="12" cy="10" r="2.5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></>,
}

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  )
}
