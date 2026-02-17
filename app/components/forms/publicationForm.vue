<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import ImageForm from "~/components/forms/imageForm.vue"
import LinkForm from "~/components/forms/linkForm.vue"
import { createPublication, updatePublication } from "~/composables/api/publicationsApi"
import type { CreatePublicationRequestDto, LinkRequestDto, PublicationResponseDto } from "~/types/publications"
import { bumpImagesVersion, getImageUrl } from "~/composables/api/imgApi"
import type { ImageFormItem } from "~/types/forms"

const props = withDefaults(defineProps<{
  modelValue: boolean
  mode?: "create" | "edit"
  publication?: PublicationResponseDto | null
}>(), {
  mode: "create",
  publication: null
})

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
  (event: "saved"): void
}>()

const createForm = reactive<{
  title: string
  text: string
  images: ImageFormItem[]
  links: LinkRequestDto[]
}>({
  title: "",
  text: "",
  images: [],
  links: []
})

const isSubmitting = ref(false)
const isEditMode = computed(() => props.mode === "edit")
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
})

function resetForm() {
  createForm.title = ""
  createForm.text = ""
  createForm.images.splice(0)
  createForm.links.splice(0)
}

function setFormFromPublication(publication: PublicationResponseDto) {
  createForm.title = publication.title
  createForm.text = publication.text

  createForm.images.splice(0)
  publication.imagesPath.forEach((imagePath, index) => {
    createForm.images.push({
      clientId: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      image: `image-${index + 1}`,
      description: "",
      file: null,
      existing: true,
      sourcePath: imagePath
    })
  })

  createForm.links.splice(0)
  publication.links.forEach((link) => {
    createForm.links.push({
      title: link.title,
      link: link.link
    })
  })
}

function getFileExtension(path: string) {
  const cleanPath = path.split("?")[0]
  const lastDotIndex = cleanPath.lastIndexOf(".")
  if (lastDotIndex === -1) return ""
  return cleanPath.slice(lastDotIndex)
}

function close() {
  emit("update:modelValue", false)
}

async function handleCreate() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const orderedImages = createForm.images.filter((item) => item.existing || item.file)
    const imagesPayload = orderedImages.map((item, index) => ({
      image: `image-${index + 1}`,
      description: item.description
    }))

    const fileEntries = await Promise.all(
      orderedImages.map(async (item, index) => {
        const imageName = `image-${index + 1}`

        if (item.file) {
          return [imageName, item.file] as const
        }

        if (item.existing && item.sourcePath) {
          const response = await fetch(getImageUrl(item.sourcePath), { cache: "no-store" })
          if (!response.ok) {
            throw new Error(`No se pudo recuperar la imagen existente ${imageName}`)
          }

          const blob = await response.blob()
          const extension = getFileExtension(item.sourcePath)
          const file = new File([blob], `${imageName}${extension}`, {
            type: blob.type || "application/octet-stream"
          })

          return [imageName, file] as const
        }

        return null
      })
    )

    const filesPayload: Record<string, File> = {}
    fileEntries.forEach((entry) => {
      if (!entry) return
      filesPayload[entry[0]] = entry[1]
    })

    const request: CreatePublicationRequestDto = {
      title: createForm.title,
      text: createForm.text,
      images: imagesPayload,
      links: createForm.links.filter((link) => link.title || link.link)
    }

    if (isEditMode.value && props.publication) {
      await updatePublication(props.publication.slug, request, filesPayload)
    } else {
      await createPublication(request, filesPayload)
    }

    bumpImagesVersion()
    close()
    resetForm()
    emit("saved")
  } catch (error) {
    console.error("Error creando publicacion:", error)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      if (isEditMode.value && props.publication) {
        setFormFromPublication(props.publication)
      } else {
        resetForm()
        createForm.images = [{
          clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          image: "image-1",
          description: "",
          file: null,
          existing: false,
          sourcePath: null
        }]
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
      <h2>{{ isEditMode ? "Editar publicacion" : "Crear publicacion" }}</h2>
    </div>

    <form class="admin-form publication-form" @submit.prevent="handleCreate">
      <div class="admin-form-group">
        <label for="publication-title">Titulo</label>
        <input
          id="publication-title"
          v-model="createForm.title"
          type="text"
          placeholder="Titulo"
          required
        />
      </div>

      <div class="admin-form-group">
        <label for="publication-text">Texto</label>
        <textarea
          id="publication-text"
          v-model="createForm.text"
          rows="6"
          placeholder="Texto"
        ></textarea>
      </div>

      <ImageForm
        v-model="createForm.images"
        title="Imagenes"
        add-label="+ Imagen"
        empty-hint="Anade imagenes si necesitas actualizarlas."
        id-prefix="publication-image-file"
      />

      <LinkForm v-model="createForm.links" title="Links" add-label="+ Link" />

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
.publication-form {
  gap: 1.5rem;
}
</style>
