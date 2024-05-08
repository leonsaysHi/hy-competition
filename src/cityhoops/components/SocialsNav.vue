<script lang="ts" setup>
import { useRoute } from 'vue-router'
import useCompetition from '@/composable/useCompetition'
const route = useRoute()
const { competitionId } = route.params as { competitionId: string | undefined }
const { row } = useCompetition(competitionId)
</script>
<template>
  <div class="socials_wrap d-flex flex-column flex-lg-row gap-2 fs-5">
    <template v-if="row?.mediasURL">
      <a
        :href="row.mediasURL"
        target="_blank"
        class="px-2 py-1 ratio-1x1 bg-warning text-white rounded-circle"
        ><i class="bi bi-camera-fill"></i
      ></a>
    </template>
    <a
      target="_blank"
      href="https://www.instagram.com/cityhoopspanama/"
      class="px-2 py-1 ratio-1x1 bg-danger text-white rounded-circle"
      rel="nofollow"
      ><i class="bi bi-instagram"></i
    ></a>
    <a
      target="_blank"
      href="https://www.youtube.com/channel/UCfbHPjxsX3kJkk0Md4HYnVQ"
      class="px-2 py-1 ratio-1x1 bg-danger text-white rounded-circle"
      rel="nofollow"
      ><i class="bi bi-youtube"></i
    ></a>
  </div>
</template>
