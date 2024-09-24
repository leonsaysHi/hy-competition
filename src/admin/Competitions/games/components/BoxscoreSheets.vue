<script setup lang="ts">
import { computed, watch } from 'vue'
import type { GameDocBoxScore } from '@/types/games'
import TableComp from '@/components/TableComp.vue'
import InputComp from '@/components/InputComp.vue'
import CheckComp from '@/components/CheckComp.vue'

import useLibs from '@/composable/useLibs'
import useCompetition from '@/composable/useCompetition'
import type { Option } from '@/types/comp-fields'
import type { CompetitionPlayer, PlayerId } from '@/types/player'
import { useRoute } from 'vue-router'
import type { CompetitionTeam } from '@/types/team'
import type { CompetitionId } from '@/types/competitions'
import useStats from '@/composable/useStats'
import type { PlayerStatLine, PlayerStatLineKey } from '@/types/player-stats'

const route = useRoute()
const { competitionId } = route.params as { competitionId: CompetitionId }

const { getTeamName, getPlayerName} = useLibs()
const { trackedPlayerStatsKey } = useCompetition(competitionId)
const { getEmptyPlayerStatLine } = useStats()

interface IProps {
    modelValue: GameDocBoxScore
  competitionTeams: CompetitionTeam[]
  disabled?: boolean
}
const props = withDefaults(defineProps<IProps>(), {
  disabled: false
})

const fields = computed(() => {
  return [
    { key: 'number', label: '' },
    { key: 'name', label: 'Players' },
    ...trackedPlayerStatsKey.value.map(({ value: key, text: label }: Option) => (
      { key, label } 
    ))
  ]
})

const emit = defineEmits(['update:modelValue'])
const handleChange = () => {
    emit('update:modelValue', { ...props.modelValue })
}

interface LocalPlayer extends CompetitionPlayer, PlayerStatLine {
    name: String
    // id 
}
interface LocalTeam extends CompetitionTeam {
    players: LocalPlayer[]
}
const byTeams = computed<LocalTeam[]>(() => {
    return props.competitionTeams
      .map((team: CompetitionTeam) => {
        const players: LocalPlayer[] = team.players
            .map((player: CompetitionPlayer) => {
                const result: LocalPlayer = {
                    id: player.id,
                    number: player.number,
                    name: getPlayerName(player.id),
                    ...getEmptyPlayerStatLine(),
                    ...props.modelValue[player.id]
                }
                return result
            })
        const result:LocalTeam = {
            ...team,
            players
        }
        return result
      })
})
</script>

<template>
    <template v-for="team in byTeams">
        <h3 class="mb-0">{{ getTeamName(team.id) }}</h3>
        <TableComp :items="team.players" :fields="fields" small>
            <template #number="{ value }"
            ><div class="lh-1 fw-bold text-end">#{{ value }}</div></template
            >
            <template #name="{ value }"
            ><div class="lh-1">{{ value }}</div></template
            >
            <template #fta="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
                @input="handleChange"
            />
            </template>
            <template #ftm="{ key, item }">
                <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
                @input="handleChange"
            />
            </template>
            <template #fga="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #fgm="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #fg3a="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #fg3m="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #dreb="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #oreb="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #ast="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #stl="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #blk="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #blka="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #tov="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #fcm="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #fdr="{ key, item }">
            <InputComp
                v-model="props.modelValue[item.id][key]"
                type="number"
                size="sm"
                :disabled="item.dnp === 1 || disabled"
            />
            </template>
            <template #dnp="{ key, item }">
            <CheckComp
                v-model="props.modelValue[item.id][key]"
                :value="1"
                :uncheck-value="0"
                :disabled="disabled"
                switch
            ></CheckComp>
            </template>
        </TableComp>
    </template>
</template>
