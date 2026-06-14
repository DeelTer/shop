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

// Target mouse position (-1 to 1)
const targetX = ref(0)
const targetY = ref(0)

// Smoothed current position (lerped each frame)
const currentX = ref(0)
const currentY = ref(0)

const LERP = 0.05 // lower = slower/smoother

let rafId = 0

function tick() {
  currentX.value += (targetX.value - currentX.value) * LERP
  currentY.value += (targetY.value - currentY.value) * LERP
  rafId = requestAnimationFrame(tick)
}

onMounted(() => { rafId = requestAnimationFrame(tick) })
onUnmounted(() => cancelAnimationFrame(rafId))

function onMouseMove(e: MouseEvent) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  targetX.value = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  targetY.value = ((e.clientY - rect.top) / rect.height - 0.5) * 2
}

function onMouseLeave() {
  targetX.value = 0
  targetY.value = 0
}

const bgStyle = computed(() => ({
  transform: `translate(${currentX.value * -8}px, ${currentY.value * -8}px) scale(1.06)`
}))

const headStyle = computed(() => ({
  transform: `translate(${currentX.value * 10}px, ${currentY.value * 10}px) rotate(${currentX.value * 3}deg)`
}))
</script>

<template>
  <div
    ref="container"
    class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-default"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <!-- Parallax background -->
    <div
      class="absolute inset-0 bg-center bg-cover"
      :style="[{ backgroundImage: 'url(/backdrop.webp)' }, bgStyle]"
    />

    <!-- Gradient overlay so text stays readable -->
    <div class="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/10" />

    <div class="relative flex items-center justify-between px-8 py-12 md:py-16">
      <div class="space-y-4">
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow">
          {{ title }}
        </h1>

        <UButton
          v-if="serverIp"
          :label="copied ? 'Скопировано!' : serverIp"
          :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
          variant="subtle"
          color="neutral"
          size="lg"
          @click="copyIp(serverIp!)"
        />
      </div>

      <!-- MC head with parallax + sway -->
      <div class="hidden md:block">
        <div
          class="size-48 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center"
          :style="headStyle"
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
