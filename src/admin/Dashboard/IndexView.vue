<script lang="ts" setup>
import useLibs from '@/composable/useLibs'
import useCompetitionsLib from '@/composable/useCompetitionsLib'
import ButtonComp from '@/components/ButtonComp.vue'
import SpinnerComp from '@/components/SpinnerComp.vue'
import ModalComp from '@/components/ModalComp.vue';
import { ref } from 'vue';
import CompetitionForm from '@/admin/competition/forms/CompetitionForm.vue';
const { isReady, competitionsRows: rows } = useLibs()
const { add } = useCompetitionsLib()

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
    <div class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-2">
      <div class="col d-flex ">
        <ButtonComp
          variant="primary"
        class="d-flex flex-column align-items-center justify-content-center"
        @click="handleShowCompetitionForm"
          >
          <h1>+</h1>
          <p>Create new Competition</p>
        </ButtonComp>
      </div>
      <template v-if="!isReady">
        <SpinnerComp />
      </template>
      <template v-else>
        <template v-for="row in rows" :key="row.id">
          <div class="col d-flex">
            <div class="card flex-grow-1">
              <div class="card-body">
                <h5 class="card-title">{{ row.title }}</h5>
                <div class="d-flex justify-content-end">
                  <RouterLink
                    :to="{ name: 'admin-competition-home', params: { competitionId: row.id } }"
                    class="btn btn-primary"
                    >View</RouterLink
                  >
                </div>
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
    <ModalComp ref="addModal" Title="Create new competition">
      <template v-if="newCompetitiondata">
        <CompetitionForm 
          :value="newCompetitiondata" 
          @submit="handleCreate" 
        />
      </template>
    </ModalComp>
  </div>
</template>
