<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (event: "prev"): void
  (event: "next", totalPages: number): void
}>()
</script>

<template>
  <div class="pagination">
    <button @click="emit('prev')" :disabled="props.currentPage === 0">
      &lt;
    </button>

    <span>
      Pagina {{ props.currentPage + 1 }} de {{ props.totalPages }}
    </span>

    <button
      @click="emit('next', props.totalPages)"
      :disabled="props.currentPage >= props.totalPages - 1"
    >
      &gt;
    </button>
  </div>
</template>
