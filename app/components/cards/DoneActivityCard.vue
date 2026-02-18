<script setup lang="ts">
import type { ActivityResponseDto } from "~/types/activities"
import CardBase from "~/components/cards/CardBase.vue"
import { formatDate } from "compatx"

defineProps<{
  activity: ActivityResponseDto
}>()
</script>

<template>
  <CardBase>
    <article class="activity-card">
      <h2 class="activity-title">{{ activity.title }}</h2>
      <p class="activity-description">{{ activity.description }}</p>
      <p class="activity-dates">
        {{ formatDate(activity.startDate) }} - {{ formatDate(activity.endDate ?? activity.startDate) }}
      </p>
    </article>
  </CardBase>
</template>

<style scoped>
.activity-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-title {
  margin: 0;
}

.activity-description {
  margin: 0;
  color: var(--color-text);
}

.activity-dates {
  margin: 0;
  color: var(--color-text-secondary);
}
</style>
