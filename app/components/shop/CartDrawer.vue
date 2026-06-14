<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ checkout: [] }>()

const cart = useCartStore()
const { display: displayPrice } = useCurrency()

const cartCurrency = computed(() => cart.cartCurrency || 'RUB')

const quantitySuffix: Record<string, string> = {
  item: 'шт.',
  privilege: 'дн.',
  currency: 'монет',
  other: 'шт.'
}

function checkout() {
  open.value = false
  emit('checkout')
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Корзина"
    :ui="{ body: 'p-0' }"
  >
    <template #body>
      <!-- Empty -->
      <div
        v-if="cart.isEmpty"
        class="flex flex-col items-center justify-center h-full text-center px-6 py-16"
      >
        <UIcon
          name="i-pixelarticons-shopping-cart"
          class="size-16 text-muted/20"
        />
        <p class="mt-4 text-muted">
          Корзина пуста
        </p>
      </div>

      <!-- Items -->
      <div
        v-else
        class="divide-y divide-default"
      >
        <div
          v-for="item in cart.items"
          :key="item.productId"
          class="flex items-center gap-3 p-4"
        >
          <div class="size-12 rounded-md overflow-hidden bg-muted/10 shrink-0">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="size-full object-cover"
            >
            <div
              v-else
              class="size-full flex items-center justify-center"
            >
              <UIcon
                name="i-pixelarticons-package"
                class="size-6 text-muted/30"
              />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium truncate">
              {{ item.name }}
            </p>
            <p class="text-xs text-muted tabular-nums">
              {{ displayPrice(item.price, item.currency) }} / {{ quantitySuffix[item.type] || 'шт.' }}
            </p>

            <!-- Count -->
            <div
              v-if="item.allowCustomCount && item.type !== 'privilege'"
              class="flex items-center gap-1 mt-1.5"
            >
              <UButton
                icon="i-pixelarticons-minus"
                size="xs"
                variant="soft"
                color="neutral"
                square
                :disabled="item.count <= 1"
                @click="cart.setCount(item.productId, item.count - 1)"
              />
              <span class="w-8 text-center text-sm tabular-nums">{{ item.count }}</span>
              <UButton
                icon="i-pixelarticons-plus"
                size="xs"
                variant="soft"
                color="neutral"
                square
                @click="cart.setCount(item.productId, item.count + 1)"
              />
            </div>
          </div>

          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-sm font-semibold tabular-nums">
              {{ displayPrice(item.price * item.count, item.currency) }}
            </span>
            <UButton
              icon="i-pixelarticons-trash-2"
              size="xs"
              variant="ghost"
              color="error"
              square
              @click="cart.removeItem(item.productId)"
            />
          </div>
        </div>
      </div>
    </template>

    <template
      v-if="!cart.isEmpty"
      #footer
    >
      <div class="w-full space-y-3">
        <div class="flex items-center justify-between">
          <span class="font-semibold">Итого:</span>
          <span class="text-lg font-bold text-primary tabular-nums">
            {{ displayPrice(cart.subtotal, cartCurrency) }}
          </span>
        </div>
        <UButton
          label="Оформить"
          icon="i-pixelarticons-arrow-right"
          trailing
          size="lg"
          block
          @click="checkout"
        />
      </div>
    </template>
  </USlideover>
</template>
