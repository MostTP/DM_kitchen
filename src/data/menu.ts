import type { CartItem, DrinkId, ExtraId, PlateSize, Protein, RiceType } from '../types'

export const foodImages = {
  jollof:
    '/jollof.jpeg',
  mixed:
    '/mixed.jpeg',
}

export const menuItems = [
  {
    id: 'jollof',
    name: 'Jollof Rice' as const,
    description: 'Classic Nigerian jollof rice.',
    price: 2300,
    image: foodImages.jollof,
  },
  {
    id: 'mixed',
    name: 'Mixed Rice' as const,
    description: 'A perfect blend of jollof and fried rice.',
    price: 2300,
    image: foodImages.mixed,
  },
]

export const extraItems: {
  id: ExtraId
  name: string
  emoji: string
  price: number
}[] = [
  { id: 'extra-beef', name: 'Extra Beef', emoji: '🥩', price: 800 },
  { id: 'extra-chicken', name: 'Extra Chicken', emoji: '🍗', price: 1300 },
  { id: 'extra-plantain', name: 'Extra Plantain', emoji: '🍌', price: 150 },
  { id: 'extra-egg', name: 'Extra Egg', emoji: '🥚', price: 500 },
]

export const drinkItems: {
  id: DrinkId
  name: string
  emoji: string
  price: number
}[] = [
  { id: 'drink', name: 'Drink', emoji: '🥤', price: 490 },
  { id: 'table-water', name: 'Table Water', emoji: '💧', price: 295 },
]

export function buildCartItems(
  rice: RiceType,
  plate: PlateSize,
  proteins: Record<Protein, number>,
  extras: Record<ExtraId, number>,
  drinks: Record<DrinkId, number>,
): CartItem[] {
  const platePrice = plate === 'Medium' ? 2300 : 3200
  const riceImage = rice === 'Jollof Rice' ? foodImages.jollof : foodImages.mixed
  const items: CartItem[] = (['Chicken', 'Beef'] as const)
    .filter((protein) => proteins[protein] > 0)
    .map((protein) => ({
      id: `rice-${protein.toLowerCase()}`,
      name: `${rice} with ${protein}`,
      description: `${plate} Plate`,
      quantity: proteins[protein],
      unitPrice: platePrice,
      image: riceImage,
    }))

  for (const item of extraItems) {
    if (extras[item.id] > 0) {
      items.push({
        id: item.id,
        name: item.name,
        description: 'Extra protein',
        quantity: extras[item.id],
        unitPrice: item.price,
        image: foodImages.jollof,
      })
    }
  }

  for (const item of drinkItems) {
    if (drinks[item.id] > 0) {
      items.push({
        id: item.id,
        name: item.name,
        description: 'Drink',
        quantity: drinks[item.id],
        unitPrice: item.price,
        image: '',
      })
    }
  }

  return items
}
