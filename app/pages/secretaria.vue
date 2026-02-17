<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue"
import { getDoc } from "~/composables/api/docApi"
import { PdfType } from "~/types/pdf"

interface DocumentCardItem {
  type: PdfType
  title: string
  description: string
}

const config = useRuntimeConfig()
const isLoadingDocuments = ref(true)
const isDownloading = ref<Record<PdfType, boolean>>({
  [PdfType.BY_LAWS]: false,
  [PdfType.EQUALITY_PLAN]: false,
  [PdfType.MEMBERSHIP_SIGNUP]: false,
  [PdfType.FEDERATION_APPLICATION]: false
})
const downloadError = ref("")
const documentsError = ref("")
const availableDocuments = ref<(DocumentCardItem & { url: string })[]>([])

const documents: DocumentCardItem[] = [
  {
    type: PdfType.BY_LAWS,
    title: "Estatutos del club",
    description: "Documento con la normativa interna, estructura y funcionamiento del club."
  },
  {
    type: PdfType.EQUALITY_PLAN,
    title: "Plan de igualdad",
    description: "Medidas y compromisos del club para promover la igualdad y la inclusión."
  },
  {
    type: PdfType.MEMBERSHIP_SIGNUP,
    title: "Alta de socios",
    description: "Formulario y condiciones para completar el proceso de alta como socio."
  },
  {
    type: PdfType.FEDERATION_APPLICATION,
    title: "Solicitud federativa",
    description: "Documento necesario para tramitar la solicitud de federación."
  }
].sort((a, b) => a.title.localeCompare(b.title, "es"))

function buildDownloadName(type: PdfType) {
  return `${type}_${config.public.clubSlug}.pdf`
}

async function downloadDocument(type: PdfType) {
  if (isDownloading.value[type]) return

  downloadError.value = ""
  isDownloading.value[type] = true

  try {
    const item = availableDocuments.value.find((entry) => entry.type === type)
    if (!item) return
    const link = document.createElement("a")
    link.href = item.url
    link.download = buildDownloadName(type)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode ?? error?.response?.status
    if (status === 404) {
      downloadError.value = "Este documento aun no esta disponible."
    } else {
      downloadError.value = "No se pudo descargar el documento. Intentalo de nuevo."
    }
  } finally {
    isDownloading.value[type] = false
  }
}

async function loadAvailableDocuments() {
  if (!import.meta.client) return

  isLoadingDocuments.value = true
  documentsError.value = ""
  downloadError.value = ""

  const found: (DocumentCardItem & { url: string })[] = []

  for (const document of documents) {
    try {
      const blob = await getDoc(document.type)
      found.push({
        ...document,
        url: URL.createObjectURL(blob)
      })
    } catch (error: any) {
      const status = error?.status ?? error?.statusCode ?? error?.response?.status
      if (status !== 404) {
        documentsError.value = "No se pudo comprobar toda la documentacion disponible."
      }
    }
  }

  availableDocuments.value = found
  isLoadingDocuments.value = false
}

onMounted(() => {
  loadAvailableDocuments()
})

onBeforeUnmount(() => {
  availableDocuments.value.forEach((document) => {
    URL.revokeObjectURL(document.url)
  })
})
</script>

<template>
  <section class="secretaria-page">
    <header class="page-header">
      <h1>Secretaria</h1>

    </header>
    <h2 class="section-title">Gestiones</h2>
    <p class="reminder-text">aqui ira todo el tema de apuntarse al club y federarse</p>

    <div>
      <h2  class="section-title">Documentos del club</h2>
      <p>Descarga aqui la documentacion oficial disponible.</p>
    </div>

    <p v-if="isLoadingDocuments" class="info-message">Cargando documentacion disponible...</p>
    <p v-else-if="availableDocuments.length === 0" class="info-message">No hay documentos disponibles por ahora.</p>
    <p v-if="documentsError" class="error-message">{{ documentsError }}</p>
    <p v-if="downloadError" class="error-message">{{ downloadError }}</p>

    <div v-if="availableDocuments.length > 0" class="documents-grid">
      <article v-for="document in availableDocuments" :key="document.type" class="doc-card">
        <h2>{{ document.title }}</h2>
        <p>{{ document.description }}</p>
        <button
          class="download-btn"
          :disabled="isDownloading[document.type]"
          @click="downloadDocument(document.type)"
        >
          {{ isDownloading[document.type] ? "Descargando..." : "Descargar" }}
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.secretaria-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.page-header h1 {
  margin: 0;
  color: var(--color-primary);
}

.reminder-text {
  margin: 0.5rem 0 0;
  color: var(--color-text);
}

.section-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.25rem;
}

.documents-section-header h2 {
  margin: 0;
}

.documents-section-header p {
  margin: 0.4rem 0 0;
  color: var(--color-text);
}

.error-message {
  margin: 0;
  color: #b91c1c;
}

.info-message {
  margin: 0;
  color: var(--color-text);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.doc-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.doc-card h2 {
  margin: 0;
  font-size: 1.1rem;
}

.doc-card p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.45;
}

.download-btn {
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  justify-self: start;
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
