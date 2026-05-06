export type OwnerType = '' | 'individual' | 'self_employed' | 'sole_proprietor' | 'legal_entity'

interface ShopSettingsData {
  name: string
  description: string
  ip: string
  color: string
  shopUrl: string
  ownerName: string
  ownerType: OwnerType
  ownerInn: string
  contactEmail: string
}

export const useShopSettingsStore = defineStore('shopSettings', () => {
  const name = ref('FreshDonate Shop')
  const description = ref('')
  const color = ref('sky')
  const ip = ref('play.example.com')
  const shopUrl = ref('')
  const ownerName = ref('')
  const ownerType = ref<OwnerType>('')
  const ownerInn = ref('')
  const contactEmail = ref('')

  function apply(data: ShopSettingsData) {
    name.value = data.name
    description.value = data.description
    color.value = data.color
    ip.value = data.ip
    shopUrl.value = (data.shopUrl || '').replace(/\/+$/, '')
    ownerName.value = data.ownerName || ''
    ownerType.value = (data.ownerType || '') as OwnerType
    ownerInn.value = data.ownerInn || ''
    contactEmail.value = data.contactEmail || ''
  }

  return {
    name,
    description,
    ip,
    color,
    shopUrl,
    ownerName,
    ownerType,
    ownerInn,
    contactEmail,
    apply
  }
})
