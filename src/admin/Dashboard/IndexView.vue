<script lang="ts" setup>
import useLibs from '@/composable/useLibs'
import SpinnerComp from '@/components/SpinnerComp.vue'
const { isReady, competitionsRows: rows } = useLibs()
</script>
<template>
  <div>
    <h1>Dashboard</h1>
    <h4>All competitions list:</h4>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
      <template v-if="!isReady">
        <SpinnerComp />
      </template>
      <template v-else>
        <template v-for="row in rows" :key="row.id">
          <div class="col">
            <div class="card h-100">
              <div class="card-body">
                <h5 class="card-title">{{ row.title }}</h5>
                <RouterLink
                  :to="{ name: 'admin-competition-home', params: { competitionId: row.id } }"
                  class="btn btn-primary"
                  >View</RouterLink
                >
              </div>
              <div class="card-footer">
                <small class="text-body-secondary">{{
                  row.isActive ? 'Active' : 'Inactive'
                }}</small>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
