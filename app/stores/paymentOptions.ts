export interface PaymentOptionData {
  id: string
  name: string
  icon: string
  providerId: string
  redirectUrl: string | null
  sortOrder: number
  enabled: boolean
}

export const usePaymentOptionsStore = defineStore('paymentOptions', () => {
  const items = ref<PaymentOptionData[]>([])

  function apply(data: PaymentOptionData[]) {
    items.value = data
  }

  return { items, apply }
})
