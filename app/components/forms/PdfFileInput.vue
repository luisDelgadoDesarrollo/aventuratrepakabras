<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: File | null
  inputId?: string
  label?: string
  buttonLabel?: string
}>(), {
  inputId: "pdf-file-input",
  label: "Archivo PDF",
  buttonLabel: "Seleccionar archivo"
})

const emit = defineEmits<{
  (event: "update:modelValue", value: File | null): void
}>()

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null

  if (!file) {
    emit("update:modelValue", null)
    return
  }

  const isPdfByMime = file.type === "application/pdf"
  const isPdfByName = file.name.toLowerCase().endsWith(".pdf")
  emit("update:modelValue", isPdfByMime || isPdfByName ? file : null)
}

function clearFile() {
  emit("update:modelValue", null)
}
</script>

<template>
  <div class="form-group">
    <label :for="inputId">{{ label }}</label>
    <div class="file-picker">
      <input
        :id="inputId"
        type="file"
        accept="application/pdf,.pdf"
        class="file-input"
        @change="onFileChange"
      />
      <label :for="inputId" class="file-btn">
        {{ buttonLabel }}
      </label>
      <span class="file-selected">{{ modelValue?.name ?? "Ningun archivo seleccionado" }}</span>
      <button v-if="modelValue" type="button" class="action-btn delete-btn clear-btn" @click="clearFile">
        Quitar
      </button>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-picker {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
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

.clear-btn {
  padding: 0.45rem 0.65rem;
}

@media (max-width: 768px) {
  .file-picker {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>
