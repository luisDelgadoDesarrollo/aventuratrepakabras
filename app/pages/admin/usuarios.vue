<script setup lang="ts">
import { ref } from "vue"
import { deleteClubUser, getClubUsers } from "~/composables/api/usersApi"
import ClubUserForm from "~/components/forms/clubUserForm.vue"
import { usePagination } from "~/composables/utils/usePagination"
import type { ClubUserDto } from "~/types/users"
import type { PageResponse } from "~/types/page"

definePageMeta({
  middleware: "auth"
})

const { pageSize, currentPage, next, prev } = usePagination(10)

const editUser = ref<ClubUserDto | null>(null)
const createModal = ref(false)
const isLoadingEdit = ref(false)

const { data, error, refresh } = await useAsyncData<PageResponse<ClubUserDto>>(
  "club-users",
  () => getClubUsers(currentPage.value, pageSize.value),
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

function openCreate() {
  editUser.value = null
  createModal.value = true
}

async function openEdit(item: ClubUserDto) {
  isLoadingEdit.value = true
  try {
    editUser.value = { ...item }
    createModal.value = true
  } finally {
    isLoadingEdit.value = false
  }
}

function handleSaved() {
  refresh()
}

async function handleDelete(item: ClubUserDto) {
  if (!confirm(`Seguro que quieres borrar al usuario ${item.email}?`)) return
  try {
    await deleteClubUser(item.email)
    await refresh()
  } catch (error) {
    console.error("Error borrando usuario:", error)
  }
}

function getUserTableId(item: ClubUserDto) {
  return item.email
}
</script>

<template>
  <div class="admin-page-header">
    <h1 class="admin-page-title">Usuarios</h1>
    <div class="admin-header-actions">
      <button class="primary-btn edit-new-btn" @click="openCreate">
        + Nuevo usuario
      </button>
    </div>
  </div>

  <p v-if="error" class="users-error">
    No se pudo cargar la lista de usuarios.
  </p>

  <div v-if="data" class="table-wrapper">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>NIF</th>
          <th>Telefono</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in data.content" :key="getUserTableId(item)">
          <td>{{ item.email }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.surname }}</td>
          <td>{{ item.nif }}</td>
          <td>{{ item.phone }}</td>

          <td class="actions-cell">
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

    <div class="pagination">
      <button @click="prev()" :disabled="currentPage === 0">
        <
      </button>

      <span>
        Pagina {{ currentPage + 1 }} de {{ data.totalPages }}
      </span>

      <button @click="next(data.totalPages)" :disabled="currentPage >= data.totalPages - 1">
        >
      </button>
    </div>
  </div>

  <ClubUserForm
    v-model="createModal"
    :mode="editUser ? 'edit' : 'create'"
    :user="editUser"
    @saved="handleSaved"
  />
</template>

<style scoped>
.users-error {
  color: #b91c1c;
}
</style>
