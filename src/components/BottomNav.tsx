import type { Screen } from '../types'
import { bottomNavButtonClass, bottomNavClass } from '../styles/classes'
import { Icon } from './Icon'
import { ScreenLink } from './ScreenLink'

interface BottomNavProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  cartCount: number
  home?: boolean
}

export function BottomNav({ screen, onNavigate, cartCount, home = false }: BottomNavProps) {
  const isAccount = screen === 'track' || screen === 'admin'
  return (
    <nav className={home ? 'fixed bottom-0 left-0 z-20 grid h-[54px] w-full grid-cols-4 items-center border-t border-[#f0dfcf] bg-[#fff8f0] min-[700px]:hidden' : bottomNavClass} aria-label="Mobile navigation">
      <ScreenLink to="home" onNavigate={onNavigate} className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${screen === 'home' ? 'font-bold text-[#ef5c0b]' : ''}`}><Icon name="home" size={17}/><span>Home</span></ScreenLink>
      <ScreenLink to="menu" onNavigate={onNavigate} className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${screen === 'menu' || screen === 'customize' ? 'font-bold text-[#ef5c0b]' : ''}`}><Icon name="menu" size={17}/><span>Menu</span></ScreenLink>
      <ScreenLink to="cart" onNavigate={onNavigate} className={`${bottomNavButtonClass} relative ${home ? 'h-[50px] gap-0.5' : ''}`} aria-label={`Cart, ${cartCount} items`}><span className={`absolute grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#ed2923] px-[4px] text-[10px] font-semibold text-white ${home ? 'right-[calc(50%-20px)] top-0' : 'right-[calc(50%-20px)] top-[1px]'}`}>{cartCount}</span><Icon name="cart" size={20}/><span>Cart</span></ScreenLink>
      <ScreenLink to="track" onNavigate={onNavigate} className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${isAccount ? 'font-bold text-[#ef5c0b]' : ''}`}><Icon name="user" size={17}/><span>Account</span></ScreenLink>
    </nav>
  )
}
