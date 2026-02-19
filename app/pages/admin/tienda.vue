<script setup lang="ts">
import { computed } from "vue"
import ArticleForm from "~/components/forms/articleForm.vue"
import {deleteArticle, getArticle, getArticles} from "~/composables/api/articlesApi"
import {usePagination} from "~/composables/utils/usePagination"
import type {ArticleDto} from "~/types/articles"
import type {PageResponse} from "~/types/page"
import { useCrudDialogs } from "~/composables/admin/useCrudDialogs"
import AdminPagination from "~/components/admin/AdminPagination.vue"

definePageMeta({
  middleware: "auth"
})

const { pageSize, currentPage, next, prev } = usePagination(10)

const {
  editItem: editArticle,
  createModal,
  isLoadingEdit,
  openCreate,
  openEdit
} = useCrudDialogs<ArticleDto>({
  async loadForEdit(item) {
    return await getArticle(item.slug)
  },
  onEditError(editError) {
    console.error("Error cargando articulo completo:", editError)
  }
})

const { data, pending, error, refresh } = await useAsyncData<PageResponse<ArticleDto>>(
  "admin-articles",
  () => getArticles(currentPage.value, pageSize.value),
  {
    watch: [currentPage],
    server: false,
    default: () => ({
      content: [],
      totalElements: 0,
      totalPages: 1,
      number: 0,
      size: pageSize.value
    })
  }
)

const totalVariants = computed(() =>
  (data.value?.content ?? []).reduce((sum, article) => sum + (article.variants?.length ?? 0), 0)
)

function handleSaved() {
  refresh()
}

async function handleDelete(item: ArticleDto) {
  if (!confirm(`Seguro que quieres borrar el articulo ${item.title}?`)) return

  try {
    await deleteArticle(item.slug)
    await refresh()
  } catch (deleteError) {
    console.error("Error borrando articulo:", deleteError)
  }
}
</script>

<template>
  <section class="shop-admin-page">
    <div class="admin-page-header">
      <h1 class="admin-page-title">Tienda</h1>
      <div class="admin-header-actions">
        <button class="primary-btn edit-new-btn" @click="openCreate">
          + Nuevo articulo
        </button>
      </div>
    </div>

    <p class="shop-summary">
      Articulos pagina: {{ data.content.length }} | Variantes pagina: {{ totalVariants }}
    </p>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Titulo</th>
          <th>Descripcion</th>
          <th>Imagenes</th>
          <th>Variantes</th>
          <th>Acciones</th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="pending">
          <td colspan="6">Cargando articulos...</td>
        </tr>

        <tr v-else-if="error">
          <td colspan="6">No se pudieron cargar los articulos.</td>
        </tr>

        <tr v-else-if="data.content.length === 0">
          <td colspan="6">No hay articulos en tienda.</td>
        </tr>

        <template v-else>
          <template v-for="article in data.content" :key="article.articleId">
            <tr>
              <td>{{ article.articleId }}</td>
              <td>{{ article.title }}</td>
              <td>{{ article.description || "-" }}</td>
              <td>{{ article.imagePath?.length || 0 }}</td>
              <td>{{ article.variants?.length || 0 }}</td>
              <td class="actions-cell">
                <button
                  class="action-btn edit-new-btn"
                  :disabled="isLoadingEdit"
                  @click="openEdit(article)"
                >
                  {{ isLoadingEdit ? "Cargando..." : "Editar" }}
                </button>

                <button class="action-btn delete-btn" @click="handleDelete(article)">
                  Borrar
                </button>
              </td>
            </tr>

            <tr class="variant-row">
              <td colspan="6">
                <table class="admin-table variant-table">
                  <thead>
                  <tr>
                    <th>ID Variante</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th>Stock</th>
                    <th>Imagenes</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="!article.variants || article.variants.length === 0">
                    <td colspan="5">Sin variantes para este articulo.</td>
                  </tr>
                  <template v-else>
                    <tr
                      v-for="variant in article.variants"
                      :key="variant.articleVariantId"
                    >
                      <td>{{ variant.articleVariantId }}</td>
                      <td>{{ variant.size }}</td>
                      <td>{{ variant.color || "-" }}</td>
                      <td>{{ variant.stock ?? "-" }}</td>
                      <td>{{ variant.images?.length || 0 }}</td>
                    </tr>
                  </template>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
        </template>
        </tbody>
      </table>

      <AdminPagination
        :current-page="currentPage"
        :total-pages="data.totalPages"
        @prev="prev"
        @next="next"
      />
    </div>

    <ArticleForm
      v-model="createModal"
      :mode="editArticle ? 'edit' : 'create'"
      :article="editArticle"
      @saved="handleSaved"
    />
  </section>
</template>

<style scoped>
.shop-admin-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.shop-summary {
  margin: 0;
  color: #334155;
}

.variant-row td {
  background: #f8fafc;
  padding-top: 0;
}

.variant-table {
  margin-top: 0.5rem;
  border: 1px solid #e2e8f0;
}

.variant-table th,
.variant-table td {
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
}
</style>
