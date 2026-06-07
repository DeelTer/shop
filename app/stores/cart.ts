import type { Product } from '~/stores/products'

const STORAGE_KEY = 'fd-cart'
const MAX_ITEMS = 20
const MAX_COUNT = 100000

export interface CartItem {
  productId: string
  name: string
  price: number
  originalPrice: number
  currency: string
  imageUrl?: string
  type: string
  allowCustomCount: boolean
  count: number
}

export type AddResult = { ok: true } | { ok: false, reason: 'currency' | 'full' }

function cardUnitPrice(p: Product): number {
  const hasDiscount = (p.discountPercent ?? 0) > 0
    && p.discountedPrice !== undefined
    && p.discountedPrice < p.price
  return hasDiscount ? (p.discountedPrice as number) : p.price
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const distinctCount = computed(() => items.value.length)
  const totalItems = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  const cartCurrency = computed(() => items.value[0]?.currency ?? null)

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.count, 0)
  )

  function canCustomCount(item: Pick<CartItem, 'allowCustomCount' | 'type'>): boolean {
    return item.allowCustomCount && item.type !== 'privilege'
  }

  function addItem(p: Product): AddResult {
    const existing = items.value.find(i => i.productId === p.id)
    if (existing) {
      if (canCustomCount(existing)) {
        existing.count = Math.min(MAX_COUNT, existing.count + 1)
      }
      return { ok: true }
    }

    if (cartCurrency.value && p.currency !== cartCurrency.value) {
      return { ok: false, reason: 'currency' }
    }
    if (items.value.length >= MAX_ITEMS) {
      return { ok: false, reason: 'full' }
    }

    items.value.push({
      productId: p.id,
      name: p.name,
      price: cardUnitPrice(p),
      originalPrice: p.price,
      currency: p.currency,
      imageUrl: p.imageUrl,
      type: p.type,
      allowCustomCount: p.allowCustomCount,
      count: 1
    })
    return { ok: true }
  }

  function setCount(productId: string, n: number) {
    const item = items.value.find(i => i.productId === productId)
    if (!item) return
    if (!canCustomCount(item)) {
      item.count = 1
      return
    }
    const next = Math.floor(Number(n) || 1)
    item.count = Math.max(1, Math.min(MAX_COUNT, next))
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(item => item.productId !== productId)
  }

  function clear() {
    items.value = []
  }

  function reconcile(products: Product[]) {
    const byId = new Map(products.map(p => [p.id, p]))
    items.value = items.value.filter((item) => {
      const product = byId.get(item.productId)
      return product !== undefined
    })
    // If currencies somehow diverged, keep only the first currency's lines.
    const cur = items.value[0]?.currency
    if (cur) items.value = items.value.filter(i => i.currency === cur)
  }

  // Payload for the cart API: just product ids + counts.
  const apiItems = computed(() =>
    items.value.map(i => ({ productId: i.productId, count: i.count }))
  )

  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) items.value = parsed
      }
    } catch {
      // ignore corrupt / unavailable storage
    }

    watch(items, (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {
        // storage may be unavailable (private mode, quota) - skip silently
      }
    }, { deep: true })
  }

  return {
    items,
    distinctCount,
    totalItems,
    isEmpty,
    cartCurrency,
    subtotal,
    apiItems,
    addItem,
    setCount,
    removeItem,
    clear,
    reconcile
  }
})
