<script lang="ts" setup>
import type { Game, GameDocBoxScore, GameId } from '@/types/games'
import type { CompetitionTeam } from '@/types/team'
import { computed, ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'
import ScoresInput from '@/admin/Competitions/games/components/ScoresInput.vue'
import StatsSheetInput from '@/admin/Competitions/games/components/StatsSheetInput.vue'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'
import type { CompetitionId } from '@/types/competitions'
import CheckComp from '@/components/CheckComp.vue'
import BoxscoreSheets from '../games/components/BoxscoreSheets.vue'
import type { CompetitionPlayer, PlayerId } from '@/types/player'
import useStats from '@/composable/useStats'

const route = useRoute()
const { competitionId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const { row } = useCompetition(competitionId)
const { getTeamName } = useLibs()
const { getEmptyPlayerStatLine } = useStats()

interface IProps {
  value: Game
  competitionTeams?: CompetitionTeam[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false,
  competitionTeams: () => []
})

const getEmptyBoxscore = ():GameDocBoxScore => {
  return Array.isArray(props.competitionTeams)
    ? props.competitionTeams
      .reduce((result: PlayerId[], team: CompetitionTeam) => {
        const players: PlayerId[] = team.players.map((player: CompetitionPlayer) => player.id as PlayerId)
        result.push(...players)
        return result
      }, [] as PlayerId[])
      .reduce((result: GameDocBoxScore, playerId: PlayerId) => {
          result[playerId] = getEmptyPlayerStatLine()
          return result
        }, 
        {} as GameDocBoxScore
      )
    : {}
}

const getDefaultGame = (): Game => ({
  datetime: '',
  scores: {},
  boxscore: getEmptyBoxscore(),
  isFinished: false,
  isLive: false
} as Game)

const data = ref<Game>({
  ...getDefaultGame(),
  ...props.value
} as Game)


const boxscoreTeams = computed(() => {
  return props.competitionTeams
    .filter((team: CompetitionTeam) => props.value.teams.includes(team.id))
})

const emit = defineEmits(['submit'])

const handleResetStatsSheet = () => {
  const { scores, isFinished, isLive } = getDefaultGame()
  data.value = {
    ...data.value,
    boxscore: getEmptyBoxscore(),
    scores,
    isFinished,
    isLive
  }
  emit('submit', data.value)
}
const handleSubmit = (ev: Event) => {
  ev.preventDefault()
  emit('submit', data.value)
}
</script>
<template>
  <form @submit="handleSubmit">
    <FieldComp label="Date & time">
      <InputComp v-model="data.datetime" type="datetime-local" :disabled="isBusy" required />
    </FieldComp>
    <FieldComp label="Game statuses">
      <CheckComp v-model="data.isFinished" switch
        >Is finished
        <small class="lh-1 text-body-secondary"
          >(Can't edit/delete Finished games)</small
        ></CheckComp
      >
      <CheckComp v-model="data.isLive" switch>Is live</CheckComp>
    </FieldComp>
    <hr />
    <template v-if="row?.statsInput === 'sheet'">
      <FieldComp label="Record box-score">
        <StatsSheetInput :disabled="data.isFinished" @reset-stats-sheet="handleResetStatsSheet" />
      </FieldComp>
      <FieldComp label="Scores">
        <ScoresInput
          v-model="data.scores"
          :teams="data.teams"
          :disabled="data.isFinished || isBusy"
        >
          <template #team1>
            <template v-for="(scores, teamId, idx) in data.scores">
              <template v-if="!idx">{{ getTeamName(teamId) }}</template>
            </template>
          </template>
          <template #team2>
            <template v-for="(scores, teamId, idx) in data.scores">
              <template v-if="idx">{{ getTeamName(teamId) }}</template>
            </template>
          </template>
        </ScoresInput>
      </FieldComp>
      <hr />
      
      <FieldComp label="Boxscore sheet">
        <BoxscoreSheets
          v-model="data.boxscore" 
          :competition-teams="boxscoreTeams"
          :disabled="data.isFinished || isBusy"
        />
      </FieldComp>
    </template>
    <hr />
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
