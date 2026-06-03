import type { SupportedCurrency, CurrencyRates } from '~/stores/shopSettings'
import { CURRENCY_SYMBOLS } from '~/stores/currency'

/**
 * Visual-only price conversion. The actual payment is always processed in
 * the product's original currency; this just lets the visitor see prices in
 * a familiar unit.
 */
export function useCurrency() {
  const settings = useShopSettingsStore()
  const currency = useCurrencyStore()

  function rateToBase(code: string): number {
    if (code === settings.baseCurrency) return 1
    const rate = settings.currencyRates?.[code as SupportedCurrency]
    if (!rate || !Number.isFinite(rate) || rate <= 0) return 1
    return rate
  }

  /** Convert `amount` from `fromCurrency` into the active display currency. */
  function convert(amount: number, fromCurrency: string): number {
    const target = currency.display
    if (fromCurrency === target) return amount
    const inBase = amount * rateToBase(fromCurrency)
    if (target === settings.baseCurrency) return inBase
    const targetRate = rateToBase(target)
    if (!targetRate) return inBase
    return inBase / targetRate
  }

  function symbolFor(code: string): string {
    return CURRENCY_SYMBOLS[code as SupportedCurrency] || code
  }

  /**
   * Locale-aware formatting: rounds RUB to whole units, keeps USD/EUR at 2 dp.
   * Explicit locale per currency so SSR (Node default) and CSR (browser)
   * produce byte-identical strings - needed to avoid hydration mismatches.
   */
  function format(amount: number, code?: SupportedCurrency): string {
    const target = code || currency.display
    const decimals = target === 'RUB' ? 0 : 2
    const locale = target === 'RUB' ? 'ru-RU' : 'en-US'
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return `${formatted}${symbolFor(target)}`
  }

  /** One-shot helper: convert + format in the active display currency. */
  function display(amount: number, fromCurrency: string): string {
    return format(convert(amount, fromCurrency))
  }

  return {
    convert,
    format,
    display,
    symbolFor,
    displayCurrency: computed(() => currency.display),
    displaySymbol: computed(() => symbolFor(currency.display))
  }
}
