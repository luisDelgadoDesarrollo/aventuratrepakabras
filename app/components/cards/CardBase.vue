<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const expanded = ref(false)
const isOverflowing = ref(false)
const contentRef = ref<HTMLElement | null>(null)

const MAX_HEIGHT = 360

function toggle() {
  expanded.value = !expanded.value
}

onMounted(async () => {
  await nextTick()

  if (contentRef.value) {
    isOverflowing.value =
        contentRef.value.scrollHeight > MAX_HEIGHT
  }
})
</script>

<template>
  <section class="base-card">
    <div
        ref="contentRef"
        class="content"
        :class="{ collapsed: isOverflowing && !expanded }"
    >
      <slot />

      <div
          v-if="isOverflowing && !expanded"
          class="fade"
      ></div>
    </div>

    <button
        v-if="isOverflowing"
        class="toggle-btn"
        @click="toggle"
    >
      {{ expanded ? 'Ver menos' : 'Ver más' }}
    </button>
  </section>
</template>

<style scoped>
.base-card {
  background: var(--color-bg);
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.content {
  position: relative;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.collapsed {
  max-height: 360px;
}

.fade {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: linear-gradient(
      to bottom,
      transparent,
      var(--color-bg)
  );
}

.toggle-btn {
  display: block;
  margin-left: auto;
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--color-text);
  font-weight: 600;
  cursor: pointer;
}
</style>
