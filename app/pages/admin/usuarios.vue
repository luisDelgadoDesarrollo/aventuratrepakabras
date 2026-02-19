<script setup lang="ts">
import { deleteClubUser, getClubUsers } from "~/composables/api/usersApi"
import ClubUserForm from "~/components/forms/clubUserForm.vue"
import { usePagination } from "~/composables/utils/usePagination"
import type { ClubUserDto } from "~/types/users"
import type { PageResponse } from "~/types/page"
import { useCrudDialogs } from "~/composables/admin/useCrudDialogs"
import AdminPagination from "~/components/admin/AdminPagination.vue"

definePageMeta({
  middleware: "auth"
})

const { pageSize, currentPage, next, prev } = usePagination(10)

const {
  editItem: editUser,
  createModal,
  isLoadingEdit,
  openCreate,
  openEdit
} = useCrudDialogs<ClubUserDto>({
  cloneForEdit(item) {
    return { ...item }
  }
})

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
console.log(data)

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
          <th>N. federado</th>
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
          <td>{{ item.federatedNumber || "-" }}</td>
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

    <AdminPagination
      :current-page="currentPage"
      :total-pages="data.totalPages"
      @prev="prev"
      @next="next"
    />
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
