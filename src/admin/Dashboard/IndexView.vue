<script lang="ts" setup>
import useLibs from '@/composable/useLibs'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import ButtonComp from '@/components/ButtonComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import ModalComp from '@/components/ModalComp.vue'
import { computed, ref } from 'vue'
import CompetitionForm from '@/admin/competition/forms/CompetitionForm.vue'
import { formatDistanceToNow, compareAsc } from 'date-fns'
import type { Competition } from '@/types/competitions'
const { isReady, competitionsRows: rows } = useLibs()
const { add } = useCompetitionsLib()

const competitionsList = computed(() => {
  const result = Array.isArray(rows.value) ? rows.value.slice() : []
  result.sort((a: Competition, b: Competition) => compareAsc(a.lastUpdate, b.lastUpdate))
  return result
})

const addModal = ref<typeof ModalComp>()
const newCompetitiondata = ref()
const handleShowCompetitionForm = () => {
  newCompetitiondata.value = {}
  addModal.value?.show()
}

const handleCreate = async (payload) => {
  await add(payload)
  addModal.value?.hide()
  newCompetitiondata.value = undefined
}
</script>
<template>
  <div>
    <h1>Dashboard</h1>
    <h4>All competitions list:</h4>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-2">
      <div class="col d-flex">
        <ButtonComp
          variant="primary"
          class="flex-grow-1 align-items-stretch"
          @click="handleShowCompetitionForm"
        >
          <div class="flex-grow-1 d-flex flex-column justify-content-center">
            <span class="fs-1 lh-1">+</span>Create<br />new Competition
          </div>
        </ButtonComp>
      </div>
      <template v-if="!isReady">
        <SpinnerComp />
      </template>
      <template v-else>
        <template v-for="row in competitionsList" :key="row.id">
          <div class="col d-flex">
            <div
              class="card flex-grow-1"
              :class="{ 'border-primary': row.isActive, 'border-secondary': !row.isActive }"
            >
              <div class="card-body">
                <h5 class="card-title">{{ row.title }}</h5>
                <RouterLink
                  :to="{ name: 'admin-competition-home', params: { competitionId: row.id } }"
                  class="btn btn-primary stretched-link"
                  >View</RouterLink
                >
              </div>
              <div class="card-footer d-flex justify-content-between align-items-end gap-3">
                <small class="text-body-secondary"
                  >Last update: {{ formatDistanceToNow(row.lastUpdate) }} ago</small
                >
                <span
                  class="small badge"
                  :class="{ 'text-bg-primary': row.isActive, 'text-bg-secondary': !row.isActive }"
                >
                  {{ row.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
    <ModalComp ref="addModal" title="Create new competition" hide-footer>
      <template v-if="newCompetitiondata">
        <CompetitionForm :value="newCompetitiondata" @submit="handleCreate" />
      </template>
    </ModalComp>
  </div>
</template>
