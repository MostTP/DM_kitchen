import { menuItems } from '../../data/menu'
import type { RiceType, Screen } from '../../types'
import { Header } from '../Header'
import { ScreenLink } from '../ScreenLink'
import { pageContentClass, screenClass } from '../../styles/classes'

interface MenuPageProps {
  onNavigate: (screen: Screen) => void
  onSelectRice: (rice: RiceType) => void
  cartCount: number
}

export function MenuPage({ onNavigate, onSelectRice, cartCount }: MenuPageProps) {
  return (
    <div className={`${screenClass} pb-0`}>
      <Header title="Our Menu" rightAction="cart" cartCount={cartCount} onNavigate={onNavigate} />
      <div className={`${pageContentClass} px-4 pb-4 pt-4 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6`}>
        <div className="mb-4">
          <h2 className="text-xl font-bold">Rice Packages</h2>
          <p className="mt-1 text-sm text-[#77706a]">Choose a meal to customise.</p>
        </div>
        <section aria-label="Rice packages" className="space-y-3">
          {menuItems.map((item) => (
            <article
              className="relative overflow-hidden rounded-xl border border-[#eee5dd] bg-white p-2 shadow-[0_2px_8px_rgba(74,49,32,0.06)] min-[700px]:flex min-[700px]:h-36 min-[700px]:items-center min-[700px]:gap-4"
              key={item.id}
            >
              <img className="h-36 w-full rounded-lg object-cover min-[700px]:h-32 min-[700px]:w-44" src={item.image} alt={item.name} />
              <div className="px-1 pb-1 pt-3 pr-12 min-[700px]:p-0">
                <h3 className="mb-1 text-base font-bold min-[700px]:text-lg">{item.name}</h3>
                <p className="mb-1 text-sm leading-snug text-[#77706a] min-[700px]:text-xs">{item.description}</p>
                {/* <strong className="text-sm">From ₦{item.price.toLocaleString()}</strong> */}
              </div>
              <ScreenLink
                to="customize"
                onNavigate={onNavigate}
                onBeforeNavigate={() => onSelectRice(item.name)}
                className="absolute bottom-4 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#ff711a] text-2xl font-medium leading-none text-white"
                aria-label={`Customize ${item.name}`}
              >
                +
              </ScreenLink>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
