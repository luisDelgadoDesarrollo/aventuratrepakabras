<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { getImageUrl } from '~/composables/api/imgApi'

const props = defineProps<{
  images: string[]
  startIndex: number | null
}>()

const emit = defineEmits(['close'])

const currentIndex = ref<number | null>(props.startIndex)

watch(() => props.startIndex, (val) => {
  currentIndex.value = val
})

function close() {
  currentIndex.value = null
  emit('close')
}

function next() {
  if (currentIndex.value === null) return
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

function prev() {
  if (currentIndex.value === null) return
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <div v-if="currentIndex !== null" class="overlay" @click.self="close">
    <button class="close-btn" @click="close">✕</button>

    <button
        v-if="currentIndex > 0"
        class="nav-btn left"
        @click.stop="prev"
    >
      ‹
    </button>

    <img
        :src="getImageUrl(images[currentIndex])"
        class="preview-image"
    />

    <button
        v-if="currentIndex < images.length - 1"
        class="nav-btn right"
        @click.stop="next"
    >
      ›
    </button>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
}

.close-btn {
  position: absolute;
  top: 30px;
  right: 40px;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 1rem;
}

.left {
  left: 40px;
}

.right {
  right: 40px;
}
</style>
