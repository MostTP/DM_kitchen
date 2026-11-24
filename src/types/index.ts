export type Screen =
  | 'home'
  | 'menu'
  | 'customize'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'success'
  | 'track'
  | 'admin'
  | 'admin-login'

export type RiceType = 'Jollof Rice' | 'Mixed Rice'
export type PlateSize = 'Medium' | 'Big'
export type Protein = 'Chicken' | 'Beef'
export type ExtraId =
  | 'extra-beef'
  | 'extra-chicken'
  | 'extra-plantain'
  | 'extra-egg'
export type DrinkId = 'drink' | 'table-water'

export interface CartItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  image: string
}

export type FulfillmentMethod = 'delivery' | 'collection'

export interface CustomerDetails {
  fullName: string
  phone: string
  email: string
  address: string
  fulfillmentMethod?: FulfillmentMethod
  deliveryDate: string
  specialInstructions: string
}

export interface Order {
  orderId: string
  customer: CustomerDetails
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentStatus: 'pending' | 'paid'
  status?: string
  createdAt?: string
}

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
