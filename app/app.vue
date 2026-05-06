<script setup lang="ts">
const settings = useShopSettingsStore()

useHead({
  htmlAttrs: { lang: 'ru' },
  titleTemplate: (chunk?: string) => {
    const name = settings.name || 'FreshDonate Shop'
    if (!chunk || chunk === name) return name
    return `${chunk} — ${name}`
  },
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
