<script lang="ts" setup>
import useLibs from '@/composable/useLibs'
import type { Option } from '@/types/comp-fields'
import { computed, ref } from 'vue'
import type { StatKey } from '@/types/stats'
import type { GameBoxScore } from '@/types/games'
import type { PlayerId } from '@/types/players'
interface IProps {
  boxscore: GameBoxScore
  statsOptions: Option[]
}

const { getPlayerName } = useLibs()

const props = withDefaults(defineProps<IProps>(), {})

const currentStatKey = ref<StatKey>(props.statsOptions[0].value as StatKey)

const statsLeaders = computed(() => {
  const boxscore = Object.keys(props.boxscore).map((playerId: PlayerId) => ({
    id: playerId,
    ...props.boxscore[playerId]
  }))

  const keyBoxscore = boxscore.slice()
  keyBoxscore.sort((a, b) => {
    const aKey = a[currentStatKey.value]
    const bKey = b[currentStatKey.value]
    return bKey - aKey
  })
  return keyBoxscore.slice(0, 5)
})
const getStatLong = (key: StatKey): string =>
  props.statsOptions.find((opt: Option) => opt.value === key)?.long
</script>
<template>
  <ul class="mb-3 nav nav-underline justify-content-center">
    <template v-for="opt in props.statsOptions" :key="opt.value">
      <li class="nav-item">
        <a
          class="nav-link"
          :class="[currentStatKey === opt.value && 'active']"
          :aria-current="currentStatKey === opt.value ? 'page' : false"
          href="#"
          @click="currentStatKey = opt.value"
          >{{ opt.long }}</a
        >
      </li>
    </template>
  </ul>
  <div class="row row-cols-1 row-cols-md-2 g-4">
    <div class="col">
      <div class="card">
        <div class="card-header">{{ getStatLong(currentStatKey) }}</div>
        <ul class="list-group list-group-flush">
          <template v-for="(row, idx) in statsLeaders" :key="idx">
            <li class="list-group-item d-flex gap-3 justify-content-between">
              <div>{{ getPlayerName(row.id) }}</div>
              <div>{{ row[currentStatKey] }}</div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
