import { menuItems } from '../../data/menu'
import type { RiceType, Screen } from '../../types'
import { Header } from '../Header'
import { screenClass } from '../../styles/classes'

interface MenuPageProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  onSelectRice: (rice: RiceType) => void
}

export function MenuPage({ onNavigate, onSelectRice }: MenuPageProps) {
  const chooseRice = (name: string) => {
    onSelectRice(name as RiceType)
    onNavigate('customize')
  }

  return (
    <div className={`${screenClass} pb-0`}>
      <Header title="Our Menu" rightAction="cart" onNavigate={onNavigate} />
      <div className="flex-1 overflow-y-auto px-[10px] pb-3 pt-1 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6">
        <div className="mb-[7px] flex h-[30px] items-center gap-[5px]">
          {['Rice Packages', 'Extras', 'Drinks'].map((tab, index) => (
            <button
              key={tab}
              className={`h-[27px] rounded-full px-[12px] text-[9px] ${index === 0 ? 'bg-[#ff701a] font-bold text-white' : 'bg-[#f3eee9] text-[#70665f]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <section>
          {menuItems.map((item) => (
            <article
              className="relative mb-[8px] overflow-hidden rounded-[12px] border border-[#eee5dd] bg-white p-[7px] shadow-[0_2px_8px_rgba(74,49,32,0.06)] min-[700px]:flex min-[700px]:h-32 min-[700px]:items-center min-[700px]:gap-[10px] min-[700px]:rounded-xl"
              key={item.id}
              onClick={() => chooseRice(item.name)}
            >
              <img className="h-[126px] w-full rounded-[9px] object-cover min-[700px]:h-28 min-[700px]:w-36" src={item.image} alt={item.name} />
              <div className="px-[3px] pb-[1px] pt-[5px] pr-[35px] min-[700px]:p-0">
                <h3 className="mb-[2px] text-[10px] font-bold min-[700px]:text-lg">{item.name}</h3>
                <p className="mb-[3px] text-[8px] leading-[1.25] text-[#77706a] min-[700px]:text-xs">{item.description}</p>
                <strong className="text-[9px] min-[700px]:text-sm">From ₦{item.price.toLocaleString()}</strong>
              </div>
              <button
                className="absolute bottom-[12px] right-[10px] grid h-[23px] w-[23px] place-items-center rounded-full bg-[#ff711a] text-[17px] font-medium leading-none text-white"
                aria-label={`Add ${item.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  chooseRice(item.name)
                }}
              >
                +
              </button>
            </article>
          ))}
        </section>
        <section className="pt-1">
          <h2 className="mb-1 text-[11px] font-bold">Extra Items</h2>
          <p className="mb-[5px] text-[8px] text-[#77706a]">Add more protein to your order</p>
          {[
            ['🍗', 'Extra Beef', '₦800'],
            ['🍗', 'Extra Chicken', '₦1,300'],
          ].map(([emoji, name, price]) => (
            <div key={name} className="mb-[5px] grid h-[40px] grid-cols-[25px_1fr_auto] items-center rounded-[8px] border border-[#eee5dd] bg-white px-[7px]">
              <span className="text-[16px]">{emoji}</span>
              <span className="text-[8px] font-medium">{name}<small className="block text-[7px] text-[#7d736c]">{price}</small></span>
              <div className="flex h-[24px] items-center gap-2 rounded-full border border-[#e7e1dc] px-1.5 text-[8px]">
                <button aria-label={`Remove ${name}`}>−</button><span>0</span><button aria-label={`Add ${name}`}>+</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
