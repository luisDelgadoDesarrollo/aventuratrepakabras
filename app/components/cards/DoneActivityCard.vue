<script setup lang="ts">
import type { ActivityResponseDto } from "~/types/activities"
import ActivityDoneCard from "~/components/cards/ActivityDoneCard.vue"

defineProps<{
  activity: ActivityResponseDto
}>()
</script>

<template>
  <ActivityDoneCard :activity="activity" />
</template>
