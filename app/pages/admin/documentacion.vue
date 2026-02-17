<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue"
import PdfFileInput from "~/components/forms/PdfFileInput.vue"
import { getDoc, saveDoc } from "~/composables/api/docApi"
import { PdfType } from "~/types/pdf"

definePageMeta({
  middleware: "auth"
})

const selectedType = ref<PdfType>(PdfType.BY_LAWS)
const selectedFile = ref<File | null>(null)
const isSaving = ref(false)
const saveError = ref("")
const saveSuccess = ref("")
const isCheckingDoc = ref(false)
const checkDocError = ref("")
const existingDocUrl = ref<string | null>(null)
const hasExistingDoc = ref(false)
const config = useRuntimeConfig()

const typeOptions = computed(() => [
  { label: "Estatutos", value: PdfType.BY_LAWS },
  { label: "Plan de igualdad", value: PdfType.EQUALITY_PLAN },
  { label: "Alta de socios", value: PdfType.MEMBERSHIP_SIGNUP },
  { label: "Solicitud federativa", value: PdfType.FEDERATION_APPLICATION }
])

const downloadFileName = computed(() => `${selectedType.value}_${config.public.clubSlug}.pdf`)

function revokeExistingDocUrl() {
  if (!existingDocUrl.value) return
  URL.revokeObjectURL(existingDocUrl.value)
  existingDocUrl.value = null
}

async function checkExistingDoc() {
  if (!import.meta.client) return

  isCheckingDoc.value = true
  checkDocError.value = ""
  hasExistingDoc.value = false
  revokeExistingDocUrl()

  try {
    const blob = await getDoc(selectedType.value)
    existingDocUrl.value = URL.createObjectURL(blob)
    hasExistingDoc.value = true
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status
    if (status !== 404) {
      console.error("Error cargando documento actual:", error)
      checkDocError.value = "No se ha podido comprobar el documento actual."
    }
  } finally {
    isCheckingDoc.value = false
  }
}

watch(selectedType, () => {
  checkExistingDoc()
}, { immediate: true })

onBeforeUnmount(() => {
  revokeExistingDocUrl()
})

async function handleSave() {
  if (isSaving.value) return
  saveError.value = ""
  saveSuccess.value = ""

  if (!selectedFile.value) {
    saveError.value = "Selecciona un archivo PDF."
    return
  }

  isSaving.value = true
  try {
    await saveDoc(selectedFile.value, selectedType.value)
    saveSuccess.value = "Documento guardado correctamente."
    selectedFile.value = null
    await checkExistingDoc()
  } catch (error) {
    console.error("Error guardando documento:", error)
    saveError.value = "No se pudo guardar el documento."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="doc-admin-page">
    <div class="page-header">
      <h1 class="page-title">Documentacion</h1>
    </div>

    <div class="table-wrapper">
      <form class="doc-form" @submit.prevent="handleSave">
        <div class="form-group">
          <label for="pdf-type">Tipo de documento</label>
          <select id="pdf-type" v-model="selectedType">
            <option v-for="option in typeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="existing-doc-box">
          <p v-if="isCheckingDoc" class="status">Comprobando documento actual...</p>
          <p v-else-if="hasExistingDoc" class="status info">
            Ya existe un PDF para este tipo.
            <a :href="existingDocUrl ?? '#'" :download="downloadFileName">Descargar</a>
          </p>
          <p v-else class="status">No hay documento subido para este tipo.</p>
          <p v-if="checkDocError" class="status error">{{ checkDocError }}</p>
        </div>

        <PdfFileInput v-model="selectedFile" />

        <p v-if="hasExistingDoc && selectedFile" class="status warn">
          Al subir este archivo, se sobrescribira el PDF actual de este tipo.
        </p>

        <div class="form-actions">
          <button type="submit" class="action-btn edit-new-btn" :disabled="isSaving">
            {{ isSaving ? "Guardando..." : "Subir PDF" }}
          </button>
        </div>

        <p v-if="saveError" class="status error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="status success">{{ saveSuccess }}</p>
      </form>
    </div>

  </section>
</template>

<style scoped>
.doc-admin-page {
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

.doc-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  max-width: 760px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group select {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.95rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.existing-doc-box {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #f8fafc;
  padding: 0.75rem;
}

.status {
  margin: 0;
}

.status.info a {
  font-weight: 600;
}

.status.warn {
  color: #b45309;
}

.status.error {
  color: #b91c1c;
}

.status.success {
  color: #15803d;
}
</style>
