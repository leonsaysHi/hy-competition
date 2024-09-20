<script lang="ts" setup>

import DropdownComp from '@/components/DropdownComp.vue'
import RadioGroupComp from '@/components/RadioGroupComp.vue'
import useCompetitionPhasesGroups from '@/composable/useCompetitionPhasesGroups'
import { computed } from 'vue';

const {
  selectedPhaseIdx,
  phasesOptions,
  selectedGroupIdx,
  groupsOptions
} = useCompetitionPhasesGroups()

const showPhasesSelect = computed(() => Array.isArray(phasesOptions.value))
const disabledPhasesSelect = computed(() => Array.isArray(phasesOptions.value) && phasesOptions.value.length <= 1)
const showGroupsButtons = computed(() => Array.isArray(groupsOptions.value) && groupsOptions.value.length > 1)

</script>
<template>
  <div class="hstack gap-3">
    <template v-if="showPhasesSelect">
      <DropdownComp
        v-model="selectedPhaseIdx"
        :options="phasesOptions"
        variant="light"
        size="lg"
        class="fw-bold fz-5"
        :disabled="disabledPhasesSelect"
      />
    </template>
    <template v-if="showGroupsButtons">
      <RadioGroupComp 
        v-model="selectedGroupIdx" 
        :options="groupsOptions"
        buttons 
      />
    </template>
  </div>
</template>
