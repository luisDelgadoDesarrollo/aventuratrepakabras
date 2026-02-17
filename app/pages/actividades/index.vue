<script setup lang="ts">
import { computed } from "vue"
import { getActivityYears } from "~/composables/api/activitiesApi"

const { data, pending, error } = await useAsyncData<number[]>(
  "activity-years",
  () => getActivityYears()
)

const years = computed(() => (data.value ?? []).slice().sort((a, b) => b - a))
</script>

<template>
  <section class="activities-years-page">
    <header class="page-header">
      <h1>Anios de las actividades</h1>
      <p>Selecciona un anio para ver las actividades publicadas.</p>
    </header>

    <p v-if="pending" class="info-text">Cargando anios...</p>
    <p v-else-if="error" class="error-text">No se han podido cargar los anios.</p>
    <p v-else-if="years.length === 0" class="info-text">Aun no hay actividades publicadas.</p>

    <div v-else class="years-grid">
      <NuxtLink v-for="year in years" :key="year" :to="`/actividades/${year}`" class="year-card">
        <span class="year-value">{{ year }}</span>
        <span class="year-action">Ver actividades</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.activities-years-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.page-header h1 {
  margin: 0;
  color: var(--color-primary);
}

.page-header p {
  margin: 0.4rem 0 0;
  color: var(--color-text-secondary);
}

.info-text {
  margin: 0;
  color: var(--color-text-secondary);
}

.error-text {
  margin: 0;
  color: #b91c1c;
}

.years-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.year-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  text-decoration: none;
  color: inherit;
}

.year-card:hover {
  border-color: var(--color-primary);
}

.year-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-primary);
}

.year-action {
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .years-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .years-grid {
    grid-template-columns: 1fr;
  }
}
</style>
