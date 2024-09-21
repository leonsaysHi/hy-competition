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
                :disabled="disabled"
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
import type GameComputedClass from '@/models/GameComputed';
import type { CompetitionTeam } from '@/types/team';
import useBracket from '@/composable/useBracket';

interface IProps {
  games?: GameComputedClass[]
  teams?: CompetitionTeam[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  games: () => [],
  teams: () => [],
  disabled: false
})

const { getBracketForGames } = useBracket()
const bracket = computed(() => {
  return getBracketForGames(props.teams, props.games)
})


const gridTotalRows = computed(() => {
  return Array.isArray(rounds.value) && Array.isArray(rounds.value[0]) ? rounds.value[0].length : 0
})

const rounds = computed<Bracket>(() => {
  let matchupRowSpan = 1
  return Array.isArray(bracket.value)
    ? bracket.value.map((round: BracketRound) => {
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

</script>

<style lang="scss" scoped>
.bracket {
  display: grid;
}
</style>
