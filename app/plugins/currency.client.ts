export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const currency = useCurrencyStore()
    currency.init()
  })
})
