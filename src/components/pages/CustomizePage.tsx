import { foodImages } from '../../data/menu'
import type { PlateSize, Protein, RiceType, Screen } from '../../types'
import { pageContentClass, primaryActionClass, quantityControlClass, screenClass } from '../../styles/classes'
import { Header } from '../Header'

interface CustomizePageProps {
  rice: RiceType
  plate: PlateSize
  protein: Protein
  quantity: number
  onNavigate: (screen: Screen) => void
  onRiceChange: (rice: RiceType) => void
  onPlateChange: (plate: PlateSize) => void
  onProteinChange: (protein: Protein) => void
  onQuantityChange: (quantity: number) => void
}

const choiceClass =
  'relative rounded-[9px] border bg-white p-[5px] text-center shadow-[0_2px_8px_rgba(74,49,32,0.06)]'

function ChoiceMark() {
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-[#ff711e] text-[10px] font-bold text-white">
      ✓
    </span>
  )
}

export function CustomizePage(props: CustomizePageProps) {
  const { rice, plate, protein, quantity } = props
  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Customise Order" rightAction="cart" onNavigate={props.onNavigate} />
      <div className={`${pageContentClass} px-[10px] pb-2 pt-1 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6`}>
        <img
          className="mb-[10px] h-[132px] w-full rounded-[12px] object-cover object-center shadow-[0_2px_8px_rgba(74,49,32,0.08)] min-[700px]:mb-4 min-[700px]:h-[220px]"
          src={rice === 'Jollof Rice' ? foodImages.jollof : foodImages.mixed}
          alt={`${rice} with grilled chicken`}
        />
        <section className="mb-[7px]">
          <h3 className="mb-[5px] text-[11px] font-bold">
            <b className="mr-1 text-[#24201d]">1.</b>Choose Rice Type
          </h3>
          <div className="grid grid-cols-2 gap-[7px]">
            {([['Jollof Rice', foodImages.jollof], ['Mixed Rice', foodImages.mixed]] as const).map(([name, image]) => (
              <button
                key={name}
                className={`${choiceClass} flex min-w-0 flex-col items-center justify-center gap-[5px] py-2 min-[700px]:h-[180px] ${rice === name ? 'border-[#ff6b1a]' : 'border-[#eee5dd]'}`}
                onClick={() => props.onRiceChange(name)}
              >
                {rice === name && <ChoiceMark />}
                <img className="h-[clamp(48px,18vw,76px)] w-[clamp(48px,18vw,76px)] rounded-full object-cover" src={image} alt="" />
                <strong className="text-[clamp(8px,2.4vw,10px)]">{name}</strong>
              </button>
            ))}
          </div>
        </section>
        <section className="mb-[7px]">
          <h3 className="mb-[5px] text-[11px] font-bold">
            <b className="mr-1 text-[#24201d]">2.</b>Select Plate Size
          </h3>
          <div className="grid grid-cols-2 gap-[7px]">
            {([['Medium', '₦2,500', foodImages.jollof], ['Big', '₦3,500', foodImages.mixed]] as const).map(([size, price, image]) => (
              <button
                key={size}
                className={`${choiceClass} flex min-w-0 flex-col items-center justify-center gap-[5px] py-2 min-[700px]:h-[205px] ${plate === size ? 'border-[#ff6b1a]' : 'border-[#eee5dd]'}`}
                onClick={() => props.onPlateChange(size)}
              >
                {plate === size && <ChoiceMark />}
                <img className="h-[clamp(48px,18vw,76px)] w-[clamp(48px,18vw,76px)] rounded-full object-cover" src={image} alt="" />
                <span className="text-center">
                  <strong className="block text-[clamp(8px,2.4vw,10px)]">{size} Plate</strong>
                  <b className="mt-0.5 block text-[8px] font-semibold text-[#6f6259]">{price}</b>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="mb-[7px]">
          <h3 className="mb-[5px] text-[11px] font-bold">
            <b className="mr-1 text-[#24201d]">3.</b>Choose Protein
          </h3>
          <div className="space-y-[5px]">
            {(['Chicken', 'Beef'] as const).map((name) => {
              const selected = protein === name
              return (
                <div key={name} className="grid h-[43px] grid-cols-[32px_1fr_auto] items-center rounded-[8px] border border-[#eee5dd] bg-white px-[7px]">
                  <span className="text-[20px]">{name === 'Chicken' ? '🍗' : '🥩'}</span>
                  <strong className="text-[9px]">{name}</strong>
                  <div className={`${quantityControlClass} h-[25px] gap-2 px-1.5`}>
                    <button className="text-[13px]" aria-label={`Remove ${name}`} onClick={() => selected && props.onQuantityChange(Math.max(0, quantity - 1))}>−</button>
                    <span className="min-w-[14px] text-center text-[9px]">{selected ? quantity : 0}</span>
                    <button className="text-[13px]" aria-label={`Add ${name}`} onClick={() => name === 'Chicken' ? props.onQuantityChange(quantity + 1) : props.onProteinChange('Beef')}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        <button className="flex h-[39px] w-full items-center justify-between border-t border-[#eee5dd] px-1 text-[9px] font-bold" aria-label="Select drinks">
          <span><span className="mr-2">🥤</span>Drinks <small className="ml-1 font-normal text-[#756b64]">(Select your drinks)</small></span>
          <span className="text-[15px]">⌄</span>
        </button>
      </div>
      <button className={`${primaryActionClass} shadow-[0_3px_8px_rgba(217,93,42,0.2)]`} onClick={() => props.onNavigate('cart')}>
        Add to Cart <b className="ml-2">→</b>
      </button>
    </div>
  )
}
