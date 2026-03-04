<script setup lang="ts">
import { computed } from "vue"
import ArticleCard from "~/components/cards/ArticleCard.vue"
import { getArticle } from "~/composables/api/articlesApi"
import type { ArticleDto } from "~/types/articles"

const route = useRoute()

const articleSlug = computed(() => String(route.params.articleSlug ?? ""))

const { data: article, pending, error } = await useAsyncData<ArticleDto>(
  () => getArticle(articleSlug.value),
  {
    watch: [articleSlug]
  }
)
</script>

<template>
  <section class="article-page">
    <div class="top-actions">
      <NuxtLink to="/articulos" class="back-btn">Volver a articulos</NuxtLink>
    </div>

    <p v-if="pending">Cargando articulo...</p>

    <p v-else-if="error">
      No se ha podido cargar el articulo.
    </p>

    <ArticleCard
      v-else-if="article"
      :article="article"
      :collapsible="false"
      :show-variants="true"
    />
  </section>
</template>

<style scoped>
.article-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.top-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
