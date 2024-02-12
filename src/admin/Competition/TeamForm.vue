<script lang="ts" setup>
import type { Team, CompetitionTeam, TeamId } from '@/types/teams'
import { TeamsKey, PlayersKey } from '@/types/symbols'
import { ref, inject, watch, computed } from 'vue'
import type { Ref } from 'vue'
import ButtonComp from '@/components/ButtonComp.vue'
import TypeaheadSelectComp from '@/components/TypeaheadSelectComp.vue'
import PlayersSelect from './components/PlayersSelect.vue'
import type { CompetitionPlayer, Player, PlayerId } from '@/types/players'
interface IProps {
  row?: CompetitionTeam | undefined | null
  teams?: CompetitionTeam[] | undefined
}
const props = withDefaults(defineProps<IProps>(), {
  row: undefined,
  teams: () => []
})

type TeamForm = {
  id: TeamId | undefined
  sponsor: string | undefined
  players: CompetitionPlayer[]
}
const dataDefault: TeamForm = {
  id: undefined,
  sponsor: undefined,
  players: [],
}
const data = ref<TeamForm>({
  ...dataDefault
})

const emit = defineEmits(['done'])

const teamsLib = inject(TeamsKey)
const playersLib = inject(PlayersKey)

const teamsOptions = computed(() => {
    return teamsLib?.value
        ? teamsLib.value
            .filter((row:Team) => {
                return !props.teams?.findIndex((team: CompetitionTeam) => row.id === team.id)
            })
            .map((row: Team) => ({
                text: row.title,
                value: row.id,
            }))
        : []
})
const playersOptions = computed(() => {
    return playersLib?.value
        ? playersLib.value
            .filter((row: Player) => {
                return !props.teams
                  .find(team => team.players
                    .find(player => player.id === row.id)
                  )
            })
            .map((row: Player) => {
              return {
                text: [row.fname, row.lname].join(' '),
                value: row.id,
              }
            })
        : []
})
watch(
  () => props.row,
  (team) => {
    if (team?.id) {
      data.value = { ...dataDefault, ...team }
    } else if (team === undefined) {
      data.value = { ...dataDefault }
    }
  }
)

const handleSubmit = async (ev: Event) => {
  ev.preventDefault()
  
}
const handleCancel = () => emit('done')
</script>
<template>
  <form @submit="handleSubmit">
    <p class="small text-muted">{{ data.id || 'n/a' }}</p>
    <TypeaheadSelectComp v-model="data.id" :options="teamsOptions" label="Team" />
    <PlayersSelect v-model="data.players" :options="playersOptions" label="Players" />
    <div class="d-flex justify-content-end gap-2">
      <ButtonComp variant="light" @click="handleCancel">Cancel</ButtonComp>
      <ButtonComp variant="primary" type="submit">Save</ButtonComp>
    </div>
  </form>
</template>
@/composable/useTeams
