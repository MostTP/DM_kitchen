import type { Screen } from '../types'
import { desktopNavButtonClass, desktopNavClass, headerClass, iconButtonClass, screenTitleClass } from '../styles/classes'
import { Icon } from './Icon'

interface HeaderProps {
  title?: string
  back?: boolean
  rightAction?: 'cart' | 'trash' | 'search' | 'none'
  cartCount?: number
  onNavigate: (screen: Screen) => void
}

export function Header({
  title,
  back = true,
  rightAction = 'search',
  cartCount = 0,
  onNavigate,
}: HeaderProps) {
  return (
    <header className={headerClass}>
      <div className="flex h-[22px] items-center justify-between px-[14px] text-[9px] font-bold text-[#1d1b19] min-[700px]:hidden">
        <span>9:41</span>
        <span className="tracking-[1px]">▮▮▮ ▴ ▰</span>
      </div>
      <div className="grid h-[40px] grid-cols-[36px_1fr_36px] items-center px-[10px] min-[700px]:flex min-[700px]:h-full min-[700px]:px-0">
        {back ? (
          <button
            className={iconButtonClass}
            onClick={() => onNavigate('home')}
            aria-label="Go back"
          >
            <Icon name="back" size={18} />
          </button>
        ) : title ? (
          <div className="grid h-[30px] w-[30px] place-items-center rounded-full bg-dmk-orange font-serif font-black text-white min-[700px]:hidden">
            D<span className="-ml-1 mt-[5px] self-start text-[9px]">✦</span>
          </div>
        ) : (
          <span />
        )}
        {title && <h2 className={screenTitleClass}>{title}</h2>}
        {rightAction !== 'none' ? (
          <button
            className={`${iconButtonClass} relative justify-self-end ${rightAction === 'trash' ? 'text-[#ff321f]' : ''}`}
            onClick={() => rightAction === 'cart' && onNavigate('cart')}
            aria-label={
              rightAction === 'cart'
                ? 'Open cart'
                : rightAction === 'trash'
                  ? 'Clear cart'
                  : 'Search'
            }
          >
            <Icon name={rightAction} size={rightAction === 'trash' ? 16 : 18} />
            {rightAction === 'cart' && (
              <span className="absolute right-0 top-0 grid h-[14px] min-w-[14px] place-items-center rounded-full bg-[#f12d23] px-[3px] text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        ) : (
          <span />
        )}
        <nav className={desktopNavClass} aria-label="Main navigation">
          <button className={desktopNavButtonClass} onClick={() => onNavigate('home')}>Home</button>
          <button className={desktopNavButtonClass} onClick={() => onNavigate('menu')}>Our Menu</button>
          <button className={desktopNavButtonClass} onClick={() => onNavigate('track')}>Track Order</button>
          <button className="flex items-center gap-2 rounded-[7px] border border-[#e8ddd4] px-[15px] py-2.5 text-[13px] font-semibold" onClick={() => onNavigate('cart')}><Icon name="cart" /> Cart</button>
        </nav>
      </div>
    </header>
  )
}
