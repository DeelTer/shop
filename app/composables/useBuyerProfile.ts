const STORAGE_KEY = 'fd-buyer-profile'

export interface BuyerProfile {
  nickname: string
  email: string
  paymentOptionId: string
}

function emptyProfile(): BuyerProfile {
  return { nickname: '', email: '', paymentOptionId: '' }
}

function readFromStorage(): BuyerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProfile()
    const parsed = JSON.parse(raw)
    return {
      nickname: typeof parsed?.nickname === 'string' ? parsed.nickname : '',
      email: typeof parsed?.email === 'string' ? parsed.email : '',
      paymentOptionId: typeof parsed?.paymentOptionId === 'string' ? parsed.paymentOptionId : ''
    }
  } catch {
    return emptyProfile()
  }
}

export function useBuyerProfile() {
  const profile = useState<BuyerProfile>('buyer-profile', emptyProfile)

  if (import.meta.client) {
    const hydrated = useState<boolean>('buyer-profile-hydrated', () => false)
    if (!hydrated.value) {
      Object.assign(profile.value, readFromStorage())
      hydrated.value = true

      watch(profile, (v) => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
        } catch {
          // storage may be unavailable (Safari private mode, quota) - skip silently
        }
      }, { deep: true })
    }
  }

  return profile
}
