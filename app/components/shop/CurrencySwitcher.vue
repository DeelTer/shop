<script setup lang="ts">
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS } from '~/stores/currency'
import type { SupportedCurrency } from '~/stores/shopSettings'

const currency = useCurrencyStore()

const items = computed(() =>
  SUPPORTED_CURRENCIES.map(code => ({
    label: `${code} ${CURRENCY_SYMBOLS[code]}`,
    code,
    onSelect: () => currency.setDisplay(code)
  }))
)

const menuItems = computed(() => [
  items.value.map(item => ({
    label: item.label,
    icon: currency.display === item.code ? 'i-pixelarticons-check' : undefined,
    onSelect: item.onSelect
  }))
])
</script>

<template>
  <UDropdownMenu :items="menuItems">
    <UButton
      :label="`${currency.display} ${CURRENCY_SYMBOLS[currency.display as SupportedCurrency]}`"
      icon="i-pixelarticons-globe"
      trailing-icon="i-pixelarticons-chevron-down"
      variant="ghost"
      color="neutral"
      size="sm"
    />
  </UDropdownMenu>
</template>
