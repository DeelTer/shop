<script setup lang="ts">
import type { ProductPromotion, ProductServer } from '~/stores/products'

const props = defineProps<{
  id: string
  name: string
  price: number
  quantity: number
  currency: string
  imageUrl?: string
  activePromotions?: ProductPromotion[]
  discountPercent?: number
  discountedPrice?: number
  servers?: ProductServer[]
}>()

const emit = defineEmits<{
  addToCart: [id: string]
}>()

const { display } = useCurrency()

const hasDiscount = computed(() =>
  (props.discountPercent ?? 0) > 0
  && props.discountedPrice !== undefined
  && props.discountedPrice < props.price
)

const finalPrice = computed(() =>
  hasDiscount.value ? (props.discountedPrice as number) : props.price
)

const finalPriceFormatted = computed(() => display(finalPrice.value, props.currency))
const originalPriceFormatted = computed(() => display(props.price, props.currency))
</script>

<template>
  <div class="group rounded-xl border border-default bg-elevated overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
    <!-- Image -->
    <div class="relative aspect-square bg-muted/10 overflow-hidden">
      <img
        v-if="props.imageUrl"
        :src="props.imageUrl"
        :alt="props.name"
        loading="lazy"
        decoding="async"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      >
      <div
        v-else
        class="size-full flex items-center justify-center"
      >
        <UIcon
          name="i-lucide-package"
          class="size-16 text-muted/30"
        />
      </div>

      <!-- Promotion badges -->
      <div
        v-if="hasDiscount"
        class="absolute top-2 left-2 flex flex-col items-start gap-1"
      >
        <span
          v-for="promo in props.activePromotions"
          :key="promo.id"
          class="px-2 py-0.5 rounded-md text-xs font-bold bg-primary text-inverted shadow"
        >
          {{ promo.name }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-bold truncate">
        {{ props.name }}
      </h3>
      <div
        v-if="props.servers && props.servers.length > 0"
        class="flex flex-wrap gap-1 mt-1.5"
      >
        <span
          v-for="srv in props.servers"
          :key="srv.id"
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-elevated text-muted border border-default"
          :title="`Выдача на сервере: ${srv.name}`"
        >
          <UIcon
            name="i-lucide-server"
            class="size-3"
          />
          {{ srv.name }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-2">
        <div class="flex items-baseline gap-1.5 min-w-0">
          <span class="text-lg font-bold text-primary tabular-nums">
            {{ finalPriceFormatted }}
          </span>
          <span
            v-if="hasDiscount"
            class="text-xs text-muted line-through tabular-nums"
          >
            {{ originalPriceFormatted }}
          </span>
          <span class="text-xs text-muted shrink-0">/ {{ props.quantity }} шт.</span>
        </div>
        <UButton
          icon="i-lucide-shopping-cart"
          size="sm"
          square
          @click="emit('addToCart', props.id)"
        />
      </div>
    </div>
  </div>
</template>
