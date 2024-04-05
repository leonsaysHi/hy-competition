<script lang="ts" setup>
import type { Game, GameDocBoxScore, GameDocScores, GameId } from '@/types/games'
import type { CompetitionTeam, TeamId } from '@/types/teams'
import { ref, computed } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import FieldComp from '@/components/FieldComp.vue'
import InputComp from '@/components/InputComp.vue'
import ScoresInput from '@/admin/competition/games/components/ScoresInput.vue'
import StatsSheetInput from '@/admin/competition/games/components/StatsSheetInput.vue'
import BoxScoreInput from '@/admin/competition/games/components/BoxScoreInput.vue'
import AwardsInput from '@/admin/competition/components/AwardsInput.vue'
import type { AwardItem, PlayerStatKey } from '@/types/stats'
import type { CompetitionPlayer, PlayerId } from '@/types/players'
import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import { useRoute } from 'vue-router'
import type { CompetitionId } from '@/types/competitions'
import CheckComp from '@/components/CheckComp.vue'
import useOptionsLib from '@/composable/useOptionsLib'

const route = useRoute()
const { competitionId } = route.params as { competitionId: CompetitionId; gameId: GameId }
const { row, getCompetitionTeam: getCompetitionTeam } = useCompetition(competitionId)
const { getTeamName, getPlayerName } = useLibs()
const { playerStatsSheetKeys } = useOptionsLib()
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
  scores: GameDocScores
  boxscore: GameDocBoxScore
  awards: AwardItem[]
  isFinished: boolean
  isLive: boolean
}
const getDefaultGame = (): Game => ({
  id: '',
  teams: [],
  datetime: '',
  scores: {},
  boxscore: {},
  awards: [],
  isFinished: false,
  isLive: false
})

const data = ref<FormData>({
  ...getDefaultGame(),
  ...props.value,
  awards: props.value.awards
})

const boxscoreByTeams = computed({
  get: (): { [key: TeamId]: GameDocBoxScore } => {
    return data.value.teams.reduce((acc, teamId) => {
      const team: CompetitionTeam = props.competitionTeams.find((t) => t.id === teamId)
      return {
        ...acc,
        [teamId]: team.players.reduce((boxscore: GameDocBoxScore, player) => {
          const bs = data.value.boxscore[player.id] || {}
          playerStatsSheetKeys.forEach((opt: Option) => {
            const key: PlayerStatKey = opt.value
            bs[key] = key in bs ? bs[key] : 0
          })
          return {
            ...boxscore,
            [player.id]: bs
          }
        }, {})
      }
    }, {})
  },
  set: (val) => {
    data.value.boxscore = val.reduce(
      (boxscore: GameDocBoxScore, bs: GameDocBoxScore) => ({
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

const handleResetStatsSheet = () => {
  const { boxscore, scores, isFinished, isLive } = getDefaultGame()
  data.value = {
    ...data.value,
    boxscore,
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
        <template v-for="(boxscore, teamId) in boxscoreByTeams" :key="teamId">
          <h3 class="mb-0">{{ getTeamName(teamId) }}</h3>
          <BoxScoreInput v-model="boxscoreByTeams[teamId]" :disabled="data.isFinished || isBusy" />
        </template>
      </FieldComp>
    </template>
    <hr />
    <FieldComp label="Awards">
      <AwardsInput v-model="data.awards" :players-options="playersOptions" :disabled="isBusy" />
    </FieldComp>
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="primary" type="submit" :is-busy="isBusy">Save</ButtonComp>
    </div>
  </form>
</template>
