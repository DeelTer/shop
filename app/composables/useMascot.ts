// Module-level singleton — shared across all component instances
const activeCardId = ref<string | null>(null)

export function useMascot() {
  function show(id: string) {
    activeCardId.value = id
  }

  function hide(id: string) {
    if (activeCardId.value === id) {
      activeCardId.value = null
    }
  }

  function isActive(id: string): ComputedRef<boolean> {
    return computed(() => activeCardId.value === id)
  }

  return { show, hide, isActive }
}
