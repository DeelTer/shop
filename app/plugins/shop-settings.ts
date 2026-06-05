import type { SupportedCurrency, CurrencyRates } from '~/stores/shopSettings'

interface ShopSettingsData {
  name: string
  description: string
  color: string
  ip: string
  shopUrl: string
  ownerName: string
  ownerType: '' | 'individual' | 'self_employed' | 'sole_proprietor' | 'legal_entity'
  ownerInn: string
  contactEmail: string
  cartEnabled?: boolean
  baseCurrency?: SupportedCurrency
  currencyRates?: CurrencyRates
}

const CACHE_TTL = 30_000
let cached: { value: ShopSettingsData, expires: number } | null = null

export default defineNuxtPlugin(async (nuxtApp) => {
  const settings = useShopSettingsStore()
  const appConfig = useAppConfig()
  const api = nuxtApp.$api as typeof $fetch

  const { data } = await useAsyncData('shop-settings', async () => {
    if (import.meta.server && cached && cached.expires > Date.now()) {
      return cached.value
    }
    const value = await api<ShopSettingsData>('/shop-settings')
    if (import.meta.server) {
      cached = { value, expires: Date.now() + CACHE_TTL }
    }
    return value
  })

  if (data.value) {
    settings.apply(data.value)
    appConfig.ui.colors.primary = data.value.color
  }
})
