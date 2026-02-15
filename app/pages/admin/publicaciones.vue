<script setup lang="ts">
import { ref } from "vue"
import { deletePublication, getPublications } from "~/composables/api/publicationsApi"
import type { PublicationResponseDto } from "~/types/publications"
import type { PageResponse } from "~/types/page"
import { formatDate } from "compatx"
import { usePagination } from "~/composables/utils/usePagination"
import PublicationCard from "~/components/cards/PublicationCard.vue"
import BaseDialog from "~/components/BaseDialog.vue";
import PublicationForm from "~/components/forms/publicationForm.vue"

const { pageSize, currentPage, next, prev } = usePagination(10)

const selectedPublication = ref<PublicationResponseDto | null>(null)
const editPublication = ref<PublicationResponseDto | null>(null)
const viewModal = ref(false)
const createModal = ref(false)

function openView(item: PublicationResponseDto) {
  selectedPublication.value = item
  viewModal.value = true
}

function openCreate() {
  editPublication.value = null
  createModal.value = true
}

function openEdit(item: PublicationResponseDto) {
  editPublication.value = item
  createModal.value = true
}

function handleSaved() {
  refresh()
}

const { data, refresh } = await useAsyncData<PageResponse<PublicationResponseDto>>(
    "publications",
    () => getPublications(currentPage.value, pageSize.value),
    { watch: [currentPage] }
)


async function handleDelete(item: PublicationResponseDto) {
  if (!confirm("¿Seguro que quieres borrar esta publicación?")) return
  try {
    await deletePublication(item.slug)

    // refrescar tabla
    refresh()

  } catch (error) {
    console.error("Error borrando:", error)
  }
}

</script>

<template>
  <div class="page-header">
    <h1 class="page-title">Publicaciones</h1>
    <div class="header-actions">
    <button class="primary-btn edit-new-btn" @click="openCreate">
      + Nueva publicación
    </button>
    </div>
  </div>
  <div class="table-wrapper" v-if="data">

    <table class="admin-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>Título</th>
        <th>Fecha</th>
        <th>Acciones</th>
      </tr>
      </thead>

      <tbody>
      <tr
          v-for="item in data.content"
          :key="item.publicationId"
      >
        <td>{{ item.publicationId }}</td>
        <td>{{ item.title }}</td>
        <td>{{ formatDate(item.createdAt) }}</td>

        <td class="actions-cell">
          <button
              class="action-btn view-btn"
              @click="openView(item)"
          >
            👁 Ver
          </button>

          <button
              class="action-btn edit-new-btn"
              @click="openEdit(item)"
          >
            ✏️ Editar
          </button>

          <button
              class="action-btn delete-btn"
              @click="handleDelete(item)"
          >
            🗑 Borrar
          </button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- PAGINACIÓN -->
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

  <BaseDialog v-model="viewModal">
    <PublicationCard
        v-if="selectedPublication"
        :publication="selectedPublication"
    />
  </BaseDialog>
  <PublicationForm
      v-model="createModal"
      :mode="editPublication ? 'edit' : 'create'"
      :publication="editPublication"
      @saved="handleSaved"
  />
</template>


<style scoped>
.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  justify-self: end;
}


.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  align-items: center;
}

</style>
