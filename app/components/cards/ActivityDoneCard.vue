<script setup lang="ts">
import type { ActivityResponseDto } from "~/types/activities";
import CardBase from "~/components/cards/CardBase.vue";
import { formatDate } from "compatx";

defineProps<{
  activity: ActivityResponseDto,
  title?: string,
}>()
</script>

<template>
  <CardBase>
    <div v-if="activity" class="activity-card">

      <h1 class="card-title">
        {{ title || activity.title }}
      </h1>

      <p class="activity-description">
        {{ activity.description }}
      </p>

      <div class="activity-dates">
        📅 {{ formatDate(activity.startDate) }} -
        {{ formatDate(activity.endDate) }}
      </div>

      <div class="images-grid">
        <ImageGallery :images="activity.imagesPath" />
      </div>

    </div>
  </CardBase>
</template>

<style scoped>
.activity-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-description {
  line-height: 1.7;
  font-size: 1.05rem;
  margin: 0;
}

.activity-dates {
  font-weight: 500;
  color: var(--color-text);
}

.images-grid {
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .activity-card {
    gap: 1.2rem;
  }
}
</style>
