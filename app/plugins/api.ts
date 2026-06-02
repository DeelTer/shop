import { getRequestHeaders, getRequestIP } from 'h3'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const version = (config.public.appVersion as string) || '0.0.0'

  const api = $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit | undefined)
      if (!headers.has('X-FD-Client')) {
        headers.set('X-FD-Client', `shop/${version}`)
      }

      if (import.meta.server) {
        const event = nuxtApp.ssrContext?.event
        if (event) {
          const clientIp = getRequestIP(event, { xForwardedFor: true })
          if (clientIp) {
            headers.set('x-forwarded-for', clientIp)
            headers.set('x-real-ip', clientIp)
          }

          const incoming = getRequestHeaders(event)
          if (incoming['user-agent'] && !headers.has('user-agent')) {
            headers.set('user-agent', incoming['user-agent'])
          }
          if (incoming['accept-language'] && !headers.has('accept-language')) {
            headers.set('accept-language', incoming['accept-language'])
          }
        }
      }

      options.headers = headers
    }
  })

  return {
    provide: { api }
  }
})
