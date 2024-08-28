<script lang="ts" setup>
import useCompetition from '@/composable/useCompetition'
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
import { useRoute, RouterLink } from 'vue-router'
import PhaseGroups from './components/PhaseGroups.vue'
import { formatDate } from '@/utils/dates'
import { compareDesc } from 'date-fns'
import { computed } from 'vue'
import type { Phase } from '@/types/competitions'
const route = useRoute()
const { competitionId } = route.params
const { isReady: isLibsReady } = useLibs()
const { isReady: isRowReady, row } = useCompetition(competitionId)

const items = computed<{ idx: Number, phase: Phase }[]>(() => {
  const items = Array.isArray(row.value?.phases) 
    ? row.value.phases
      .map((phase: Phase, idx: Number) => ({
        idx,
        phase
      }))
    : []
  items.sort((a, b) =>  {
    return compareDesc(a.phase.datetime, b.phase.datetime)
  })
  return items
})
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
      <div class="mb-3 d-flex justify-content-center">
        <RouterLink class="btn btn-primary" :to="{ name: 'admin-competition-edit-phase' }"
          >Initiate new phase</RouterLink
        >
      </div>
      <template v-for="(item, itemIdx) in items" :key="item.idx">
        <div class="card mb-3" :class="{ 'border-primary': itemIdx === 0 }">
          <div class="card-header d-flex gap-3">
            <h5 class="mb-0">
              <template v-if="itemIdx === 0">
                <span class="badge text-bg-primary">Current phase</span>
              </template>
              {{  item.phase.title }}
            </h5>
            <RouterLink :to="{ name: 'admin-competition-edit-phase', params: { phaseIdx: item.idx } }" class="ms-auto btn btn-light border">Edit</RouterLink>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title">Type: {{ item.phase.type }}</h5>
              <small>Started on {{ formatDate(item.phase.datetime).full }}</small>
            </div>
            <PhaseGroups :value="item.phase.groups" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
