import type { PaymentOptionData } from '~/stores/paymentOptions'

const CACHE_TTL = 30_000
let cached: { value: PaymentOptionData[], expires: number } | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = usePaymentOptionsStore()
  const api = nuxtApp.$api as typeof $fetch

  const { data } = await useAsyncData('payment-options', async () => {
    if (import.meta.server && cached && cached.expires > Date.now()) {
      return cached.value
    }
    const value = await api<PaymentOptionData[]>('/payment-options')
    if (import.meta.server) {
      cached = { value, expires: Date.now() + CACHE_TTL }
    }
    return value
  })

  if (data.value) {
    store.apply(data.value)
  }
})
