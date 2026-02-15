<script setup lang="ts">
import type { RuleResponseDto } from "~/types/club";
import CardBase from "~/components/cards/CardBase.vue";

defineProps<{
  rules: RuleResponseDto[]
}>()
</script>

<template>
  <CardBase>
    <h2 class="card-title">Reglas</h2>
    <div class="section-divider"></div>

    <div class="rules-list">
      <div
          v-for="rule in rules"
          :key="rule.ruleId"
          class="rule-item"
      >
        <span class="rule-number">
          {{ rule.ruleId }}
        </span>

        <p class="rule-text">
          {{ rule.rule }}
        </p>
      </div>
    </div>
  </CardBase>
</template>

<style scoped>
.rules-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: all 0.2s ease;
}

.rule-item:hover {
  background: var(--color-surface-hover);
  transform: translateX(4px);
}

.rule-number {
  min-width: 32px;
  height: 32px;
  background: var(--color-primary);
  color: white;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.rule-text {
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
}
</style>
