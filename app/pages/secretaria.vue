<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { sendFederationRequest, sendMembershipRequest } from "~/composables/api/contactApi"
import { getDoc } from "~/composables/api/docApi"
import { PdfType } from "~/types/pdf"
import { useClubIban } from "~/composables/state/useClubIban"

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

const joinName = ref("")
const joinDni = ref("")
const signupRequestFile = ref<File | null>(null)
const paymentProofFile = ref<File | null>(null)
const federateName = ref("")
const federateDni = ref("")
const federationRequestFile = ref<File | null>(null)
const isSubmittingMembership = ref(false)
const isSubmittingFederation = ref(false)
const formStatusMessage = ref("")
const formErrorMessage = ref("")
const { iban: clubIban, isLoading: isLoadingIban } = useClubIban()

const documents: DocumentCardItem[] = [
  {
    type: PdfType.BY_LAWS,
    title: "Estatutos del club",
    description: "Documento con la normativa interna, estructura y funcionamiento del club."
  },
  {
    type: PdfType.EQUALITY_PLAN,
    title: "Plan de igualdad",
    description: "Medidas y compromisos del club para promover la igualdad y la inclusion."
  },
  {
    type: PdfType.MEMBERSHIP_SIGNUP,
    title: "Alta de socios",
    description: "Formulario y condiciones para completar el proceso de alta como socio."
  },
  {
    type: PdfType.FEDERATION_APPLICATION,
    title: "Solicitud federativa",
    description: "Documento necesario para tramitar la solicitud de federacion."
  }
].sort((a, b) => a.title.localeCompare(b.title, "es"))

const federationDoc = computed(() =>
  availableDocuments.value.find((entry) => entry.type === PdfType.FEDERATION_APPLICATION)
)

function buildDownloadName(type: PdfType) {
  return `${type}_${config.public.clubSlug}.pdf`
}

function onSignupRequestChange(event: Event) {
  const target = event.target as HTMLInputElement
  signupRequestFile.value = target.files?.[0] ?? null
}

function onPaymentProofChange(event: Event) {
  const target = event.target as HTMLInputElement
  paymentProofFile.value = target.files?.[0] ?? null
}

function onFederationRequestChange(event: Event) {
  const target = event.target as HTMLInputElement
  federationRequestFile.value = target.files?.[0] ?? null
}

async function submitMembershipRequest() {
  if (!signupRequestFile.value || !paymentProofFile.value || isSubmittingMembership.value) return

  formErrorMessage.value = ""
  formStatusMessage.value = ""
  isSubmittingMembership.value = true

  try {
    await sendMembershipRequest(signupRequestFile.value, paymentProofFile.value)
    formStatusMessage.value = "Solicitud de alta enviada correctamente."
  } catch {
    formErrorMessage.value = "No se pudo enviar la solicitud de alta. Intentalo de nuevo."
  } finally {
    isSubmittingMembership.value = false
  }
}

async function submitFederationRequest() {
  if (!federationRequestFile.value || isSubmittingFederation.value) return

  formErrorMessage.value = ""
  formStatusMessage.value = ""
  isSubmittingFederation.value = true

  try {
    await sendFederationRequest(federationRequestFile.value)
    formStatusMessage.value = "Solicitud federativa enviada correctamente."
  } catch {
    formErrorMessage.value = "No se pudo enviar la solicitud federativa. Intentalo de nuevo."
  } finally {
    isSubmittingFederation.value = false
  }
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

    <section class="management-block">
      <h3>Apuntarse</h3>
      <p class="reminder-text">
        Debes enviar el documento de alta de socios disponible mas abajo y adjuntar un justificante de pago con las cuotas indicadas al IBAN indicado.
      </p>
      <p class="reminder-text">Cuota de inscripcion, nuevo socio: 10 euros</p>
      <p class="reminder-text">Socio infantil 10-14: 12 euros</p>
      <p class="reminder-text">Socio juvenil 15-17 anios: 16 euros</p>
      <p class="reminder-text">Socio adulto 18-75: 20 euros</p>

      <form class="join-form" @submit.prevent>
        <div class="form-group">
          <label for="join-name">Nombre</label>
          <input id="join-name" v-model="joinName" type="text" placeholder="Nombre completo" />
        </div>

        <div class="form-group">
          <label for="join-dni">DNI</label>
          <input id="join-dni" v-model="joinDni" type="text" placeholder="12345678A" />
        </div>

        <div class="form-group">
          <label for="signup-request">Solicitud de alta</label>
          <input id="signup-request" type="file" @change="onSignupRequestChange" />
          <small v-if="signupRequestFile">{{ signupRequestFile.name }}</small>
        </div>

        <div class="form-group">
          <label for="payment-proof">Justificante de pago</label>
          <input id="payment-proof" type="file" @change="onPaymentProofChange" />
          <small v-if="paymentProofFile">{{ paymentProofFile.name }}</small>
        </div>

        <div class="form-group">
          <label for="membership-iban">IBAN</label>
          <input
            id="membership-iban"
            :value="clubIban || (isLoadingIban ? 'Cargando...' : 'No disponible')"
            type="text"
            readonly
          />
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="download-btn"
            :disabled="!signupRequestFile || !paymentProofFile || isSubmittingMembership"
            @click="submitMembershipRequest"
          >
            {{ isSubmittingMembership ? "Enviando..." : "Enviar alta" }}
          </button>
        </div>
      </form>
    </section>

    <section class="management-block">
      <h3>Federarse</h3>
      <p class="reminder-text">Adjunta la solicitud federativa para tramitar la federacion.</p>

      <form class="join-form" @submit.prevent>
        <div class="form-group">
          <label for="federate-name">Nombre</label>
          <input id="federate-name" v-model="federateName" type="text" placeholder="Nombre completo" />
        </div>

        <div class="form-group">
          <label for="federate-dni">DNI</label>
          <input id="federate-dni" v-model="federateDni" type="text" placeholder="12345678A" />
        </div>

        <div class="form-group">
          <label for="federation-request">Solicitud federativa</label>
          <input id="federation-request" type="file" @change="onFederationRequestChange" />
          <small v-if="federationRequestFile">{{ federationRequestFile.name }}</small>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="download-btn"
            :disabled="!federationRequestFile || isSubmittingFederation"
            @click="submitFederationRequest"
          >
            {{ isSubmittingFederation ? "Enviando..." : "Enviar solicitud federativa" }}
          </button>
        </div>
      </form>
    </section>

    <p v-if="formStatusMessage" class="success-message">{{ formStatusMessage }}</p>
    <p v-if="formErrorMessage" class="error-message">{{ formErrorMessage }}</p>

    <div>
      <h2 class="section-title">Documentos del club</h2>
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

.section-title {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.25rem;
}

.management-block {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  padding: 1rem;
  display: grid;
  gap: 0.35rem;
}

.management-block h3 {
  margin: 0;
  color: var(--color-primary);
}

.reminder-text {
  margin: 0.2rem 0 0;
  color: var(--color-text);
}

.join-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem 1rem;
  margin-top: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text);
}

.form-group input {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
}

.form-group small {
  color: var(--color-text-secondary);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.success-message {
  margin: 0;
  color: #047857;
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
  .join-form {
    grid-template-columns: 1fr;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
