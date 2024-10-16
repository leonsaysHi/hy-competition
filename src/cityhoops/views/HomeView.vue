<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import type { Competition } from '@/types/competitions'
import { formatDistanceToNow } from 'date-fns'
import { computed } from 'vue'
const { isReady, rows } = useCompetitionsLib()

const currentItems = computed(() => {
  return rows.value?.filter((row: Competition) => row.isActive && !row.isOver)|| []
}) 

const pastItems = computed(() => {
  return rows.value?.filter((row: Competition) => row.isActive && row.isOver)|| []
}) 

</script>
<template>
  <div>
    <h1>{{ $t('home.title') }}</h1>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
      <template v-if="!isReady">
        <SpinnerComp />
      </template>
      <template v-else>
        
        <h5>Current competitions</h5>
        <template v-if="!currentItems?.length">
          <p>Ningun liga ahora.</p>
        </template>
        <template v-else>
          <template v-for="row in currentItems" :key="row.id">
            <div class="col">
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">{{ row.title }}</h5>
                  <RouterLink
                    :to="{ name: 'competition', params: { competitionId: row.id } }"
                    class="stretched-link btn btn-primary stretched-link"
                    >{{ $t('cta.view') }}</RouterLink
                  >
                </div>
                <div class="card-footer">
                  <small class="text-body-secondary"
                    >{{ $t('home.lastUpdate') }} {{ formatDistanceToNow(row.lastUpdate) }}</small
                  >
                </div>
              </div>
            </div>
          </template>
        </template>

        <h5>Past competitions</h5>
        <template v-if="!currentItems?.length">
          <p>Ningun liga pasada.</p>
        </template>
        <template v-else>
          <template v-for="row in pastItems" :key="row.id">
            <div class="col">
              <div class="card h-100">
                <div class="card-body">
                  <h5 class="card-title">{{ row.title }}</h5>
                  <RouterLink
                    :to="{ name: 'competition', params: { competitionId: row.id } }"
                    class="stretched-link btn btn-primary stretched-link"
                    >{{ $t('cta.view') }}</RouterLink
                  >
                </div>
                <div class="card-footer">
                  <small class="text-body-secondary"
                    >{{ $t('home.lastUpdate') }} {{ formatDistanceToNow(row.lastUpdate) }}</small
                  >
                </div>
              </div>
            </div>
          </template>
        </template>

      </template>
    </div>
  </div>
</template>
