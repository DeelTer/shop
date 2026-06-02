import type { Product } from '~/stores/products'

const CACHE_TTL = 30_000
let cached: { value: Product[], expires: number } | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = useProductsStore()
  const api = nuxtApp.$api as typeof $fetch

  const { data } = await useAsyncData('products', async () => {
    if (import.meta.server && cached && cached.expires > Date.now()) {
      return cached.value
    }
    const value = await api<Product[]>('/products')
    if (import.meta.server) {
      cached = { value, expires: Date.now() + CACHE_TTL }
    }
    return value
  })

  if (data.value) {
    store.apply(data.value)
  }
})
