<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import { createClubUser, updateClubUser } from "~/composables/api/usersApi"
import type { ClubUserDto, CreateClubUserDto } from "~/types/users"

const props = withDefaults(defineProps<{
  modelValue: boolean
  mode?: "create" | "edit"
  user?: ClubUserDto | null
}>(), {
  mode: "create",
  user: null
})

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "saved"): void
}>()

const form = reactive<CreateClubUserDto>({
  nif: "",
  name: "",
  surname: "",
  email: "",
  birthDate: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  homePhone: ""
})

const isSubmitting = ref(false)
const isEditMode = computed(() => props.mode === "edit")
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

function resetForm() {
  form.nif = ""
  form.name = ""
  form.surname = ""
  form.email = ""
  form.birthDate = ""
  form.address = ""
  form.city = ""
  form.state = ""
  form.postalCode = ""
  form.phone = ""
  form.homePhone = ""
}

function setFormFromUser(user: ClubUserDto) {
  form.nif = user.nif ?? ""
  form.name = user.name ?? ""
  form.surname = user.surname ?? ""
  form.email = user.email ?? ""
  form.birthDate = user.birthDate ?? ""
  form.address = user.address ?? ""
  form.city = user.city ?? ""
  form.state = user.state ?? ""
  form.postalCode = user.postalCode ?? ""
  form.phone = user.phone ?? ""
  form.homePhone = user.homePhone ?? ""
}

function close() {
  emit("update:modelValue", false)
}

async function handleSave() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const payload: CreateClubUserDto = {
      nif: form.nif.trim(),
      name: form.name.trim(),
      surname: form.surname.trim(),
      email: form.email.trim(),
      birthDate: form.birthDate,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      phone: form.phone.trim(),
      homePhone: form.homePhone.trim()
    }

    if (isEditMode.value && props.user) {
      await updateClubUser(props.user.email, payload)
    } else {
      await createClubUser(payload)
    }

    close()
    resetForm()
    emit("saved")
  } catch (error) {
    console.error("Error guardando usuario:", error)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (isEditMode.value && props.user) {
        setFormFromUser(props.user)
      } else {
        resetForm()
      }
    }

    if (!value) {
      resetForm()
    }
  }
)
</script>

<template>
  <BaseDialog v-model="isOpen">
    <div class="admin-dialog-header">
      <h2>{{ isEditMode ? "Editar usuario" : "Crear usuario" }}</h2>
    </div>

    <form class="admin-form user-form" @submit.prevent="handleSave">
      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="user-name">Nombre</label>
          <input id="user-name" v-model="form.name" type="text" required />
        </div>

        <div class="admin-form-group">
          <label for="user-surname">Apellidos</label>
          <input id="user-surname" v-model="form.surname" type="text" required />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="user-nif">NIF</label>
          <input id="user-nif" v-model="form.nif" type="text" required />
        </div>

        <div class="admin-form-group">
          <label for="user-birthdate">Fecha nacimiento</label>
          <input id="user-birthdate" v-model="form.birthDate" type="date" required />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="user-email">Email</label>
          <input id="user-email" v-model="form.email" type="email" required :disabled="isEditMode" />
        </div>

        <div class="admin-form-group">
          <label for="user-phone">Telefono</label>
          <input id="user-phone" v-model="form.phone" type="tel" required />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="user-home-phone">Telefono fijo</label>
          <input id="user-home-phone" v-model="form.homePhone" type="tel" />
        </div>

        <div class="admin-form-group">
          <label for="user-city">Ciudad</label>
          <input id="user-city" v-model="form.city" type="text" required />
        </div>
      </div>

      <div class="admin-form-row two-columns">
        <div class="admin-form-group">
          <label for="user-state">Provincia / Estado</label>
          <input id="user-state" v-model="form.state" type="text" required />
        </div>

        <div class="admin-form-group">
          <label for="user-postal-code">Codigo postal</label>
          <input id="user-postal-code" v-model="form.postalCode" type="text" required />
        </div>
      </div>

      <div class="admin-form-row">
        <div class="admin-form-group">
          <label for="user-address">Direccion</label>
          <input id="user-address" v-model="form.address" type="text" required />
        </div>
      </div>

      <div class="admin-form-actions">
        <button type="submit" class="primary-btn" :disabled="isSubmitting">
          {{ isEditMode ? "Guardar cambios" : "Guardar" }}
        </button>
        <button type="button" class="action-btn delete-btn" @click="close">
          Cancelar
        </button>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.user-form {
  gap: 1rem;
}
</style>
