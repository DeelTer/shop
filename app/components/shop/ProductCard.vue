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
  cartMode?: boolean
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

// Mascot — desktop only
const { show: mascotShow, hide: mascotHide, isActive } = useMascot()
const mascotVisible = isActive(props.id)

let hoverTimer: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  hoverTimer = setTimeout(() => mascotShow(props.id), 300)
}

function onMouseLeave() {
  if (hoverTimer) clearTimeout(hoverTimer)
  mascotHide(props.id)
}

onUnmounted(() => {
  if (hoverTimer) clearTimeout(hoverTimer)
  mascotHide(props.id)
})
</script>

<template>
  <div
    class="group relative rounded-xl border border-default bg-elevated overflow-visible transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer flex flex-col"
    @click="emit('addToCart', id)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Mascot — appears above card, right side, pointer-events-none -->
    <ClientOnly>
      <div class="absolute -top-2 -right-2 z-50 translate-x-full -translate-y-1/2 pointer-events-none">
        <ShopMascotAssistant
          :product-name="props.name"
          :visible="mascotVisible"
        />
      </div>
    </ClientOnly>

    <!-- Image -->
    <div class="relative aspect-square bg-muted/10 overflow-hidden rounded-t-xl">
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
          name="i-pixelarticons-box"
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
    <div class="p-4 flex flex-col flex-1">
      <h3 class="font-bold whitespace-normal line-clamp-3 flex-1">
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
            name="i-pixelarticons-server"
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
        <UIcon
          name="i-pixelarticons-shopping-cart"
          class="size-4 text-muted group-hover:text-primary transition-colors"
        />
      </div>
    </div>
  </div>
</template>
