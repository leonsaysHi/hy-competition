<template>
  <div
    class="row row-cols-1 g-2"
    :class="{ 'row-cols-md-2': value.length >= 2, 'row-cols-lg-3': value.length >= 3 }"
  >
    <template v-for="(group, gIdx) in value" :key="gIdx">
      <div class="col">
        <div class="card">
          <div class="card-header text-center">
            <strong>{{ group.name }}</strong>
          </div>
          <ul class="list-group list-group-flush">
            <template v-for="teamId in group.teams" :key="teamId">
              <li class="list-group-item d-flex justify-content-between gap-3">
                <span>{{ getTeamName(teamId) }}</span>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import useLibs from '@/composable/useLibs'
import type { PhaseGroup } from '@/types/competitions';

const { getTeamName } = useLibs()

interface IProps {
  value: PhaseGroup[]
}
withDefaults(defineProps<IProps>(), {})
</script>
