<script setup lang="ts">
import CardBase from "~/components/cards/CardBase.vue";

defineProps<{
  title: string
  description: string
  route: string
}>()

const router = useRouter()

function goTo(route: string) {
  router.push(route)
}
</script>

<template>
  <CardBase @click="goTo(route)">

      <h3>{{ title }}</h3>
      <p>{{ description }}</p>

  </CardBase>

</template>

<style scoped>

</style>
