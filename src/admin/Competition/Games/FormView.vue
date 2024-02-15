<script lang="ts" setup>
import type { Game, GameBoxScore, GameScores } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { inject, ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import { useRoute } from 'vue-router'
import { CompetitionKey } from '@/types/symbols'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'
import ScoresInput from './components/ScoresInput.vue'
import BoxscoreInput from './components/BoxscoreInput.vue'
import AwardsInput from '../components/AwardsInput.vue'
import useCompetitions from '@/composable/useCompetitions'
import type { PlayerBoxScore } from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'

const route = useRoute()
const { competitionId, gameId } = route.params
const competition = inject(CompetitionKey)

const { addRowGame: updateCompetitionGameDoc } = useCompetitions()

type FormData = {
  id: string
  teams: TeamId[]
  datetime: string
  scores: GameScores
  boxscore: {}
  awards: []
}
const getDefaultGame = (): Game => ({
  id: '',
  teams: [],
  datetime: '',
  scores: {},
  boxscore: {},
  awards: []
})
const getDefaultStats = ():PlayerBoxScore => ({
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  to: 0,
  pf: 0,
  m3pts: 0,
  dnp: false,
})
const game: Game =
  competition?.value?.games?.find((game: Game) => game.id === gameId) || getDefaultGame()

const data = ref({
  ...(game as FormData),
  // build scores from teams:
  scores: game.teams.reduce(
    (scores: GameScores, teamId: TeamId) => ({
      ...scores,
      [teamId]: Array.isArray(game?.scores?.[teamId]) ? game?.scores[teamId] : [0]
    }),
    {}
  ),
  // build boxscore from players:
  boxscore: Object.values(game.teams)
  .reduce(
    (boxscore: GameBoxScore, teamId: TeamId) => {

      const team: CompetitionTeam = competition?.value?.teams?.find((t:CompetitionTeam) => t.id === teamId) || {} as CompetitionTeam
      const players: PlayerId[] = team.players.map((player: CompetitionPlayer):PlayerId => player.id) || []

      players.forEach((playerId: PlayerId) => {
        boxscore[playerId] = {
          ...getDefaultStats(),
          ...(game.boxscore[playerId] || {}),
        }
      })
      return boxscore
    }, {})
})

const isGameBusy = ref(false)
const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  isGameBusy.value = true
  await updateCompetitionGameDoc(competitionId, data.value)
  isGameBusy.value = false
}
</script>
<template>
  <form @submit="handleSubmit">
    <h5>Edit</h5>
    <h4>{{ data.teams.join(' &times; ') }}</h4>
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <form @submit="handleSubmit">
      {{ data }}
      <FieldComp label="Date & time">
        <InputComp v-model="data.datetime" type="datetime-local" required />
      </FieldComp>
      <hr />
      <FieldComp label="Scores">
        <ScoresInput v-model="data.scores" :teams="data.teams" required>
          <template #team1>
            <template v-for="(scores, teamId, idx) in data.scores">
              <template v-if="!idx">{{ teamId }}</template>
            </template>
          </template>
          <template #team2>
            <template v-for="(scores, teamId, idx) in data.scores">
              <template v-if="idx">{{ teamId }}</template>
            </template>
          </template>
        </ScoresInput>
      </FieldComp>
      <hr />
      <FieldComp label="Boxscore">
        <BoxscoreInput v-model="data.boxscore" />
      </FieldComp>
      <hr />
      <FieldComp label="Awards">
        <AwardsInput v-model="data.awards" />
      </FieldComp>
      <div class="d-flex justify-content-end gap-2">
        <ButtonComp variant="primary" type="submit">Save</ButtonComp>
      </div>
    </form>
  </form>
</template>
@/composable/useTeams
