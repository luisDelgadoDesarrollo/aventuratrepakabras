<script setup lang="ts">
import type { PublicationResponseDto } from "~/types/publications"
import type { PageResponse } from "~/types/page"
import { getPublications } from "~/composables/api/publicationsApi"
import { usePagination } from "~/composables/utils/usePagination"
import PublicationCard from "~/components/cards/PublicationCard.vue"

const { pageSize, currentPage, next, prev } = usePagination(5)

const { data } = await useAsyncData<PageResponse<PublicationResponseDto>>(
    "publications",
    () => getPublications(currentPage.value, pageSize.value),
    { watch: [currentPage] }
)

function scrollTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

</script>

<template>
  <div v-if="data" class="publications-container">

    <PublicationCard
        v-for="p in data.content"
        :key="p.publicationId"
        :publication="p"
    />

    <div class="pagination">
      <button
          @click="prev()"
          :disabled="currentPage === 0"
      >
        ←
      </button>

      <span>
        Página {{ currentPage + 1 }} de {{ data.totalPages }}
      </span>

      <button
          @click="next(data.totalPages)"
          :disabled="currentPage >= data.totalPages - 1"
      >
        →
      </button>
    </div>

  </div>
</template>

<style scoped>
.publications-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
  background: transparent;
}
</style>
