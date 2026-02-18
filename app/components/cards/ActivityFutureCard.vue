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

      <div class="activity-prices">
        <div class="price-item">
          <span>Afiliados</span>
          <strong>{{ activity.affiliatePrice }}EUR</strong>
        </div>
        <div class="price-item" v-if="activity.noAffiliatePrice != null">
          <span>No afiliados</span>
          <strong>{{ activity.noAffiliatePrice }}EUR</strong>
        </div>
      </div>
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

.activity-prices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.price-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 640px) {
  .activity-prices {
    grid-template-columns: 1fr;
  }
}
</style>
