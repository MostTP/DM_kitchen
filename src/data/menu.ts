import type { CartItem, DrinkId, ExtraId, PlateSize, Protein, RiceType } from '../types'

export const foodImages = {
  jollof:
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',
  mixed:
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85',
}

export const menuItems = [
  {
    id: 'jollof',
    name: 'Jollof Rice' as const,
    description: 'Classic Nigerian jollof rice.',
    price: 2500,
    image: foodImages.jollof,
  },
  {
    id: 'mixed',
    name: 'Mixed Rice' as const,
    description: 'A perfect blend of jollof and fried rice.',
    price: 2500,
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
]

export const drinkItems: {
  id: DrinkId
  name: string
  emoji: string
  price: number
}[] = [{ id: 'pepsi', name: 'Pepsi', emoji: '🥤', price: 400 }]

export function buildCartItems(
  rice: RiceType,
  plate: PlateSize,
  proteins: Record<Protein, number>,
  extras: Record<ExtraId, number>,
  drinks: Record<DrinkId, number>,
): CartItem[] {
  const platePrice = plate === 'Medium' ? 2500 : 3500
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
