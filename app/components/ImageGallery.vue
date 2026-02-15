<script setup lang="ts">
import { ref, computed } from 'vue'
import { getImageUrl } from '~/composables/api/imgApi'
import ImagePreview from './ImagePreview.vue'

const props = defineProps<{
  images: string[]
}>()

const previewIndex = ref<number | null>(null)

const columnCount = computed(() => {
  const count = props.images?.length || 0
  if (count <= 4) return count
  return 4
})

const remainder = computed(() => {
  const count = props.images?.length || 0
  if (count <= 4) return 0
  return count % 4
})

function open(index: number) {
  previewIndex.value = index
}
</script>

<template>
  <div
      v-if="images?.length"
      class="images-grid"
      :style="{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }"
  >
    <img
        v-for="(img, index) in images"
        :key="img"
        :src="getImageUrl(img)"
        class="image-item"
        @click="open(index)"
        :class="{
        'last-row-1': remainder === 1 && index >= images.length - 1,
        'last-row-2': remainder === 2 && index >= images.length - 2,
        'last-row-3': remainder === 3 && index >= images.length - 3
      }"
    />
  </div>

  <ImagePreview
      :images="images"
      :startIndex="previewIndex"
      @close="previewIndex = null"
  />
</template>

<style scoped>
.images-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.image-item {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.03);
}
</style>
