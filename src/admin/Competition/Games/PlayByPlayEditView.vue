<script lang="ts" setup>
import { useRoute } from 'vue-router'

import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'

import usePlayByPlay from '@/composable/usePlayByPlay'
const { isReady: isLibsReady } = useLibs()

const route = useRoute()
const { competitionId, gameId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const { model } = usePlayByPlay(competitionId, gameId)

</script>
<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <RouterLink :to="{ name: 'admin-competition-games' }">Games list</RouterLink>
      </li>
      <li class="breadcrumb-item active" >
        <RouterLink :to="{ name: 'admin-competition-edit-game', params: { gameId } }">Edit game</RouterLink>
      </li>
      <li class="breadcrumb-item active" aria-current="page">Edit play-by-play</li>
    </ol>
  </nav>
  <template v-if="!isLibsReady || !model">
    <SpinnerComp />
  </template>
  <template v-else>
    Play by play edit {{ model.playStacks }}
  </template>
</template>
