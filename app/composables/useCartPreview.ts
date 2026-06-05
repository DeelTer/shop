export interface CartPreviewItem {
  productId: string
  productName: string
  count: number
  unitPrice: number
  unitOriginalPrice: number
  lineTotal: number
  discountPercent: number
  upgradeDiscount: number
  blocked: boolean
  blockedReference?: { productName: string, referencePrice: number }
  groupConflict?: boolean
}

export interface CartPreview {
  currency: string
  items: CartPreviewItem[]
  total: number
  blockedCount: number
  currencyMismatch: boolean
}

const THROTTLE_MS = 10_000

export function useCartPreview(
  items: MaybeRefOrGetter<{ productId: string, count: number }[]>,
  nickname: MaybeRefOrGetter<string>
) {
  const $api = useNuxtApp().$api as typeof $fetch

  const preview = ref<CartPreview | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  let abort: AbortController | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastRun = 0

  async function run() {
    const body = {
      items: toValue(items),
      nickname: (toValue(nickname) || '').trim()
    }

    // Empty basket (or a closed checkout): clear state without touching the
    // throttle window, so reopening fires an immediate request.
    if (!body.items.length) {
      preview.value = null
      error.value = null
      loading.value = false
      if (abort) abort.abort()
      return
    }

    lastRun = Date.now()
    if (abort) abort.abort()
    abort = new AbortController()
    loading.value = true
    error.value = null

    try {
      preview.value = await $api<CartPreview>('/payments/cart/preview', {
        method: 'POST',
        body,
        signal: abort.signal
      })
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      error.value = e?.data?.message || e?.message || 'preview failed'
      preview.value = null
    } finally {
      loading.value = false
    }
  }

  function schedule() {
    const elapsed = Date.now() - lastRun
    if (timer) clearTimeout(timer)
    if (elapsed >= THROTTLE_MS) {
      run()
    } else {
      timer = setTimeout(run, THROTTLE_MS - elapsed)
    }
  }

  watch(
    [() => toValue(items), () => toValue(nickname)],
    schedule,
    { immediate: true, deep: true }
  )

  onScopeDispose(() => {
    if (timer) clearTimeout(timer)
    if (abort) abort.abort()
  })

  return { preview, loading, error, refresh: run }
}
