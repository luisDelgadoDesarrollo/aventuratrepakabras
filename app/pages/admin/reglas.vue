<script setup lang="ts">
import { ref } from "vue"
import BaseDialog from "~/components/BaseDialog.vue"
import { getRules, updateRules } from "~/composables/api/rulesApi"
import type { RuleResponseDto } from "~/types/club"

definePageMeta({
  middleware: "auth"
})

const editModal = ref(false)
const isSaving = ref(false)
const saveError = ref("")
const rulesDraft = ref<string[]>([])

const { data: rules, pending, refresh } = await useAsyncData<RuleResponseDto[]>(
    "admin-rules",
    () => getRules()
)

function openEdit() {
  rulesDraft.value = (rules.value ?? []).map((item) => item.rule)
  if (rulesDraft.value.length === 0) {
    rulesDraft.value.push("")
  }
  saveError.value = ""
  editModal.value = true
}

function addRule() {
  rulesDraft.value.push("")
}

function removeRule(index: number) {
  rulesDraft.value.splice(index, 1)
  if (rulesDraft.value.length === 0) {
    rulesDraft.value.push("")
  }
}

async function saveRules() {
  if (isSaving.value) return

  const cleanRules = rulesDraft.value
      .map((rule) => rule.trim())
      .filter((rule) => rule.length > 0)

  if (cleanRules.length === 0) {
    saveError.value = "Debes indicar al menos una regla."
    return
  }

  isSaving.value = true
  saveError.value = ""

  try {
    await updateRules(cleanRules)
    editModal.value = false
    await refresh()
  } catch (error) {
    console.error("Error actualizando reglas:", error)
    saveError.value = "No se han podido actualizar las reglas."
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section class="rules-admin-page">
    <div class="page-header">
      <h1 class="page-title">Reglas</h1>
      <button class="action-btn edit-new-btn" @click="openEdit">
        ✏️ Editar
      </button>
    </div>

    <div class="table-wrapper">
      <table class="admin-table">
        <thead>
        <tr>
          <th>#</th>
          <th>Regla</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="pending">
          <td colspan="2">Cargando reglas...</td>
        </tr>
        <tr v-else-if="!rules || rules.length === 0">
          <td colspan="2">No hay reglas configuradas.</td>
        </tr>
        <template v-else>
          <tr v-for="rule in rules" :key="rule.ruleId">
            <td>{{ rule.ruleId }}</td>
            <td>{{ rule.rule }}</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

    <BaseDialog v-model="editModal">
      <div class="dialog-header">
        <h2>Editar reglas</h2>
        <button type="button" class="action-btn edit-new-btn" @click="addRule">
          + Regla
        </button>
      </div>

      <form class="rules-form" @submit.prevent="saveRules">
        <div
            v-for="(rule, index) in rulesDraft"
            :key="index"
            class="rule-row"
        >
          <label :for="`rule-${index}`">Regla {{ index + 1 }}</label>
          <textarea
              :id="`rule-${index}`"
              v-model="rulesDraft[index]"
              rows="2"
              placeholder="Escribe la regla"
          />
          <button
              type="button"
              class="action-btn delete-btn"
              @click="removeRule(index)"
          >
            Borrar
          </button>
        </div>

        <p v-if="saveError" class="error-message">{{ saveError }}</p>

        <div class="form-actions">
          <button type="submit" class="action-btn edit-new-btn" :disabled="isSaving">
            {{ isSaving ? "Guardando..." : "Guardar cambios" }}
          </button>
          <button type="button" class="action-btn" @click="editModal = false">
            Cancelar
          </button>
        </div>
      </form>
    </BaseDialog>
  </section>
</template>

<style scoped>
.rules-admin-page {
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

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.rules-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rule-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.rule-row label {
  grid-column: 1 / -1;
  font-weight: 600;
}

.rule-row textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  resize: vertical;
  min-height: 80px;
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
</style>
