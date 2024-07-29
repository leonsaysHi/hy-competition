<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import CompetitionStanding from '@/components/competitions/CompetitionStanding.vue'
import CompetitionRanking from '@/components/competitions/CompetitionRanking.vue'
import ViewHero from '../components/layout/ViewHero.vue'
import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import { computed } from 'vue'

const { selectedPhaseIdx, selectedPhase, phasesOptions, groupsOptions, selectedGroupIdx, selectedGroup } =
  useCompetitionPhasesGroups()

const overallRanking = computed<typeof CompetitionRanking[]>((): typeof CompetitionRanking[] => {
  return groupsOptions.value?.reduce((acc: typeof CompetitionRanking[], opt) => {
      const ranking = selectedPhase.value?.groups[Number(opt.value)]?.ranking || []
      return acc.concat(ranking)
    }, [])
})
</script>
<template>
  <div>
    <ViewHero>
      <h1>Tabla y estadística</h1>
    </ViewHero>
    <template v-if="!selectedGroup">
      <div class="py-5"><SpinnerComp /></div>
    </template>
    <template v-else>
      <div class="d-flex justify-content-between gap-3">
        <h2>Tabla: {{ selectedGroup.name }}</h2>
        <div>
          <template v-if="phasesOptions && phasesOptions.length > 1">
            <DropdownComp
              v-model="selectedPhaseIdx"
              :options="phasesOptions"
              variant="light"
              size="lg"
              class="fw-bold fz-5"
              :disabled="phasesOptions.length === 1"
            />
          </template>
          <template v-if="groupsOptions && groupsOptions.length > 1">
            <RadioGroupComp v-model="selectedGroupIdx" :options="groupsOptions" buttons button-variant="light" />
          </template>
        </div>
      </div>
      <CompetitionStanding :value="selectedGroup.standing" />
      <hr />
      <h2>Líderes por categorías</h2>
      <CompetitionRanking 
        :value="overallRanking" 
        :limit="25" 
        show-cumul 
      />
    </template>
  </div>
</template>
