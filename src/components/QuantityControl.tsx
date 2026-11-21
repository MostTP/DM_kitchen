import { useState } from 'react'

interface QuantityControlProps {
  label: string
  quantity: number
  onChange: (quantity: number) => void
}

export function QuantityControl({ label, quantity, onChange }: QuantityControlProps) {
  const [draft, setDraft] = useState({ quantity, value: String(quantity) })
  const value = draft.quantity === quantity ? draft.value : String(quantity)

  const commitValue = () => {
    const next = Number(value)
    if (value !== '' && Number.isSafeInteger(next)) {
      onChange(next)
      setDraft({ quantity: next, value: String(next) })
    } else {
      setDraft({ quantity, value: String(quantity) })
    }
  }

  return (
    <div className="inline-flex h-10 items-center rounded-full border border-[#e7e1dc] bg-white">
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        disabled={quantity === 0}
        onClick={() => onChange(Math.max(0, quantity - 1))}
        className="grid h-10 w-10 place-items-center rounded-full text-xl text-[#514840] disabled:text-[#cfc8c2]"
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={`${label} quantity`}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          if (/^\d*$/.test(next)) {
            const parsed = Number(next)
            const validQuantity = next !== '' && Number.isSafeInteger(parsed)
            setDraft({ quantity: validQuantity ? parsed : quantity, value: next })
            if (validQuantity) onChange(parsed)
          }
        }}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commitValue()
            event.currentTarget.blur()
          }
        }}
        className="h-9 w-14 border-0 bg-transparent p-0 text-center text-sm font-semibold tabular-nums outline-none"
      />
      <button
        type="button"
        aria-label={`Add one ${label}`}
        onClick={() => onChange(quantity + 1)}
        className="grid h-10 w-10 place-items-center rounded-full text-xl font-medium text-[#ff701a]"
      >
        +
      </button>
    </div>
  )
}
