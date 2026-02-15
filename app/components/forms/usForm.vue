<script setup lang="ts">
import ImageForm from "~/components/forms/imageForm.vue"
import type { ImageFormItem } from "~/types/forms"

const props = defineProps<{
  text: string
  images: ImageFormItem[]
  isSaving: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  (event: "update:text", value: string): void
  (event: "update:images", value: ImageFormItem[]): void
  (event: "save"): void
  (event: "cancel"): void
}>()
</script>

<template>
  <form class="us-form" @submit.prevent="emit('save')">
    <div class="form-group">
      <label for="us-text">Texto</label>
      <textarea
        id="us-text"
        :value="text"
        rows="8"
        placeholder="Describe el club"
        required
        @input="emit('update:text', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <ImageForm
      :model-value="images"
      title="Imagenes"
      add-label="+ Imagen"
      hint="Las imagenes existentes cargan con nombre image-*. Puedes reemplazarlas subiendo un archivo."
      id-prefix="us-image-file"
      @update:model-value="emit('update:images', $event)"
    />

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div class="form-actions">
      <button type="submit" class="action-btn edit-new-btn" :disabled="isSaving">
        {{ isSaving ? "Guardando..." : "Guardar" }}
      </button>
      <button type="button" class="action-btn" @click="emit('cancel')">
        Cancelar
      </button>
    </div>
  </form>
</template>

<style scoped>
.us-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
}

.error-message {
  color: #b91c1c;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
}
</style>
