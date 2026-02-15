<script setup lang="ts">
import { computed } from "vue"
import { getPublication } from "~/composables/api/publicationsApi"
import type { PublicationResponseDto } from "~/types/publications"
import PublicationCard from "~/components/cards/PublicationCard.vue"

const route = useRoute()

const publicationSlug = computed(() => {
  return String(route.params.publicationSlug ?? "")
})

const { data: publication, pending, error } = await useAsyncData<PublicationResponseDto>(
    () => getPublication(publicationSlug.value),
    {
      watch: [publicationSlug]
    }
)
</script>

<template>
  <section class="publication-page">
    <p v-if="pending">Cargando publicación...</p>

    <p v-else-if="error">
      No se ha podido cargar la publicación.
    </p>

    <PublicationCard
        v-else-if="publication"
        :publication="publication"
        :collapsible="false"
    />
  </section>
</template>

<style scoped>
.publication-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
