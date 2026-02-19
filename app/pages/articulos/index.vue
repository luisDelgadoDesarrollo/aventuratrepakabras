<script setup lang="ts">
import { computed } from "vue"
import ArticleCard from "~/components/cards/ArticleCard.vue"
import { getArticles } from "~/composables/api/articlesApi"
import { usePagination } from "~/composables/utils/usePagination"
import type { PageResponse } from "~/types/page"
import type { ArticleDto } from "~/types/articles"

const { pageSize, currentPage, next, prev } = usePagination(6)

const { data, pending, error } = await useAsyncData<PageResponse<ArticleDto>>(
  "articles",
  () => getArticles(currentPage.value, pageSize.value),
  {
    watch: [currentPage],
    default: () => ({
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: 0,
      size: pageSize.value
    })
  }
)

type PaginationItem = number | "ellipsis-left" | "ellipsis-right"

function scrollTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  })
}

function goToPage(page: number) {
  if (!data.value) return
  if (page < 1 || page > data.value.totalPages) return
  currentPage.value = page - 1
  scrollTop()
}

const paginationItems = computed<PaginationItem[]>(() => {
  if (!data.value) return []

  const total = data.value.totalPages
  const current = currentPage.value + 1
  const windowSize = 3

  if (total <= 1) return [1]

  const start = Math.max(1, current - windowSize)
  const end = Math.min(total, current + windowSize)
  const items: PaginationItem[] = [1]

  if (start > 2) {
    items.push("ellipsis-left")
  }

  for (let page = Math.max(2, start); page <= Math.min(total - 1, end); page++) {
    items.push(page)
  }

  if (end < total - 1) {
    items.push("ellipsis-right")
  }

  if (total > 1) {
    items.push(total)
  }

  return items
})
</script>

<template>
  <section class="articles-page">
    <h1 class="page-title">Articulos</h1>

    <p v-if="pending">Cargando articulos...</p>
    <p v-else-if="error">No se han podido cargar los articulos.</p>
    <p v-else-if="data.content.length === 0">Todavia no hay articulos publicados.</p>

    <div v-else class="articles-container">
      <NuxtLink
        v-for="article in data.content"
        :key="article.articleId"
        :to="`/articulos/${article.slug}`"
        class="article-link"
      >
        <ArticleCard :article="article" :collapsible="true" :show-variants="false" />
      </NuxtLink>

      <div class="pagination">
        <button
          @click="prev(); scrollTop()"
          :disabled="currentPage === 0"
        >
          <-
        </button>

        <span>
          Pagina {{ currentPage + 1 }} de {{ data.totalPages }}
        </span>

        <div class="pagination-pages">
          <template v-for="item in paginationItems" :key="item">
            <span v-if="typeof item !== 'number'" class="pagination-ellipsis">...</span>
            <button
              v-else
              class="page-btn"
              :class="{ active: currentPage + 1 === item }"
              @click="goToPage(item)"
            >
              {{ item }}
            </button>
          </template>
        </div>

        <button
          @click="next(data.totalPages); scrollTop()"
          :disabled="currentPage >= data.totalPages - 1"
        >
          ->
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.articles-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-title {
  margin: 0;
  color: var(--color-primary);
}

.articles-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.article-link {
  text-decoration: none;
  color: inherit;
}

.pagination {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0;
  background: transparent;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  min-width: 2rem;
  height: 2rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: white;
  color: var(--color-text);
  cursor: pointer;
}

.page-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.pagination-ellipsis {
  color: var(--color-placeholder);
  padding: 0 0.25rem;
}
</style>
