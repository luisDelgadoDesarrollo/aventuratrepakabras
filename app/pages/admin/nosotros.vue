<script setup lang="ts">
import { computed, ref } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import UsForm from "~/components/forms/usForm.vue"
import { createUs, getUs, updateUs } from "~/composables/api/usApi"
import type { UsResponseDto } from "~/types/club"
import { bumpImagesVersion, getImageUrl } from "~/composables/api/imgApi"
import type { ImageFormItem } from "~/types/forms"
import { buildImagePayload, createEmptyImageItem, createExistingImageItem } from "~/composables/forms/imageMultipart"

definePageMeta({
  middleware: "auth"
})

const editModal = ref(false)
const isSaving = ref(false)
const saveError = ref("")

const formText = ref("")
const formImages = ref<ImageFormItem[]>([])

const { data: us, pending, error, refresh } = await useAsyncData<UsResponseDto | null>(
  "admin-us",
  async () => {
    try {
      return await getUs()
    } catch (fetchError: any) {
      const status = fetchError?.status ?? fetchError?.statusCode ?? fetchError?.response?.status
      if (status === 404) return null
      throw fetchError
    }
  }
)

const usExists = computed(() => !!us.value)

function openForm() {
  formText.value = us.value?.text ?? ""
  formImages.value = (us.value?.images ?? []).map((imagePath, index) => createExistingImageItem(imagePath, index))

  saveError.value = ""

  if (formImages.value.length === 0) {
    formImages.value = [createEmptyImageItem()]
  }

  editModal.value = true
}

function closeForm() {
  editModal.value = false
}

async function saveUs() {
  if (isSaving.value) return

  const cleanText = formText.value.trim()
  if (!cleanText) {
    saveError.value = "Text is required."
    return
  }

  const { payload, files } = await buildImagePayload(
    formImages.value,
    (index) => `image-${index + 1}`,
    getImageUrl
  )

  isSaving.value = true
  saveError.value = ""

  try {
    const request = {
      text: cleanText,
      images: payload
    }

    if (usExists.value) {
      await updateUs(request, files)
    } else {
      await createUs(request, files)
    }

    bumpImagesVersion()
    closeForm()
    await refresh()
  } catch (saveErr) {
    console.error("Error saving us:", saveErr)
    saveError.value = "Could not save Us data."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="us-admin-page">
    <div class="page-header">
      <h1 class="page-title">Nosotros</h1>
      <button class="action-btn edit-new-btn" @click="openForm">
        {{ usExists ? "Editar" : "Crear" }}
      </button>
    </div>

    <div class="table-wrapper">
      <div class="us-panel">
        <p v-if="pending">Cargando informacion...</p>
        <p v-else-if="error">No se ha podido cargar la informacion de Nosotros.</p>
        <template v-else-if="us">
          <h2>Texto actual</h2>
          <p class="us-text">{{ us.text }}</p>

          <h3>Imagenes actuales</h3>
          <p v-if="us.images.length === 0">No hay imagenes cargadas.</p>
          <ImageGallery v-else :images="us.images" />
        </template>
        <template v-else>
          <p class="empty-message">
            No existe contenido de Nosotros. Pulsa en Crear para anadirlo.
          </p>
        </template>
      </div>
    </div>

    <BaseDialog v-model="editModal">
      <div class="dialog-header">
        <h2>{{ usExists ? "Editar Nosotros" : "Crear Nosotros" }}</h2>
      </div>

      <UsForm
        :text="formText"
        :images="formImages"
        :is-saving="isSaving"
        :error-message="saveError"
        @update:text="formText = $event"
        @update:images="formImages = $event"
        @save="saveUs"
        @cancel="closeForm"
      />
    </BaseDialog>
  </section>
</template>

<style scoped>
.us-admin-page {
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

.us-panel {
  padding: 1rem;
}

.us-text {
  white-space: pre-line;
  margin-top: 0.5rem;
}

.empty-message {
  margin: 0;
}

.dialog-header {
  margin-bottom: 1rem;
}

</style>
