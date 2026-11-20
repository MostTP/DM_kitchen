import type { Screen } from '../types'
import { bottomNavButtonClass, bottomNavClass } from '../styles/classes'
import { Icon } from './Icon'

interface BottomNavProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  home?: boolean
}

export function BottomNav({ screen, onNavigate, home = false }: BottomNavProps) {
  const isTracking = screen === 'track'
  return (
    <nav className={home ? 'fixed bottom-0 left-1/2 z-20 grid h-[54px] w-full max-w-[430px] -translate-x-1/2 grid-cols-4 items-center border-t border-[#f0dfcf] bg-[#fff8f0] min-[700px]:hidden' : bottomNavClass} aria-label="Mobile navigation">
      <button className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${screen === 'home' ? 'font-bold text-[#ef5c0b]' : ''}`} onClick={() => onNavigate('home')}><Icon name="home" size={17}/><span>Home</span></button>
      <button className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${screen === 'menu' || screen === 'customize' ? 'font-bold text-[#ef5c0b]' : ''}`} onClick={() => onNavigate('menu')}><Icon name="menu" size={17}/><span>Menu</span></button>
      <button className={`${bottomNavButtonClass} relative ${home ? 'h-[50px] gap-0.5' : ''}`} onClick={() => onNavigate('cart')}><span className={`absolute grid h-[14px] min-w-[14px] place-items-center rounded-full bg-[#ed2923] px-[3px] text-[8px] text-white ${home ? 'right-[calc(50%-18px)] top-0' : 'right-[calc(50%-18px)] top-[2px]'}`}>2</span><Icon name="cart" size={17}/><span>Cart</span></button>
      <button className={`${bottomNavButtonClass} ${home ? 'h-[50px] gap-0.5' : ''} ${isTracking ? 'font-bold text-[#ef5c0b]' : ''}`} onClick={() => onNavigate('track')}><Icon name={isTracking ? 'truck' : 'user'} size={17}/><span>{isTracking ? 'Track' : 'Account'}</span></button>
    </nav>
  )
}
