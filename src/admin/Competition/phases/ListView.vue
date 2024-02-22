<script lang="ts" setup>
import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute, RouterLink } from 'vue-router'
import PhaseGroups from './components/PhaseGroups.vue'

const route = useRoute()
const { competitionId } = route.params
const { isReady: isLibsReady } = useLibs()
const { isReady: isRowReady, row } = useCompetition(competitionId)
</script>
<template>
  <div>
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item active" aria-current="page">Phases list</li>
      </ol>
    </nav>
    <template v-if="!isLibsReady || !isRowReady">
      <SpinnerComp />
    </template>
    <template v-else>
      <template v-if="row?.phases && row.phases.length">
        <template v-for="(phase, idx) in row.phases" :key="idx">
          <div class="card mb-3">
            <template v-if="idx === row.phases.length - 1">
              <div class="card-header d-flex justify-content-between align-items-end">
                <h5 class="mb-0">Current phase</h5>
                <small>Started on {{ phase.datetime }}</small>
              </div>
            </template>
            <div class="card-body">
              <h5 class="card-title">Type: {{ phase.type }}</h5>
              <PhaseGroups :value="phase.groups" />
            </div>
          </div>
        </template>
      </template>
      <div class="mb-3 d-flex justify-content-center">
        <RouterLink class="btn btn-primary" :to="{ name: 'admin-competition-edit-phase' }"
          >Initiate new phase</RouterLink
        >
      </div>
    </template>
  </div>
</template>
