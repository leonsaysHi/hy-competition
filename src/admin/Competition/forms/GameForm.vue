<script lang="ts" setup>
import type { Game, GameBoxScore, GameScores } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { ref, computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'
import ScoresInput from '@/admin/competition/games/components/ScoresInput.vue'
import BoxScoreInput from '@/admin/competition/games/components/BoxScoreInput.vue'
import AwardsInput from '@/admin/competition/components/AwardsInput.vue'
import type { AwardItem, PlayerBoxScore } from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import useLibs from '@/composable/useLibs'
import useCompetitionComputed from '@/composable/useCompetitionComputed'
import { useRoute } from 'vue-router'

const route = useRoute()
const { competitionId } = route.params
const { row, getCompetitionTeam: getCompetitionTeam } = useCompetitionComputed(competitionId)

const { getTeamName, getPlayerName } = useLibs()

interface IProps {
  value: FormData
  competitionTeams?: CompetitionTeam[]
  isBusy?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  isBusy: false,
  competitionTeams: () => []
})

type FormData = {
  id: string
  teams: TeamId[]
  datetime: string
  scores: GameScores
  boxscore: GameBoxScore
  awards: AwardItem[]
}

const getDefaultGame = (): Game => ({
  id: '',
  teams: [],
  datetime: '',
  scores: {},
  boxscore: {},
  awards: []
})
const getDefaultPlayerBoxScore = (): PlayerBoxScore => ({
  pts: 0,
  reb: 0,
  ast: 0,
  stl: 0,
  blk: 0,
  to: 0,
  pf: 0,
  m3pts: 0,
  dnp: false
})

const data = ref<FormData>({
  ...getDefaultGame(),
  ...props.value,
  scores: Array.isArray(props.value.teams)
    ? props.value.teams.reduce(
        (scores: GameScores, teamId: TeamId) => ({
          ...scores,
          [teamId]: props.value.scores[teamId] || [0]
        }),
        {}
      )
    : {},
  boxscore: Object.values(props.value.teams).reduce((boxscore: GameBoxScore, teamId: TeamId) => {
    const team: CompetitionTeam =
      props.competitionTeams.find((t: CompetitionTeam) => t.id === teamId) ||
      ({} as CompetitionTeam)
    const players: PlayerId[] =
      team.players.map((player: CompetitionPlayer): PlayerId => player.id) || []
    players.forEach((playerId: PlayerId) => {
      boxscore[playerId] = {
        ...getDefaultPlayerBoxScore(),
        ...(props.value.boxscore[playerId] || {})
      }
    })
    return boxscore
  }, {}),
  awards: []
})

const boxscoreByTeams = computed({
  get: (): { [key: TeamId]: GameBoxScore } => {
    return data.value.teams.reduce((acc, teamId) => {
      const team: CompetitionTeam = props.competitionTeams.find((t) => t.id === teamId)
      return {
        ...acc,
        [teamId]: team.players.reduce((boxscore: GameBoxScore, player) => {
          return {
            ...boxscore,
            [player.id]: data.value.boxscore[player.id]
          }
        }, {})
      }
    }, {})
  },
  set: (val) => {
    data.value.boxscore = val.reduce(
      (boxscore: GameBoxScore, bs: GameBoxScore) => ({
        ...boxscore,
        ...bs
      }),
      {}
    )
  }
})

const playersOptions = computed((): Option[] => {
  return Array.isArray(props.value.teams)
    ? props.value.teams
        .reduce((list: PlayerId[], teamId: TeamId) => {
          const team = getCompetitionTeam(teamId)
          return [
            ...list,
            ...(Array.isArray(team?.players)
              ? team.players.map((player: CompetitionPlayer) => player.id)
              : [])
          ]
        }, [])
        .map((playerId: PlayerId) => ({
          text: getPlayerName(playerId),
          value: playerId
        }))
    : []
})

const emit = defineEmits(['submit'])

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
    <hr />
    <FieldComp label="Scores">
      <ScoresInput v-model="data.scores" :teams="data.teams" :disabled="isBusy">
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
    <FieldComp label="Boxscore">
      <template v-for="(boxscore, teamId) in boxscoreByTeams" :key="teamId">
        <h3 class="mb-0">{{ getTeamName(teamId) }}</h3>
        <BoxScoreInput
          v-model="boxscoreByTeams[teamId]"
          :trackedStats="row?.trackedStats"
          :disabled="isBusy"
        />
      </template>
    </FieldComp>
    <hr />
    <FieldComp label="Awards">
      <AwardsInput v-model="data.awards" :players-options="playersOptions" :disabled="isBusy" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
