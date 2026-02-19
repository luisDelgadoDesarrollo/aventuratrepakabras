<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import { sendActivityRegistration } from "~/composables/api/contactApi"
import type { ActivityRegistrationRequestDto } from "~/types/contact"

const props = withDefaults(defineProps<{
  modelValue: boolean
  clubSlug: string
  activitySlug: string
  activityTitle?: string
}>(), {
  activityTitle: ""
})

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "submitted"): void
}>()

const form = reactive<ActivityRegistrationRequestDto>({
  name: "",
  surname: "",
  nif: "",
  email: "",
  federateNumber: ""
})

const receipt = ref<File | null>(null)
const isSubmitting = ref(false)
const submitError = ref("")
const submitSuccess = ref("")

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

function resetForm() {
  form.name = ""
  form.surname = ""
  form.nif = ""
  form.email = ""
  form.federateNumber = ""
  receipt.value = null
}

function close() {
  emit("update:modelValue", false)
}

function onReceiptChange(event: Event) {
  const target = event.target as HTMLInputElement
  receipt.value = target.files?.[0] ?? null
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function handleSubmit() {
  if (isSubmitting.value) return

  const payload: ActivityRegistrationRequestDto = {
    name: form.name.trim(),
    surname: form.surname.trim(),
    nif: form.nif.trim(),
    email: form.email.trim(),
    federateNumber: form.federateNumber?.trim() || undefined
  }

  submitError.value = ""
  submitSuccess.value = ""

  if (!payload.name || !payload.surname || !payload.nif || !payload.email) {
    submitError.value = "Completa todos los campos obligatorios."
    return
  }

  if (!isValidEmail(payload.email)) {
    submitError.value = "Introduce un email valido."
    return
  }

  if (!receipt.value) {
    submitError.value = "Adjunta el justificante."
    return
  }

  isSubmitting.value = true
  try {
    await sendActivityRegistration(
      props.clubSlug,
      props.activitySlug,
      payload,
      receipt.value
    )

    submitSuccess.value = "Solicitud enviada correctamente."
    emit("submitted")
    close()
    resetForm()
  } catch (error) {
    console.error("Error enviando la solicitud de actividad:", error)
    submitError.value = "No se pudo enviar la solicitud. Intentalo de nuevo."
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      submitError.value = ""
      submitSuccess.value = ""
      return
    }
    submitError.value = ""
    submitSuccess.value = ""
  }
)
</script>

<template>
  <BaseDialog v-model="isOpen">
    <div class="signup-dialog-header">
      <h2>Apuntarse a la actividad</h2>
      <p v-if="activityTitle" class="signup-subtitle">{{ activityTitle }}</p>
    </div>

    <form class="signup-form" @submit.prevent="handleSubmit">
      <div class="signup-grid">
        <div class="form-group">
          <label for="activity-signup-name">Nombre</label>
          <input id="activity-signup-name" v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label for="activity-signup-surname">Apellidos</label>
          <input id="activity-signup-surname" v-model="form.surname" type="text" required />
        </div>
      </div>

      <div class="signup-grid">
        <div class="form-group">
          <label for="activity-signup-nif">NIF</label>
          <input id="activity-signup-nif" v-model="form.nif" type="text" required />
        </div>

        <div class="form-group">
          <label for="activity-signup-email">Email</label>
          <input id="activity-signup-email" v-model="form.email" type="email" required />
        </div>
      </div>

      <div class="form-group">
        <label for="activity-signup-federate">Numero federado (opcional)</label>
        <input id="activity-signup-federate" v-model="form.federateNumber" type="text" />
      </div>

      <div class="form-group">
        <label for="activity-signup-receipt">Justificante</label>
        <input id="activity-signup-receipt" type="file" @change="onReceiptChange" />
        <small>{{ receipt?.name ?? "Ningun archivo seleccionado" }}</small>
      </div>

      <p v-if="submitError" class="status error">{{ submitError }}</p>
      <p v-if="submitSuccess" class="status success">{{ submitSuccess }}</p>

      <div class="signup-actions">
        <button type="submit" class="primary-btn" :disabled="isSubmitting">
          {{ isSubmitting ? "Enviando..." : "Enviar solicitud" }}
        </button>
        <button type="button" class="action-btn delete-btn" @click="close">
          Cancelar
        </button>
      </div>
    </form>
  </BaseDialog>
</template>

<style scoped>
.signup-dialog-header {
  margin-bottom: 1rem;
}

.signup-dialog-header h2 {
  margin: 0;
}

.signup-subtitle {
  margin: 0.35rem 0 0;
  color: var(--color-text-secondary);
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.signup-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.65rem 0.75rem;
}

.form-group small {
  color: var(--color-text-secondary);
}

.status {
  margin: 0;
}

.status.error {
  color: #b91c1c;
}

.status.success {
  color: #047857;
}

.signup-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .signup-grid {
    grid-template-columns: 1fr;
  }
}
</style>
