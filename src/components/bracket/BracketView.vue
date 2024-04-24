<template>
  <div
    class="bracket mb-4"
    :style="gridStyle"
  >
    <template v-for="(matchup, rIdx) in matchups" :key="rIdx">
      <div
        class="matchup d-flex align-items-center"
        :style="matchup.matchupStyleObj"
      >
        <template v-if="matchup.roundIdx > 0">
          <span class="border-top pe-2" />
        </template>
        <template v-if="matchup">
          <div class="d-flex py-2 flex-grow-1">
            <Matchup
              class="flex-grow-1"
              :matchup="matchup"
              :is-final="matchup.isFinal"
            />
          </div>
        </template>
        <template v-if="!matchup.isFinal">
          <span
            class="pe-2 border-top"
            :class="{ 'h-50 align-self-start border-bottom border-top-0 border-end': matchup.roundGameIdx%2, 'h-50 align-self-end border-end': !(matchup.roundGameIdx%2) }" 
          />
        </template>
      </div>
    </template>
  </div>
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import Matchup from './BracketMatchup.vue'
import type { CompetitionGroupComputed } from '@/types/computed';
import type GameComputedClass from '@/models/GameComputed';
import type { Bracket, BracketMatchup, BracketRound } from '@/types/competitions';

interface IProps {
  group: CompetitionGroupComputed
}
const props = withDefaults(defineProps<IProps>(), {})

const rounds = computed<Bracket>(() => {
  let teamsLength = props.group.standing.length
  const games = props.group.games.slice()
  const rounds:Bracket = []
  let matchupIdx = 0
  while(teamsLength > 1) {
    teamsLength *= .5
    const roundGames: GameComputedClass[]  = games.splice(0, teamsLength)
    while (roundGames.length < teamsLength) {
      roundGames.push({} as GameComputedClass)
    }
    const round: BracketRound = roundGames
      .map((game: GameComputedClass, roundGameIdx): BracketMatchup => {
        matchupIdx++
        const rowIdx = roundGameIdx * 2 + 1 + rounds.length
        const roundIdx = rounds.length
        const matchupStyleObj = {
          gridArea: 'row' + rowIdx +
          ' / round' + roundIdx +
          ' / span 2' +
          ' / span 1'
        }
        return {
          ...game as GameComputedClass,
          matchupIdx,
          roundIdx,
          roundGameIdx,
          isFinal: teamsLength <= 1,
          matchupStyleObj,
          winnersFrom: !game.id && roundIdx > 0
            ? [(roundGameIdx * 2), (roundGameIdx * 2) + 1]
              .map((idx: number) => {
                return rounds[roundIdx - 1][idx].matchupIdx
              })
            : [undefined, undefined]
            
        }
      })
    rounds.push(round)
  }
  return rounds
})
const gridMaxRowsLength = computed(() => {
  return Array.isArray(rounds.value) && Array.isArray(rounds.value[0])
    ? rounds.value[0].length
    : 0
})

const matchups = computed(() => {
  return Array.isArray(rounds.value) 
    ? rounds.value
      .flat()
    : []
})

/*
    const fullRound = props.bracket
      .reduce((acc, m, idx, arr) => {
        acc.push({
          ...m,
          straightMatchup: idx > 0 && arr[idx - 1].isBye
        })
        return acc
      }, [])
    const round = fullRound.filter(m => !m.isBye)
    const roundIdx = bracket.length
    const isFinalRound = roundIdx === bracket.length - 1
    if (isFinalRound) {
      const thirdPlaceMatchupIdx = round.findIndex(m => m.is3rdPlaceGame)
      if (thirdPlaceMatchupIdx > -1) {
        const m = round.splice(thirdPlaceMatchupIdx, 1)[0]
        const styleObj = {
          gridArea: 'row' + (gridMaxRowsLength.value + 1) +
          ' / round' + roundIdx +
          ' / span ' + 2 +
          ' / span 1'
        }
        matchups.push({
          ...m,
          styleObj
        })
      }
    }
    const matchupsLength = round.length
    const directMatchupLength = round.filter(m => m.pmIds && m.pmIds.filter(Boolean).length < 2).length
    const matchupsSpan = (gridMaxRowsLength.value - directMatchupLength * 2) / (matchupsLength - directMatchupLength)
    let rowIdx = 1
    let mDown = true
    matchups.push(...round
      .map((m, mIdx) => {
        const pmLength = roundIdx > 0 ? m.pmIds && m.pmIds.filter(Boolean).length : 1
        const rowSpan = pmLength < 2 ? 2 : matchupsSpan
        const styleObj = {
          gridArea: 'row' + (m.isFinal ? rowIdx + 1 : rowIdx) +
          ' / round' + roundIdx +
          ' / span ' + (m.isFinal ? rowSpan - 2 : rowSpan) +
          ' / span 1'
        }
        const hasPrevMatchup = m.pmIds && m.pmIds.filter(Boolean).length
        const hasNextMatchup = roundIdx < bracket.value.length - 1
        const hasNextMatchupWay = m.straightMatchup
          ? 'flat'
          : mDown
            ? 'down'
            : 'up'
        mDown = hasNextMatchupWay !== 'down'
        rowIdx += rowSpan
        return {
          ...m,
          hasPrevMatchup,
          hasNextMatchup,
          hasNextMatchupWay,
          styleObj
        }
      })
    )
  }
  return matchups
  */

const gridStyle = computed(() => {
    const rowsCount = gridMaxRowsLength.value * 2
    return {
      minWidth: (rounds.value.length * 250) + 'px',
      gridTemplateColumns: rounds.value.map((r, rIdx) => '[round' + rIdx + '] minmax(0,1fr)').join(' '),
      gridTemplateRows: new Array(rowsCount).fill(null).map((r, rIdx) => '[row' + (rIdx + 1) + '] minmax(0,1fr)').join(' ')
    }
})


</script>
  
  <style lang="scss" scoped>
  .bracket {
    display: grid;
  }
  </style>