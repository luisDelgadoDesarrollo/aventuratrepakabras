<script setup lang="ts">
import type { UsResponseDto } from '~/types/club'
import CardBase from "~/components/cards/CardBase.vue";

defineProps<{
  us: UsResponseDto
}>()
</script>

<template>
  <CardBase>
    <h1 class="card-title">Nosotros</h1>
    <div class="section-divider"></div>

    <div class="us-content">
      <div class="us-text">
        <p>{{ us.text }}</p>
      </div>

      <div class="us-images">
        <ImageGallery :images="us.images" />
      </div>
    </div>
  </CardBase>
</template>

<style scoped>
.us-content {
  display: flex;
  gap: 3rem;
  align-items: center;
}

.us-text {
  flex: 1;
  line-height: 1.7;
  font-size: 1.05rem;
}

.us-text p {
  white-space: pre-line;
}

.us-images {
  flex: 1;
}

@media (max-width: 768px) {
  .us-content {
    flex-direction: column;
  }
}
</style>
