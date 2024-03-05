<script lang="ts" setup>
import SpinnerComp from '@/components/SpinnerComp.vue'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
const { isReady, rows: competitions } = useCompetitionsLib()
</script>
<template>
  <div>
    <h1>{{ $t('home.title') }}</h1>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
      <template v-if="!isReady">
        <SpinnerComp />
      </template>
      <template v-else>
        <template v-for="row in competitions" :key="row.id">
          <div class="col">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ row.title }}</h5>
                <RouterLink
                  :to="{ name: 'competition', params: { competitionId: row.id } }"
                  class="btn btn-primary stretched-link"
                  >{{ $t('cta.view') }}</RouterLink
                >
              </div>
              <div class="card-footer">
                <small class="text-body-secondary">{{ $t('home.lastUpdate') }} {{ row.lastUpdate }}</small>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
