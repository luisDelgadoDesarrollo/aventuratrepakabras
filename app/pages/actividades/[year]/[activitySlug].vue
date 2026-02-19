<script setup lang="ts">
import { formatDate } from "compatx"
import { getActivity } from "~/composables/api/activitiesApi"
import type { ActivityResponseDto } from "~/types/activities"
import ActivityRegistrationForm from "~/components/forms/ActivityRegistrationForm.vue"

const route = useRoute()
const config = useRuntimeConfig()
const signupModal = ref(false)
const signupStatus = ref("")

const activitySlug = computed(() => String(route.params.activitySlug ?? ""))
const clubSlug = computed(() => String(config.public.clubSlug ?? ""))

const { data: activity, pending, error } = await useAsyncData<ActivityResponseDto>(
  () => `activity-${activitySlug.value}`,
  () => getActivity(activitySlug.value),
  { watch: [activitySlug] }
)

function toDate(value?: string) {
  if (!value) return null
  return new Date(value.replace(" ", "T"))
}

const canSignUp = computed(() => {
  if (!activity.value) return false
  const start = toDate(activity.value.startDate)
  if (!start) return false
  return start.getTime() > Date.now()
})

function openSignupModal() {
  signupStatus.value = ""
  signupModal.value = true
}

function onSignupSubmitted() {
  signupStatus.value = "Tu solicitud se ha enviado. Revisa tu email por si te contactamos."
}
</script>

<template>
  <section class="activity-detail-page">
    <p v-if="pending" class="info-text">Cargando actividad...</p>
    <p v-else-if="error" class="error-text">No se ha podido cargar la actividad.</p>

    <article v-else-if="activity" class="activity-card">
      <header class="activity-header">
        <h1>{{ activity.title }}</h1>
        <p class="activity-dates">
          {{ formatDate(activity.startDate) }} - {{ formatDate(activity.endDate ?? activity.startDate) }}
        </p>
      </header>

      <p v-if="activity.description" class="activity-description">
        {{ activity.description }}
      </p>

      <div class="prices-grid">
        <div class="price-box">
          <span>Precio afiliados</span>
          <strong>{{ activity.affiliatePrice }}EUR</strong>
        </div>
        <div class="price-box" v-if="activity.noAffiliatePrice != null">
          <span>Precio no afiliados</span>
          <strong>{{ activity.noAffiliatePrice }}EUR</strong>
        </div>
      </div>

      <div class="images-block" v-if="activity.imagesPath.length > 0">
        <h2>Imagenes</h2>
        <ImageGallery :images="activity.imagesPath" />
      </div>

      <p v-if="signupStatus" class="signup-success">{{ signupStatus }}</p>

      <button
        v-if="canSignUp"
        type="button"
        class="signup-btn"
        @click="openSignupModal"
      >
        Apuntarse a la actividad
      </button>
    </article>

    <ActivityRegistrationForm
      v-model="signupModal"
      :club-slug="clubSlug"
      :activity-slug="activitySlug"
      :activity-title="activity?.title"
      @submitted="onSignupSubmitted"
    />
  </section>
</template>

<style scoped>
.activity-detail-page {
  padding: 1rem 0;
}

.info-text {
  margin: 0;
  color: var(--color-text-secondary);
}

.error-text {
  margin: 0;
  color: #b91c1c;
}

.activity-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  padding: 1.25rem;
}

.activity-header h1 {
  margin: 0;
  color: var(--color-primary);
}

.activity-dates {
  margin: 0.45rem 0 0;
  color: var(--color-text-secondary);
}

.activity-description {
  margin: 0;
  line-height: 1.5;
}

.prices-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.price-box {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.images-block {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.images-block h2 {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.signup-btn {
  justify-self: start;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.signup-success {
  margin: 0;
  color: #047857;
  font-weight: 600;
}

@media (max-width: 768px) {
  .prices-grid {
    grid-template-columns: 1fr;
  }
}
</style>
