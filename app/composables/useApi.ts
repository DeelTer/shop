import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(url: string, options?: UseFetchOptions<T>) {
  const config = useRuntimeConfig()
  const version = (config.public.appVersion as string) || '0.0.0'

  return useFetch<T>(url, {
    baseURL: config.public.apiBase as string,
    headers: {
      'X-FD-Client': `shop/${version}`
    },
    ...options as any
  })
}
