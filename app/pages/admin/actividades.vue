<script setup lang="ts">
import { ref } from "vue"
import { deleteActivity, getActivities, getActivity } from "~/composables/api/activitiesApi"
import type { ActivityResponseDto } from "~/types/activities"
import { formatDate } from "compatx"
import BaseDialog from "~/components/BaseDialog.vue"
import ActivityCard from "~/components/cards/ActivityCard.vue"
import ActivityForm from "~/components/forms/activityForm.vue"

definePageMeta({
  middleware: "auth"
})

const selectedActivity = ref<ActivityResponseDto | null>(null)
const editActivity = ref<ActivityResponseDto | null>(null)
const viewModal = ref(false)
const createModal = ref(false)
const isLoadingEdit = ref(false)

function openView(item: ActivityResponseDto) {
  selectedActivity.value = item
  viewModal.value = true
}

function openCreate() {
  editActivity.value = null
  createModal.value = true
}

async function openEdit(item: ActivityResponseDto) {
  isLoadingEdit.value = true
  try {
    const fullActivity = await getActivity(item.slug)
    editActivity.value = fullActivity
    createModal.value = true
  } catch (error) {
    console.error("Error cargando actividad completa:", error)
  } finally {
    isLoadingEdit.value = false
  }
}

function handleSaved() {
  refresh()
}

const { data, refresh } = await useAsyncData<ActivityResponseDto[]>(
  "admin-activities",
  () => getActivities({ page: 0, size: 100 })
)

async function handleDelete(item: ActivityResponseDto) {
  if (!confirm("Seguro que quieres borrar esta actividad?")) return
  try {
    await deleteActivity(item.slug)
    await refresh()
  } catch (error) {
    console.error("Error borrando actividad:", error)
  }
}

function getActivityTableId(item: ActivityResponseDto) {
  return item.activityId ?? item.slug
}
</script>

<template>
  <div class="admin-page-header">
    <h1 class="admin-page-title">Actividades</h1>
    <div class="admin-header-actions">
      <button class="primary-btn edit-new-btn" @click="openCreate">
        + Nueva actividad
      </button>
    </div>
  </div>

  <div v-if="data" class="table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Titulo</th>
          <th>Fecha inicio</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in data" :key="item.slug">
          <td>{{ getActivityTableId(item) }}</td>
          <td>{{ item.title }}</td>
          <td>{{ formatDate(item.startDate) }}</td>

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
  </div>

  <BaseDialog v-model="viewModal">
    <ActivityCard v-if="selectedActivity" :activity="selectedActivity" />
  </BaseDialog>

  <ActivityForm
    v-model="createModal"
    :mode="editActivity ? 'edit' : 'create'"
    :activity="editActivity"
    @saved="handleSaved"
  />
</template>
