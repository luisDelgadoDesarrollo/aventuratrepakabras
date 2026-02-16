<script setup lang="ts">
import { reactive, ref, watch } from "vue"
import { getContact, updateContact } from "~/composables/api/contactApi"
import type { ClubContactDto } from "~/types/contact"

definePageMeta({
  middleware: "auth"
})

const isSaving = ref(false)
const saveError = ref("")
const saveSuccess = ref("")

const form = reactive({
  clubId: null as number | null,
  contactEmail: "",
  phone: ""
})

const { data: contact, pending, error, refresh } = await useAsyncData<ClubContactDto>(
  "admin-contact",
  () => getContact()
)

watch(
  contact,
  (value) => {
    if (!value) return
    form.clubId = value.clubId ?? null
    form.contactEmail = value.contactEmail ?? ""
    form.phone = value.phone ?? value.phoneNumber ?? ""
  },
  { immediate: true }
)

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string) {
  return /^(?:$|\+?[1-9]\d{7,14}(?:\s?(?:ext\.?|x|#)\s?\d{1,5})?)$/.test(phone)
}

async function saveContact() {
  if (isSaving.value) return

  const cleanEmail = form.contactEmail.trim()
  const cleanPhone = form.phone.trim()

  saveError.value = ""
  saveSuccess.value = ""

  if (!cleanEmail) {
    saveError.value = "El email de contacto es obligatorio."
    return
  }

  if (!validateEmail(cleanEmail)) {
    saveError.value = "El email de contacto no es valido."
    return
  }

  if (!validatePhone(cleanPhone)) {
    saveError.value = "El telefono debe ser valido y la extension (si existe) debe tener 1 a 5 digitos."
    return
  }

  isSaving.value = true
  try {
    await updateContact({
      clubId: form.clubId ?? undefined,
      contactEmail: cleanEmail,
      phone: cleanPhone
    })

    saveSuccess.value = "Contacto actualizado correctamente."
    await refresh()
  } catch (err) {
    console.error("Error actualizando contacto:", err)
    saveError.value = "No se pudo actualizar el contacto."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="contact-admin-page">
    <div class="page-header">
      <h1 class="page-title">Contacto</h1>
    </div>

    <div class="table-wrapper">
      <div class="contact-panel">
        <p v-if="pending">Cargando datos de contacto...</p>
        <p v-else-if="error">No se ha podido cargar el contacto del club.</p>
        <form v-else class="contact-form" @submit.prevent="saveContact">
          <div class="field">
            <label for="contact-email">Email de contacto</label>
            <input
              id="contact-email"
              v-model="form.contactEmail"
              type="email"
              placeholder="correo@club.com"
              autocomplete="email"
            />
          </div>

          <div class="field">
            <label for="contact-phone">Telefono</label>
            <input
              id="contact-phone"
              v-model="form.phone"
              type="tel"
              placeholder="+34 600 000 000"
              autocomplete="tel"
              pattern="^(?:$|\+?[1-9]\d{7,14}(?:\s?(?:ext\.?|x|#)\s?\d{1,5})?)$"
            />
          </div>

          <div class="actions">
            <button class="action-btn edit-new-btn save-btn" type="submit" :disabled="isSaving">
              {{ isSaving ? "Guardando..." : "Guardar contacto" }}
            </button>
          </div>

          <p v-if="saveError" class="status error">{{ saveError }}</p>
          <p v-if="saveSuccess" class="status success">{{ saveSuccess }}</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-admin-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.page-title {
  margin: 0;
  color: var(--color-primary);
}

.contact-panel {
  padding: 1rem;
}

.contact-form {
  display: grid;
  gap: 1rem;
  max-width: 640px;
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field label {
  font-weight: 600;
  color: #0f172a;
}

.field input {
  border: 1px solid #d1d5db;
  border-radius: var(--radius-md);
  padding: 0.7rem 0.8rem;
  font-size: 0.95rem;
}

.field input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.actions {
  padding-top: 0.2rem;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.status {
  margin: 0;
  font-size: 0.95rem;
}

.status.error {
  color: #dc2626;
}

.status.success {
  color: #16a34a;
}
</style>
