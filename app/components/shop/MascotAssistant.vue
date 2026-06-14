<script setup lang="ts">
const props = defineProps<{
  productName: string
  visible: boolean
}>()

const PHRASES = [
  'Ого, интересный выбор!',
  'Сделаешь мне приятно?',
  'Добавляй в корзину',
  'Сделай это! Давай же!',
  'Хороший выбор',
  'Необычное решение',
  'Ну купи, ну пожалуйста..',
  'Это явно тебе нужно',
  'Не пожалеешь, обещаю!',
  'Берёшь? Берёшь же, да?',
  'Я бы взял, честно',
  'Уже в корзине в твоей голове?',
  'Редкий товар, торопись!',
  'Сразу видно, умный человек',
  'Наступи на меня ногой',
  'Мне тоже это нравится',
  'А друзьям купишь?',
  'А другу купишь?',
  'А мне купишь?'
]

const HEADS = [
  '/heads/head_blush2.webp',
  '/heads/head_death_eyes.webp',
  '/heads/head_eyes_down_thinking.webp',
  '/heads/head_look_confused.webp',
  '/heads/head_warn.webp',
  '/heads/head_warn2.webp',
]

// Head sequences per mood: typing, idle, excited
const HEAD_SEQUENCES = {
  typing: ['/heads/head_eyes_down_thinking.webp', '/heads/head_warn.webp', '/heads/head_eyes_down_thinking.webp'],
  done: ['/heads/head_blush2.webp', '/heads/head_warn2.webp'],
  idle: ['/heads/head_look_confused.webp', '/heads/head_death_eyes.webp'],
}

const currentHead = ref(HEADS[0]!)
const displayText = ref('')
const isTyping = ref(false)
const show = ref(false)

let typingTimer: ReturnType<typeof setTimeout> | null = null
let headTimer: ReturnType<typeof setTimeout> | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let headCycleTimer: ReturnType<typeof setTimeout> | null = null

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function clearAllTimers() {
  if (typingTimer) clearTimeout(typingTimer)
  if (headTimer) clearTimeout(headTimer)
  if (hideTimer) clearTimeout(hideTimer)
  if (headCycleTimer) clearTimeout(headCycleTimer)
}

function cycleHead(sequence: string[], index = 0, interval = 300) {
  currentHead.value = sequence[index % sequence.length]!
  headCycleTimer = setTimeout(() => cycleHead(sequence, index + 1, interval), interval)
}

function stopHeadCycle() {
  if (headCycleTimer) clearTimeout(headCycleTimer)
}

function typeText(text: string, onDone: () => void) {
  displayText.value = ''
  isTyping.value = true
  let i = 0

  // Cycle heads while typing
  cycleHead(HEAD_SEQUENCES.typing, 0, 280)

  function nextChar() {
    if (i < text.length) {
      displayText.value += text[i]!
      i++
      typingTimer = setTimeout(nextChar, 55 + Math.random() * 35)
    } else {
      isTyping.value = false
      stopHeadCycle()
      currentHead.value = pickRandom(HEAD_SEQUENCES.done)
      onDone()
    }
  }

  nextChar()
}

watch(() => props.visible, (val) => {
  clearAllTimers()

  if (!val) {
    // fade out
    hideTimer = setTimeout(() => { show.value = false }, 200)
    return
  }

  show.value = true
  displayText.value = ''
  currentHead.value = pickRandom(HEAD_SEQUENCES.idle)

  // Small delay before typing starts
  headTimer = setTimeout(() => {
    const phrase = pickRandom(PHRASES)
    typeText(phrase, () => {
      // After typing done, hold for 3s then hide
      hideTimer = setTimeout(() => {
        stopHeadCycle()
        currentHead.value = pickRandom(HEAD_SEQUENCES.idle)
      }, 3000)
    })
  }, 400)
})

onUnmounted(clearAllTimers)
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 scale-75 translate-y-2"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-75 translate-y-2"
  >
    <div
      v-if="show"
      class="pointer-events-none select-none flex flex-col items-center gap-1"
    >
      <!-- Speech bubble -->
      <div
        v-if="displayText"
        class="relative max-w-[180px] px-2.5 py-1.5 rounded-lg"
        style="background: rgba(0,0,0,0.75)"
      >
        <p
          class="text-white text-xs leading-tight whitespace-pre-wrap break-words"
          style="font-family: 'Minecraft', system-ui, sans-serif; min-height: 1.2em"
        >
          {{ displayText }}<span
            v-if="isTyping"
            class="inline-block w-0.5 h-3 bg-white ml-0.5 align-middle animate-pulse"
          />
        </p>
        <!-- Arrow down -->
        <div
          class="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
          style="border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(0,0,0,0.75)"
        />
      </div>

      <!-- Head -->
      <img
        :src="currentHead"
        alt="mascot"
        class="size-10 object-contain"
        style="image-rendering: pixelated"
        draggable="false"
      >
    </div>
  </Transition>
</template>
