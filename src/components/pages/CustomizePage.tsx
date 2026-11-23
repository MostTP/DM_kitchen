import { drinkItems, extraItems, foodImages } from '../../data/menu'
import type { DrinkId, ExtraId, PlateSize, Protein, RiceType, Screen } from '../../types'
import { pageContentClass, primaryActionClass, screenClass } from '../../styles/classes'
import { Header } from '../Header'
import { ScreenLink } from '../ScreenLink'
import { QuantityControl } from '../QuantityControl'

interface CustomizePageProps {
  rice: RiceType
  plate: PlateSize
  proteinQuantities: Record<Protein, number>
  extraQuantities: Record<ExtraId, number>
  drinkQuantities: Record<DrinkId, number>
  onNavigate: (screen: Screen) => void
  onPlateChange: (plate: PlateSize) => void
  onProteinQuantityChange: (protein: Protein, quantity: number) => void
  onExtraQuantityChange: (id: ExtraId, quantity: number) => void
  onDrinkQuantityChange: (id: DrinkId, quantity: number) => void
  cartCount: number
}

export function CustomizePage(props: CustomizePageProps) {
  const { rice, plate, proteinQuantities } = props
  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Customise Order" rightAction="cart" cartCount={props.cartCount} onNavigate={props.onNavigate} />
      <div className={`${pageContentClass} px-4 pb-3 pt-3 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6`}>
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#eee5dd] bg-white p-3">
          <img
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
            src={rice === 'Jollof Rice' ? foodImages.jollof : foodImages.mixed}
            alt=""
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[#77706a]">Your meal</p>
            <h2 className="text-base font-bold">{rice}</h2>
          </div>
          <ScreenLink to="menu" onNavigate={props.onNavigate} className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-[#e9550b]">
            Change
          </ScreenLink>
        </div>
        <section className="mb-4">
          <h3 className="mb-2 text-base font-bold">Select Plate Size</h3>
          <div className="grid grid-cols-2 gap-3">
            {([['Medium', '₦2,300', '20: ₦46,000 · 30: ₦69,000 · 50: ₦115,000'], ['Big', '₦3,200', '20: ₦64,000 · 30: ₦95,000 · 50: ₦160,000']] as const).map(([size, price, bulkPrices]) => (
              <button
                type="button"
                key={size}
                className={`relative flex min-h-[142px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border bg-white p-3 text-center shadow-[0_2px_8px_rgba(74,49,32,0.06)] min-[700px]:h-[205px] ${plate === size ? 'border-[#ff6b1a]' : 'border-[#eee5dd]'}`}
                onClick={() => props.onPlateChange(size)}
              >
                {plate === size && <span className="absolute right-2 top-2 text-sm font-bold text-[#ff711e]" aria-label="Selected">✓</span>}
                <span className="text-center">
                  <strong className="block text-sm">{size} Plate</strong>
                  <b className="mt-1 block text-sm font-semibold text-[#6f6259]">{price} / plate</b>
                  <small className="mt-1 block max-w-[220px] text-[10px] leading-4 text-[#87796f]">{bulkPrices}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="mb-4">
          <h3 className="mb-2 text-base font-bold">Choose Proteins</h3>
          <div className="space-y-2">
            {(['Chicken', 'Beef'] as const).map((name) => (
              <div key={name} className="flex min-h-[60px] items-center gap-3 rounded-xl border border-[#eee5dd] bg-white px-3 py-2">
                <span aria-hidden="true" className="text-2xl">{name === 'Chicken' ? '🍗' : '🥩'}</span>
                <strong className="flex-1 text-sm">{name}</strong>
                <QuantityControl
                  label={`${name} plate`}
                  quantity={proteinQuantities[name]}
                  onChange={(quantity) => props.onProteinQuantityChange(name, quantity)}
                />
              </div>
            ))}
          </div>
        </section>
        <section className="mb-4">
          <h3 className="mb-2 text-base font-bold">Extras</h3>
          <div className="space-y-2">
            {extraItems.map((item) => (
              <div key={item.id} className="flex min-h-[60px] items-center gap-3 rounded-xl border border-[#eee5dd] bg-white px-3 py-2">
                <span aria-hidden="true" className="text-2xl">{item.emoji}</span>
                <span className="flex-1 text-sm font-semibold">{item.name}<small className="mt-0.5 block text-xs font-normal text-[#7d736c]">₦{item.price.toLocaleString()}</small></span>
                <QuantityControl label={item.name} quantity={props.extraQuantities[item.id]} onChange={(quantity) => props.onExtraQuantityChange(item.id, quantity)} />
              </div>
            ))}
          </div>
        </section>
        <section className="mb-2">
          <h3 className="mb-2 text-base font-bold">Drinks</h3>
          <div className="space-y-2">
            {drinkItems.map((item) => (
              <div key={item.id} className="flex min-h-[60px] items-center gap-3 rounded-xl border border-[#eee5dd] bg-white px-3 py-2">
                <span aria-hidden="true" className="text-2xl">{item.emoji}</span>
                <span className="flex-1 text-sm font-semibold">{item.name}<small className="mt-0.5 block text-xs font-normal text-[#7d736c]">₦{item.price.toLocaleString()}</small></span>
                <QuantityControl label={item.name} quantity={props.drinkQuantities[item.id]} onChange={(quantity) => props.onDrinkQuantityChange(item.id, quantity)} />
              </div>
            ))}
          </div>
        </section>
      </div>
      <ScreenLink to="cart" onNavigate={props.onNavigate} className={`${primaryActionClass} shadow-[0_3px_8px_rgba(217,93,42,0.2)]`}>
        Add to Cart <b className="ml-2">→</b>
      </ScreenLink>
    </div>
  )
}
