<script setup lang="ts">
import type {ActivityResponseDto} from "~/types/activities";
import CardBase from "~/components/cards/CardBase.vue";
import {formatDate} from "compatx";

defineProps<{
  activity: ActivityResponseDto,
  title?: string,
}>()
</script>

<template>
  <CardBase>
    <div v-if="activity" >

      <h2 class="activity-title">
        {{ title || activity.title }}
      </h2>

      <p class="activity-description">
        {{ activity.description }}
      </p>

      <div class="activity-dates">
        📅 {{ formatDate(activity.startDate) }} -
        {{ formatDate(activity.endDate) }}
      </div>

      <div class="activity-prices">
        <div class="price affiliate">
          <span>Afiliados</span>
          <strong>{{ activity.affiliatePrice }}€</strong>
        </div>

        <div class="price no-affiliate">
          <span>No afiliados</span>
          <strong>{{ activity.noAffiliatePrice }}€</strong>
        </div>
      </div>

      <div class="images-grid">
        <ImageGallery :images="activity.imagesPath" />
      </div>

    </div>
  </CardBase>
</template>

<style scoped>

</style>