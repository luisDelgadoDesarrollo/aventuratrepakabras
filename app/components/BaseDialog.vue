<script setup lang="ts">
import { watch, onMounted, onUnmounted } from "vue"

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(["update:modelValue"])

function close() {
  emit("update:modelValue", false)
}

function handleKey(e: KeyboardEvent) {
  if (e.key === "Escape") close()
}

watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        document.body.style.overflow = "hidden"
      } else {
        document.body.style.overflow = ""
      }
    }
)

onMounted(() => window.addEventListener("keydown", handleKey))
onUnmounted(() => window.removeEventListener("keydown", handleKey))
</script>

<template>
  <Teleport to="body">
    <div
        v-if="modelValue"
        class="dialog-overlay"
        @click.self="close"
    >
      <div class="dialog-content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.dialog-content {
  background: white;
  border-radius: var(--radius-md);
  padding: 2rem;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
</style>
