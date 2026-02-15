<script setup lang="ts">
import type { LinkRequestDto } from "~/types/publications"

const props = withDefaults(defineProps<{
  modelValue: LinkRequestDto[]
  title?: string
  addLabel?: string
}>(), {
  title: "Links",
  addLabel: "+ Link"
})

const emit = defineEmits<{
  (event: "update:modelValue", value: LinkRequestDto[]): void
}>()

function cloneLinks(links: LinkRequestDto[]) {
  return links.map((link) => ({ ...link }))
}

function updateLinks(links: LinkRequestDto[]) {
  emit("update:modelValue", links)
}

function addLink() {
  const next = cloneLinks(props.modelValue)
  next.push({ title: "", link: "" })
  updateLinks(next)
}

function removeLink(index: number) {
  const next = cloneLinks(props.modelValue)
  next.splice(index, 1)
  updateLinks(next)
}

function updateTitle(index: number, value: string) {
  const next = cloneLinks(props.modelValue)
  const link = next[index]
  if (!link) return
  link.title = value
  updateLinks(next)
}

function updateUrl(index: number, value: string) {
  const next = cloneLinks(props.modelValue)
  const link = next[index]
  if (!link) return
  link.link = value
  updateLinks(next)
}
</script>

<template>
  <div class="form-section">
    <div class="section-header">
      <h3>{{ title }}</h3>
      <button type="button" class="action-btn edit-new-btn" @click="addLink">
        {{ addLabel }}
      </button>
    </div>

    <div v-for="(link, index) in modelValue" :key="index" class="link-row">
      <div class="form-group">
        <label>Titulo</label>
        <input
          :value="link.title"
          type="text"
          placeholder="Titulo"
          @input="(event) => updateTitle(index, (event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-group">
        <label>URL</label>
        <input
          :value="link.link"
          type="url"
          placeholder="https://..."
          @input="(event) => updateUrl(index, (event.target as HTMLInputElement).value)"
        />
      </div>

      <button type="button" class="action-btn delete-btn" @click="removeLink(index)">
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

.link-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
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

@media (max-width: 768px) {
  .link-row {
    grid-template-columns: 1fr;
  }
}
</style>
