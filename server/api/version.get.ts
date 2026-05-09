import pkg from '../../package.json'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*'
  })

  return {
    name: 'FreshDonate Shop',
    version: pkg.version
  }
})
