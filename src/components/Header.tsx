import type { Screen } from '../types'
import { desktopNavButtonClass, desktopNavClass, headerClass, iconButtonClass, screenTitleClass } from '../styles/classes'
import { BrandLogo } from './BrandLogo'
import { Icon } from './Icon'
import { ScreenLink } from './ScreenLink'

interface HeaderProps {
  title?: string
  back?: boolean
  backTarget?: Screen
  rightAction?: 'cart' | 'trash' | 'search' | 'none'
  cartCount?: number
  onNavigate: (screen: Screen) => void
}

export function Header({
  title,
  back = true,
  backTarget = 'home',
  rightAction = 'search',
  cartCount = 0,
  onNavigate,
}: HeaderProps) {
  return (
    <header className={headerClass}>
      <div className="mx-auto grid h-14 w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center px-4 min-[700px]:h-full min-[700px]:max-w-[1440px] min-[700px]:grid-cols-[minmax(0,1fr)_auto] min-[700px]:gap-8 min-[700px]:px-8">
        {back ? (
          <ScreenLink
            to={backTarget}
            onNavigate={onNavigate}
            className={iconButtonClass}
            aria-label="Go back"
          >
            <Icon name="back" size={18} />
          </ScreenLink>
        ) : title ? (
          <BrandLogo className="h-[30px] w-[42px] rounded-md bg-white p-1 object-contain min-[700px]:hidden" />
        ) : (
          <span className="min-[700px]:hidden" />
        )}
        {title && <h2 className={screenTitleClass}>{title}</h2>}
        {rightAction !== 'none' ? (
          <ScreenLink
            to="cart"
            onNavigate={onNavigate}
            className={`${iconButtonClass} relative justify-self-end ${rightAction === 'trash' ? 'text-[#ff321f]' : ''}`}
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
          </ScreenLink>
        ) : (
          <span className="min-[700px]:hidden" />
        )}
        <nav className={desktopNavClass} aria-label="Main navigation">
          <ScreenLink to="home" onNavigate={onNavigate} className={desktopNavButtonClass}>Home</ScreenLink>
          <ScreenLink to="menu" onNavigate={onNavigate} className={desktopNavButtonClass}>Our Menu</ScreenLink>
          <ScreenLink to="track" onNavigate={onNavigate} className={desktopNavButtonClass}>My Account</ScreenLink>
          <ScreenLink to="cart" onNavigate={onNavigate} className="flex items-center gap-2 rounded-[7px] border border-[#e8ddd4] px-[15px] py-2.5 text-[13px] font-semibold"><Icon name="cart" /> Cart</ScreenLink>
        </nav>
      </div>
    </header>
  )
}
