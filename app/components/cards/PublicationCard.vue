<script setup lang="ts">
import CardBase from "~/components/cards/CardBase.vue";
import type { PublicationResponseDto } from "~/types/publications";

defineProps<{
  publication: PublicationResponseDto,
  title?: string
  collapsible?: boolean
}>()
</script>

<template>
  <CardBase :collapsible="collapsible">
    <h1 class="card-title">
      {{ title || publication.title }}
    </h1>

    <div v-if="publication">
      <p>{{ publication.text }}</p>

      <div v-if="publication.links.length > 0">
        <div class="links-header">
          <h3 class="card-section-title">Enlaces de interés</h3>
        </div>

        <div v-for="link in publication.links" :key="link.linkId">
          <a
              :href="link.link"
              target="_blank"
              rel="noopener noreferrer"
              class="card-link"
          >
            {{ link.title }}
          </a>
        </div>
      </div>

      <div class="us-images">
        <ImageGallery :images="publication.imagesPath" />
      </div>
    </div>
  </CardBase>
</template>

<style scoped>
.links-header {
  text-align: center;
  margin-bottom: 2rem;
}

.us-images {
  margin-top: 2rem;
}
</style>
