<script setup lang="ts">
defineProps<{
  title: string
  serverIp?: string
}>()

const copied = ref(false)

function copyIp(ip: string) {
  navigator.clipboard.writeText(ip)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

const container = ref<HTMLElement | null>(null)
const bgEl = ref<HTMLElement | null>(null)
const headEl = ref<HTMLElement | null>(null)

let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let isInside = false
let rafId = 0
let settled = true

const LERP_INSIDE = 0.06
const LERP_OUTSIDE = 0.03  // slower when mouse outside banner

function applyStyles() {
  if (bgEl.value) {
    bgEl.value.style.transform = `translate(${currentX * -8}px, ${currentY * -8}px) scale(1.06)`
  }
  if (headEl.value) {
    headEl.value.style.transform = `translate(${currentX * 10}px, ${currentY * 10}px) rotate(${currentX * 3}deg)`
  }
}

function tick() {
  const lerp = isInside ? LERP_INSIDE : LERP_OUTSIDE
  const dx = (targetX - currentX) * lerp
  const dy = (targetY - currentY) * lerp
  currentX += dx
  currentY += dy

  applyStyles()

  // Stop RAF when values are settled (saves CPU when mouse is still)
  if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) {
    settled = true
    rafId = 0
    return
  }

  rafId = requestAnimationFrame(tick)
}

function scheduleTick() {
  if (settled) {
    settled = false
    rafId = requestAnimationFrame(tick)
  }
}

function onWindowMouseMove(e: MouseEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  isInside = (
    e.clientX >= rect.left && e.clientX <= rect.right
    && e.clientY >= rect.top && e.clientY <= rect.bottom
  )

  targetX = Math.max(-1.5, Math.min(1.5, (e.clientX - centerX) / (rect.width / 2)))
  targetY = Math.max(-1.5, Math.min(1.5, (e.clientY - centerY) / (rect.height / 2)))

  scheduleTick()
}

onMounted(() => {
  const hasPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (!hasPointer) return
  // Defer until after hydration + first paint to avoid blocking interactivity
  const start = () => {
    window.addEventListener('mousemove', onWindowMouseMove, { passive: true })
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 1000 })
  } else {
    setTimeout(start, 200)
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onWindowMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    ref="container"
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-default"
  >
    <!-- Parallax background -->
    <div
      ref="bgEl"
      class="absolute inset-0 bg-center bg-cover pointer-events-none"
      :style="{ backgroundImage: 'url(/backdrop.webp)' }"
    />

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/10 pointer-events-none" />

    <div class="relative flex items-center justify-between px-8 py-12 md:py-16 pointer-events-none">
      <div class="space-y-4">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow">
          {{ title }}
        </h1>

        <!-- pointer-events-auto only on the interactive button -->
        <UButton
          v-if="serverIp"
          :label="copied ? 'Скопировано!' : serverIp"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          variant="subtle"
          color="neutral"
          size="lg"
          class="pointer-events-auto"
          @click="copyIp(serverIp!)"
        />
      </div>

      <!-- MC head — purely decorative, no pointer events -->
      <div class="hidden md:block">
        <div
          ref="headEl"
          class="size-48 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center pointer-events-none"
        >
          <img
            src="/mc_head.webp"
            alt="Server mascot"
            class="w-full h-full object-cover select-none"
            draggable="false"
          >
        </div>
      </div>
    </div>
  </div>
</template>
