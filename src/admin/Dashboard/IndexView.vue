<script lang="ts" setup>
import { inject } from 'vue'
import { CompetitionsKey } from '@/types/symbols'
const rows = inject(CompetitionsKey)
</script>
<template>
  <div>
    <h1>Dashboard</h1>
    <h4>All competitions list:</h4>
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
      <template v-for="row in rows" :key="row.id">
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ row.title }}</h5>
              <RouterLink
                :to="{ name: 'admin-competition', params: { competitionId: row.id } }"
                class="btn btn-primary"
                >View</RouterLink
              >
            </div>
            <div class="card-footer">
              <small class="text-body-secondary">Last updated 3 mins ago</small>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
