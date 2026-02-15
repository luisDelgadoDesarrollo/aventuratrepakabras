<script setup lang="ts">
import { getUs } from "~/composables/api/usApi";
import type { RuleResponseDto, UsResponseDto } from '~/types/club'
import { getRules } from "~/composables/api/rulesApi";
import { getLastPublication } from "~/composables/api/publicationsApi";
import type { PublicationResponseDto } from "~/types/publications";
import type { ActivityResponseDto } from "~/types/activities";
import { getLastActivity } from "~/composables/api/activitiesApi";
import UsCard from "~/components/cards/UsCard.vue";
import RulesCard from "~/components/cards/RulesCard.vue";
import PublicationCard from "~/components/cards/PublicationCard.vue";
import ActivityDoneCard from "~/components/cards/ActivityDoneCard.vue";

const { data: us } = await useAsyncData<UsResponseDto>(
    'us',
    () => getUs()
)

const { data: rules } = await useAsyncData<RuleResponseDto[]>(
    'rules',
    () => getRules()
)

const { data: publication } = await useAsyncData<PublicationResponseDto>(
    'last-publication',
    () => getLastPublication()
)

const { data: activity } = await useAsyncData<ActivityResponseDto>(
    'last-activity',
    () => getLastActivity()
)
</script>

<template>
  <div class="publications-container">

    <ActivityDoneCard
        v-if="activity"
        :activity="activity"
        title="Ultima actividad"
    />

    <PublicationCard
        v-if="publication"
        :publication="publication"
        title="Ultima publicacion"
    />

    <UsCard
        v-if="us"
        :us="us"
    />

    <RulesCard
        v-if="rules"
        :rules="rules"
    />

  </div>
</template>

<style scoped>
.publications-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
