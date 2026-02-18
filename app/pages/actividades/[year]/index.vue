<script setup lang="ts">
import { computed } from "vue"
import { getActivitiesByYear } from "~/composables/api/activitiesApi"
import type { ActivityResponseDto } from "~/types/activities"
import ActivityFutureCard from "~/components/cards/ActivityFutureCard.vue"
import DoneActivityCard from "~/components/cards/DoneActivityCard.vue"

const route = useRoute()

const year = computed(() => String(route.params.year ?? ""))

const { data, pending, error } = await useAsyncData<ActivityResponseDto[]>(
  () => `activities-year-${year.value}`,
  () => getActivitiesByYear(year.value),
  { watch: [year] }
)

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
]

function toDate(value?: string) {
  if (!value) return null
  return new Date(value.replace(" ", "T"))
}

function timeOrder(activity: ActivityResponseDto) {
  const date = toDate(activity.startDate)
  return date ? date.getTime() : 0
}

const monthGroups = computed(() =>
  monthNames.map((name, monthIndex) => {
    const activities = (data.value ?? [])
      .filter((activity) => {
        const date = toDate(activity.startDate)
        return date ? date.getMonth() === monthIndex : false
      })
      .sort((a, b) => timeOrder(a) - timeOrder(b))

    return {
      monthIndex,
      monthName: name,
      activities
    }
  })
)

function isDone(activity: ActivityResponseDto) {
  const date = toDate(activity.endDate ?? activity.startDate)
  if (!date) return false
  return date.getTime() < Date.now()
}
</script>

<template>
  <section class="activities-year-page">
    <header class="page-header">
      <h1>Actividades del {{ year }}</h1>
    </header>

    <p v-if="pending" class="info-text">Cargando actividades...</p>
    <p v-else-if="error" class="error-text">No se han podido cargar las actividades.</p>
    <p v-else-if="(data ?? []).length === 0" class="info-text">No hay actividades para este anio.</p>

    <div v-else class="months-list">
      <section v-for="group in monthGroups" :key="group.monthIndex" class="month-section">
        <h2 class="month-title">{{ group.monthName }}</h2>

        <div v-if="group.activities.length > 0" class="activities-grid">
          <NuxtLink
            v-for="activity in group.activities"
            :key="activity.slug"
            :to="`/actividades/${year}/${activity.slug}`"
            class="activity-link"
          >
            <component
              :is="isDone(activity) ? DoneActivityCard : ActivityFutureCard"
              :activity="activity"
            />
          </NuxtLink>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.activities-year-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.page-header h1 {
  margin: 0;
  color: var(--color-primary);
}

.info-text {
  margin: 0;
  color: var(--color-text-secondary);
}

.error-text {
  margin: 0;
  color: #b91c1c;
}

.months-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.month-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.month-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.15rem;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.activity-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

@media (max-width: 900px) {
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
