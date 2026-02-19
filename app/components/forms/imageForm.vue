<script setup lang="ts">
import type { ImageFormItem } from "~/types/forms"

const props = withDefaults(defineProps<{
  modelValue: ImageFormItem[]
  title?: string
  addLabel?: string
  hint?: string
  emptyHint?: string
  idPrefix?: string
}>(), {
  title: "Imagenes",
  addLabel: "+ Imagen",
  hint: "",
  emptyHint: "Anade imagenes si lo necesitas.",
  idPrefix: "image-file"
})

const emit = defineEmits<{
  (event: "update:modelValue", value: ImageFormItem[]): void
}>()

function createClientId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function copyItems(items: ImageFormItem[]) {
  return items.map((item) => ({ ...item }))
}

function syncImageNames(items: ImageFormItem[]) {
  items.forEach((item, index) => {
    item.image = `image-${index + 1}`
  })
}

function updateItems(items: ImageFormItem[]) {
  emit("update:modelValue", items)
}

function addImage() {
  const next = copyItems(props.modelValue)
  next.push({
    clientId: createClientId(),
    image: "",
    description: "",
    file: null,
    existing: false,
    sourcePath: null
  })
  syncImageNames(next)
  updateItems(next)
}

function removeImageById(clientId: string) {
  const next = copyItems(props.modelValue)
  const index = next.findIndex((item) => item.clientId === clientId)
  if (index === -1) return
  next.splice(index, 1)
  syncImageNames(next)
  updateItems(next)
}

function updateDescriptionById(clientId: string, value: string) {
  const next = copyItems(props.modelValue)
  const item = next.find((entry) => entry.clientId === clientId)
  if (!item) return
  item.description = value
  updateItems(next)
}

function onImageFileChangeById(event: Event, clientId: string) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  const next = copyItems(props.modelValue)
  const item = next.find((entry) => entry.clientId === clientId)
  if (!item) return
  item.file = file
  updateItems(next)
}

function getFileDisplayName(item: ImageFormItem) {
  if (item.file) return item.file.name
  if (item.existing) return item.image
  return "Ningun archivo seleccionado"
}
</script>

<template>
  <div class="form-section">
    <div class="section-header">
      <h3>{{ title }}</h3>
      <button type="button" class="action-btn edit-new-btn" @click="addImage">
        {{ addLabel }}
      </button>
    </div>

    <p v-if="hint" class="section-hint">{{ hint }}</p>
    <p v-if="modelValue.length === 0" class="empty-hint">{{ emptyHint }}</p>

    <div v-for="image in modelValue" :key="image.clientId" class="image-row">
      <div class="form-group">
        <label>Nombre</label>
        <input :value="image.image" type="text" readonly />
      </div>

      <div class="form-group">
        <label>Descripcion</label>
        <input
          :value="image.description"
          type="text"
          placeholder="Descripcion"
          @input="(event) => updateDescriptionById(image.clientId, (event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-group">
        <label>Archivo</label>
        <div class="file-picker">
          <input
            :id="`${idPrefix}-${image.clientId}`"
            type="file"
            accept="image/*"
            class="file-input"
            @change="(event) => onImageFileChangeById(event, image.clientId)"
          />
          <label :for="`${idPrefix}-${image.clientId}`" class="file-btn">
            Seleccionar archivo
          </label>
          <span class="file-selected">{{ getFileDisplayName(image) }}</span>
        </div>
      </div>

      <button type="button" class="action-btn delete-btn" @click="removeImageById(image.clientId)">
        Borrar
      </button>
    </div>
  </div>
</template>

<style scoped>
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

.section-hint,
.empty-hint {
  margin: 0;
  color: var(--color-placeholder);
}

.image-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group input {
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: white;
  font-size: 0.95rem;
}

.form-group input[readonly] {
  background: var(--color-surface);
}

.file-picker {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.file-input {
  display: none;
}

.file-btn {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: white;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.file-selected {
  font-size: 0.85rem;
  color: var(--color-secondary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .image-row {
    grid-template-columns: 1fr;
  }
}
</style>
