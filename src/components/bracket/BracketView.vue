<template>
  <div class="w-100 overflow-x-auto">
    <div class="bracket mb-4" :style="gridStyle">
      <template v-for="(matchup, rIdx) in matchups" :key="rIdx">
        <div class="matchup d-flex align-items-center" :style="matchup.matchupStyleObj">
          <template v-if="matchup.roundIdx > 0">
            <span class="border-top pe-2" />
          </template>
          <template v-if="matchup">
            <div class="d-flex py-2 flex-grow-1">
              <Matchup
                class="flex-grow-1"
                :matchup="matchup"
                :is-final="matchup.isFinal"
                :selected-winners="selectedWinners"
                @select-winner="(teamId: TeamId) => handleSelectMatchupWinner(matchup, teamId)"
              />
            </div>
          </template>
          <template v-if="!matchup.isFinal">
            <span
              class="pe-2 border-top"
              :class="{
                'h-50 align-self-start border-bottom border-top-0 border-end':
                  matchup.roundGameIdx % 2,
                'h-50 align-self-end border-end': !(matchup.roundGameIdx % 2)
              }"
            />
          </template>
        </div>
        <span class="border-end" :style="matchup.vrStyleObj" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Matchup from './BracketMatchup.vue'
import type { Bracket, BracketMatchup, BracketRound } from '@/types/competitions'
import type { TeamId } from '@/types/teams'
import type { BracketSelection } from '@/cityhoops/views/brackets/CreateView.vue'

interface IProps {
  bracket: Bracket | undefined
  selectedWinners?: BracketSelection
}
const props = withDefaults(defineProps<IProps>(), {
  selectedWinners: undefined
})

const emit = defineEmits(['select-winner'])

const gridTotalRows = computed(() => {
  return Array.isArray(rounds.value) && Array.isArray(rounds.value[0]) ? rounds.value[0].length : 0
})

const rounds = computed<Bracket>(() => {
  let matchupRowSpan = 1
  return Array.isArray(props.bracket)
    ? props.bracket.map((round: BracketRound) => {
        matchupRowSpan *= 2
        return round.map((matchup: BracketMatchup) => {
          const { roundIdx, roundGameIdx, isFinal } = matchup
          const rowIdx = roundGameIdx * matchupRowSpan + (matchupRowSpan - 2) * 0.5
          const vrStyleObj: { [key: string]: string } =
            roundGameIdx % 2 == 0 && !isFinal && matchupRowSpan > 2
              ? {
                  gridArea:
                    'row' +
                    (rowIdx + 3) +
                    ' / round' +
                    roundIdx +
                    ' / span ' +
                    (matchupRowSpan - 2) +
                    ' / span 1'
                }
              : { display: 'none' }

          const matchupStyleObj = {
            gridArea: 'row' + (rowIdx + 1) + ' / round' + roundIdx + ' / span 2' + ' / span 1'
          }
          return {
            ...matchup,
            vrStyleObj,
            matchupStyleObj
          }
        })
      })
    : []
})

const matchups = computed<BracketMatchup[]>(() => {
  return Array.isArray(rounds.value) ? rounds.value.flat() : []
})

const gridStyle = computed(() => {
  const rowsCount = gridTotalRows.value * 2
  return {
    minWidth: rounds.value.length * 250 + 'px',
    gridTemplateColumns: rounds.value
      .map((r, rIdx) => '[round' + rIdx + '] minmax(0,1fr)')
      .join(' '),
    gridTemplateRows: new Array(rowsCount)
      .fill(null)
      .map((r, rIdx) => '[row' + (rIdx + 1) + '] minmax(0,1fr)')
      .join(' ')
  }
})

const handleSelectMatchupWinner = (matchup: BracketMatchup, teamId: TeamId) => {
  emit('select-winner', matchup, teamId)
}
</script>

<style lang="scss" scoped>
.bracket {
  display: grid;
}
</style>
