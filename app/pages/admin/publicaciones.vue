<script setup lang="ts">
import { deletePublication, getPublication, getPublications } from "~/composables/api/publicationsApi"
import type { PublicationResponseDto } from "~/types/publications"
import type { PageResponse } from "~/types/page"
import { formatDate } from "compatx"
import { usePagination } from "~/composables/utils/usePagination"
import PublicationCard from "~/components/cards/PublicationCard.vue"
import BaseDialog from "~/components/BaseDialog.vue"
import PublicationForm from "~/components/forms/publicationForm.vue"
import { useCrudDialogs } from "~/composables/admin/useCrudDialogs"
import AdminPagination from "~/components/admin/AdminPagination.vue"

definePageMeta({
  middleware: "auth"
})

const { pageSize, currentPage, next, prev } = usePagination(10)

const {
  selectedItem: selectedPublication,
  editItem: editPublication,
  viewModal,
  createModal,
  isLoadingEdit,
  openView,
  openCreate,
  openEdit
} = useCrudDialogs<PublicationResponseDto>({
  async loadForEdit(item) {
    return await getPublication(item.slug)
  },
  onEditError(error) {
    console.error("Error cargando publicacion completa:", error)
  }
})

function handleSaved() {
  refresh()
}

const { data, refresh } = await useAsyncData<PageResponse<PublicationResponseDto>>(
  "publications",
  () => getPublications(currentPage.value, pageSize.value),
  { watch: [currentPage] }
)

async function handleDelete(item: PublicationResponseDto) {
  if (!confirm("Seguro que quieres borrar esta publicacion?")) return
  try {
    await deletePublication(item.slug)
    refresh()
  } catch (error) {
    console.error("Error borrando:", error)
  }
}
</script>

<template>
  <div class="admin-page-header">
    <h1 class="admin-page-title">Publicaciones</h1>
    <div class="admin-header-actions">
      <button class="primary-btn edit-new-btn" @click="openCreate">
        + Nueva publicacion
      </button>
    </div>
  </div>

  <div v-if="data" class="table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Titulo</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in data.content" :key="item.publicationId">
          <td>{{ item.publicationId }}</td>
          <td>{{ item.title }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>

          <td class="actions-cell">
            <button class="action-btn view-btn" @click="openView(item)">
              Ver
            </button>

            <button
              class="action-btn edit-new-btn"
              :disabled="isLoadingEdit"
              @click="openEdit(item)"
            >
              {{ isLoadingEdit ? "Cargando..." : "Editar" }}
            </button>

            <button class="action-btn delete-btn" @click="handleDelete(item)">
              Borrar
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <AdminPagination
      :current-page="currentPage"
      :total-pages="data.totalPages"
      @prev="prev"
      @next="next"
    />
  </div>

  <BaseDialog v-model="viewModal">
    <PublicationCard v-if="selectedPublication" :publication="selectedPublication" />
  </BaseDialog>

  <PublicationForm
    v-model="createModal"
    :mode="editPublication ? 'edit' : 'create'"
    :publication="editPublication"
    @saved="handleSaved"
  />
</template>
