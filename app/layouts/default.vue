<script setup lang="ts">
const cart = useCartStore()
const settings = useShopSettingsStore()
const legal = useLegalInfo()

interface navLink {
  label: string
  to: string
  icon: string
}

const navLinks: navLink[] = []

const cartOpen = ref(false)
const checkoutOpen = ref(false)

function openCheckout() {
  checkoutOpen.value = true
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-default">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 border-b border-default bg-elevated/80 backdrop-blur-xl">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo + Name -->
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5"
          >
            <div class="size-8 rounded-lg bg-primary flex items-center justify-center">
              <UIcon
                name="pixelarticons:sparkles"
                class="size-4 text-white"
              />
            </div>
            <span class="text-lg font-bold tracking-tight">{{ settings.name }}</span>
          </NuxtLink>

          <!-- Nav links (desktop) -->
          <nav class="hidden md:flex items-center gap-1">
            <UButton
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              :label="link.label"
              :icon="link.icon"
              variant="ghost"
              size="sm"
            />
          </nav>

          <!-- Right side -->
          <div class="flex items-center gap-2">
            <ShopCurrencySwitcher />
            <!-- ClientOnly: cart count comes from localStorage, so SSR would
                 render 0 and mismatch the hydrated value. -->
            <ClientOnly v-if="settings.cartEnabled">
              <UButton
                variant="ghost"
                color="neutral"
                square
                aria-label="Корзина"
                @click="cartOpen = true"
              >
                <UChip
                  :text="cart.totalItems"
                  :show="cart.totalItems > 0"
                  size="2xl"
                  color="primary"
                >
                  <UIcon
                    name="i-pixelarticons-shopping-cart"
                    class="size-5"
                  />
                </UChip>
              </UButton>
            </ClientOnly>
          </div>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Cart (opt-in) -->
    <template v-if="settings.cartEnabled">
      <ShopCartDrawer
        v-model:open="cartOpen"
        @checkout="openCheckout"
      />
      <ShopCheckoutModal v-model:open="checkoutOpen" />
    </template>

    <!-- Footer -->
    <footer class="border-t border-default">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Footer top -->
        <div class="flex flex-col gap-6 py-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-primary flex items-center justify-center">
              <UIcon
                name="pixelarticons:sparkles"
                class="size-5 text-white"
              />
            </div>
            <div>
              <p class="font-bold">
                {{ settings.name }}
              </p>
              <p
                v-if="settings.description"
                class="text-sm text-muted"
              >
                {{ settings.description }}
              </p>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <NuxtLink
                  to="https://t.me/communityofminers"
                  target="_blank"
                  class="text-muted hover:text-default flex items-center gap-1 text-sm"
                  aria-label="Telegram"
                >
                  <UIcon
                    name="pixelarticons:external-link"
                    class="size-3.5"
                  />
                  Телеграм
                </NuxtLink>
                <NuxtLink
                  to="https://vk.com/community_of_miners"
                  target="_blank"
                  class="text-muted hover:text-default flex items-center gap-1 text-sm"
                  aria-label="ВКонтакте"
                >
                  <UIcon
                    name="pixelarticons:external-link"
                    class="size-3.5"
                  />
                  ВКонтакте
                </NuxtLink>
                <NuxtLink
                  to="https://www.youtube.com/@plyazhni"
                  target="_blank"
                  class="text-muted hover:text-default flex items-center gap-1 text-sm"
                  aria-label="YouTube"
                >
                  <UIcon
                    name="pixelarticons:external-link"
                    class="size-3.5"
                  />
                  YouTube
                </NuxtLink>
                <NuxtLink
                  to="https://tiktok.com/@deelter"
                  target="_blank"
                  class="text-muted hover:text-default flex items-center gap-1 text-sm"
                  aria-label="TikTok"
                >
                  <UIcon
                    name="pixelarticons:external-link"
                    class="size-3.5"
                  />
                  TikTok
                </NuxtLink>
              </div>
            </div>
          </div>

          <nav class="flex flex-col gap-y-1 text-sm md:items-end">
            <NuxtLink
              to="/legal/offer"
              class="text-muted hover:text-default"
            >
              Публичная оферта
            </NuxtLink>
            <NuxtLink
              to="/legal/terms"
              class="text-muted hover:text-default"
            >
              Пользовательское соглашение
            </NuxtLink>
            <NuxtLink
              to="/legal/privacy"
              class="text-muted hover:text-default"
            >
              Политика конфиденциальности
            </NuxtLink>
          </nav>
        </div>

        <!-- Footer bottom -->
        <div class="border-t border-default py-4 text-sm text-muted opacity-50 flex items-center justify-between gap-4">
          <div class="space-y-1">
            <p>&copy; {{ new Date().getFullYear() }} {{ settings.name }}. Все права защищены.</p>
            <p>
              Сайт использует
              <NuxtLink
                to="https://fd.zaralx.ru"
                target="_blank"
                class="text-primary hover:underline"
              >
                FreshDonate
              </NuxtLink>
            </p>
          </div>
          <div class="text-xs text-right">
            <p>{{ legal.ownerName.value }}</p>
            <p>ИНН: {{ legal.ownerInn.value }}</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
