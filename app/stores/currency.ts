import type { SupportedCurrency } from '~/stores/shopSettings'

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['RUB', 'USD', 'EUR']

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
}

const STORAGE_KEY = 'fd-display-currency'

function isSupported(code: string | null | undefined): code is SupportedCurrency {
  return !!code && (SUPPORTED_CURRENCIES as string[]).includes(code)
}

// Best-effort guess of which display currency a visitor expects. Runs on the
// client only — SSR uses the base currency until hydration so SSR/CSR render
// matches without leaking server-side IP geo.
function detectFromBrowser(): SupportedCurrency | null {
  if (typeof navigator === 'undefined') return null

  const locales = [navigator.language, ...(navigator.languages || [])]
  for (const locale of locales) {
    if (!locale) continue
    const region = locale.split('-')[1]?.toUpperCase()
    if (!region) continue
    if (region === 'RU' || region === 'BY' || region === 'KZ') return 'RUB'
    if (region === 'US') return 'USD'
    if (
      region === 'DE' || region === 'FR' || region === 'IT' || region === 'ES'
      || region === 'NL' || region === 'BE' || region === 'AT' || region === 'PT'
      || region === 'IE' || region === 'FI' || region === 'GR' || region === 'LV'
      || region === 'LT' || region === 'EE' || region === 'SK' || region === 'SI'
      || region === 'LU' || region === 'MT' || region === 'CY' || region === 'HR'
    ) return 'EUR'
  }

  // Fallback: RU language family on locales without region.
  const lang = (navigator.language || '').split('-')[0]?.toLowerCase()
  if (lang === 'ru' || lang === 'uk' || lang === 'be' || lang === 'kk') return 'RUB'
  if (lang === 'en') return 'USD'

  return null
}

export const useCurrencyStore = defineStore('currency', () => {
  const settings = useShopSettingsStore()

  // Backed by a cookie so SSR and the first client paint always agree —
  // avoids the hydration mismatch you'd get from reading localStorage or
  // navigator post-hydration. Geo detection writes the cookie once on the
  // client, after which subsequent renders are stable.
  const cookie = useCookie<SupportedCurrency | null>(STORAGE_KEY, {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365
  })

  const display = computed<SupportedCurrency>(() => {
    const stored = cookie.value
    return isSupported(stored) ? stored : settings.baseCurrency
  })

  function setDisplay(code: SupportedCurrency) {
    if (!isSupported(code)) return
    cookie.value = code
  }

  // Client-only one-shot: if no cookie yet, write the browser-locale guess.
  // Triggers a single reactive update on first visit; subsequent visits read
  // the cookie during SSR and render cleanly.
  function init() {
    if (cookie.value) return
    const detected = detectFromBrowser()
    if (detected && detected !== settings.baseCurrency) {
      cookie.value = detected
    }
  }

  return { display, setDisplay, init }
})
