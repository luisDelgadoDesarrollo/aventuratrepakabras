<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import { createPublication, updatePublication } from "~/composables/api/publicationsApi"
import type { CreatePublicationRequestDto, LinkRequestDto, PublicationResponseDto } from "~/types/publications"

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

type ImageFormItem = {
  image: string
  description: string
  file: File | null
}

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
  createForm.links.splice(0)
  publication.links.forEach((link) => {
    createForm.links.push({
      title: link.title,
      link: link.link
    })
  })
}

function syncImageNames() {
  createForm.images.forEach((item, index) => {
    item.image = `image-${index + 1}`
  })
}

function addImage() {
  createForm.images.push({
    image: "",
    description: "",
    file: null
  })
  syncImageNames()
}

function removeImage(index: number) {
  createForm.images.splice(index, 1)
  syncImageNames()
}

function addLink() {
  createForm.links.push({
    title: "",
    link: ""
  })
}

function removeLink(index: number) {
  createForm.links.splice(index, 1)
}

function onImageFileChange(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  createForm.images[index].file = file
}

function close() {
  emit("update:modelValue", false)
}

async function handleCreate() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const imagesWithFiles = createForm.images.filter((item) => item.file)
    const imagesPayload = imagesWithFiles.map((item, index) => ({
      image: `image-${index + 1}`,
      description: item.description
    }))
    const filesPayload = imagesWithFiles.map((item) => item.file as File)

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
        addImage()
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
    <div class="dialog-header">
      <h2>{{ isEditMode ? "Editar publicacion" : "Crear publicacion" }}</h2>
    </div>
    <form class="publication-form" @submit.prevent="handleCreate">
      <div class="form-group">
        <label for="publication-title">Titulo</label>
        <input
          id="publication-title"
          v-model="createForm.title"
          type="text"
          placeholder="Titulo"
          required
        />
      </div>

      <div class="form-group">
        <label for="publication-text">Texto</label>
        <textarea
          id="publication-text"
          v-model="createForm.text"
          rows="6"
          placeholder="Texto"
        ></textarea>
      </div>

      <div class="form-section">
        <div class="section-header">
          <h3>Imagenes</h3>
          <button type="button" class="action-btn edit-new-btn" @click="addImage">
            + Imagen
          </button>
        </div>

        <p v-if="createForm.images.length === 0" class="empty-hint">
          Anade imagenes si necesitas actualizarlas.
        </p>

        <div
          v-for="(image, index) in createForm.images"
          :key="index"
          class="image-row"
        >
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="image.image" type="text" readonly />
          </div>
          <div class="form-group">
            <label>Descripcion</label>
            <input v-model="image.description" type="text" placeholder="Descripcion" />
          </div>
          <div class="form-group">
            <label>Archivo</label>
            <input type="file" accept="image/*" @change="(event) => onImageFileChange(event, index)" />
          </div>
          <button type="button" class="action-btn delete-btn" @click="removeImage(index)">
            Borrar
          </button>
        </div>
      </div>

      <div class="form-section">
        <div class="section-header">
          <h3>Links</h3>
          <button type="button" class="action-btn edit-new-btn" @click="addLink">
            + Link
          </button>
        </div>

        <div
          v-for="(link, index) in createForm.links"
          :key="index"
          class="link-row"
        >
          <div class="form-group">
            <label>Titulo</label>
            <input v-model="link.title" type="text" placeholder="Titulo" />
          </div>
          <div class="form-group">
            <label>URL</label>
            <input v-model="link.link" type="url" placeholder="https://..." />
          </div>
          <button type="button" class="action-btn delete-btn" @click="removeLink(index)">
            Borrar
          </button>
        </div>
      </div>

      <div class="form-actions">
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
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.publication-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--color-secondary);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.95rem;
}

.form-group input[readonly] {
  background: var(--color-surface);
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-md);
  padding: 1rem;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.image-row,
.link-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 1rem;
  align-items: end;
}

.link-row {
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
}

.empty-hint {
  color: var(--color-placeholder);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .image-row,
  .link-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
