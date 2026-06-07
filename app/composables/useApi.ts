import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(url: string, options?: UseFetchOptions<T>) {
  const $api = useNuxtApp().$api as typeof $fetch

  return useFetch<T>(url, {
    $fetch: $api,
    ...options as any
  })
}
