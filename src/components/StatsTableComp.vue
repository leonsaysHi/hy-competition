<template>
    <TableComp 
        :fields="fields" 
        :items="items"
        :footer="footerItem"
        :sorted-key="sortedKey"
        :sorted-direction="sortedDirection" 
        small
        showEmpty
    >
        <template #isWin="{ value }">
            <span :class="value ? 'text-win' : 'text-loss'">{{ value ? 'W' : 'L' }}</span>
        </template>
        <template #teamId="{ value }">
            <div class="d-flex gap-2 align-items-center lh-1">
                <template v-if="showLogo">
                    <TeamLogo :team-id="value" :size="35" />
                </template>
                <span class="jersey-team">{{ getTeamName(value) }}</span>
            </div>
        </template>
        <template #competitionId="{ value }">
          <RouterLink
            class="d-flex flex-column align-items-start text-decoration-none"
            :to="{ name: 'competition', params: { competitionId: value } }"
          >
            <div>{{ getCompetition(value)?.title }}</div>
            <div class="d-flex gap-3 small text-body-secondary text-nowrap">
              <small>{{ getCompetition(value)?.date }}</small>
              <small>{{ getCategory(getCompetition(value)?.category)?.text }}</small>
            </div>
          </RouterLink>
        </template>
        <template #number="{ value }"><span class="text-body-secondary jersey-number">#{{ value }}</span></template>
        <template #id="{ value }"
        ><RouterLink
            class="d-flex align-items-center gap-2 link-dark link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover jersey-name"
            :to="{
            name: 'competition-player',
            params: { competitionId: competitionId, playerId: value }
            }"
        >
        {{ getPlayerName(value) }}
        </RouterLink></template
        >
        <template #pos="{ index }"
        >{{ index + 1 }}<sup>{{ getOrd(index + 1) }}</sup></template
        >
        <template #gp="{ value }">
            {{ value }}
        </template>
        <template #sec="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #pts="{ item }">
            {{ item.gp ? formatAvg(getAvg(getCalculated(item).pts, item.gp)) : item.ftm + 2 * item.fgm + 3 * item.fg3m }}
        </template>
        <template #ftm="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fta="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #ftprc="{ item }">
            {{ formatPerc(getCalculated(item).ftprc) }}
        </template>
        <template #fgm="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fga="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fgprc="{ item }">
            {{ formatPerc(getCalculated(item).fgprc) }}
        </template>
        <template #fg3m="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fg3a="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fg3prc="{ item }">
            {{ formatPerc(getCalculated(item).fg3prc) }}
        </template>
        <template #dreb="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #oreb="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #reb="{ item }">
            {{ item.gp ? formatAvg(getAvg(getCalculated(item).reb, item.gp)) : getCalculated(item).reb }}
        </template>
        <template #ast="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #stl="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #blk="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #blka="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #tov="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fcm="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #fdr="{ value, item }">
            {{ item.gp ? formatAvg(getAvg(value, item.gp)) : value }}
        </template>
        <template #footerid>
            <span class="fw-lighter">{{ t('global.total', 2) }}</span>
        </template>
        <template #footerftprc>
            {{ formatPerc(getCalculated(footerItem).ftprc) }}
        </template>
        <template #footerfgprc>
            {{ formatPerc(getCalculated(footerItem).fgprc) }}
        </template>
        <template #footerfg3prc>
            {{ formatPerc(getCalculated(footerItem).fg3prc) }}
        </template>
        <template #footerpts>
            {{ footerItem.ftm + 2 * footerItem.fgm + 3 * footerItem.fg3m }}
       </template>
       <template #footerreb>
            {{ footerItem.oreb + footerItem.dreb }}
       </template>
    </TableComp>
</template>

<script setup lang="ts">
import type { TableField, TableItem } from '@/types/comp-table'
import type { Option } from '@/types/comp-fields'
import TableComp from '@/components/TableComp.vue'
import TeamLogo from '@/components/teams/TeamLogo.vue'
import { computed } from 'vue'
import { getAvg, getPerc, formatAvg, formatPerc, getOrd } from '@/utils/maths'
import useLibs from '@/composable/useLibs';
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useOptionsLib from '@/composable/useOptionsLib'
const { t } = useI18n()

interface IProps {
  fields: TableField[]
  items: TableItem[]
  showLogo?: boolean
  showTotal?: boolean
  sortedKey?: string | undefined
  sortedDirection?: "asc" | "desc" | undefined
}
const props = withDefaults(defineProps<IProps>(), {
    showTotal: false,
    showLogo: false,
    sortedKey: undefined,
    sortedDirection: undefined,
})

const route = useRoute()
const { competitionId } = route.params as { competitionId: string; }
const { getTeamName, getPlayerName, getCompetition } = useLibs()
const { playerRankingKeys, getCategory } = useOptionsLib()
const getCalculated = (item) => {
    console.log(item)
    const { fta, ftm, fga, fgm, fg3a, fg3m, oreb, dreb, ast, stl, blk, blka, fdr, fcm, tov } = item
    const ftprc = getPerc(fta, ftm)
    const fgprc = getPerc(fga, fgm)
    const fg3prc = getPerc(fg3a, fg3m)
    const pts = ftm + 2 * fgm + 3 * fg3m
    const reb = oreb + dreb
    const pir =
        pts +
        reb +
        ast +
        stl +
        blk +
        fdr -
        (fga - fgm + (fg3a - fg3m) + (fta - ftm) + tov + blka + fcm)
    return {
        ftprc,
        fgprc,
        fg3prc,
        pts, 
        reb,
        pir
    }
}
const footerItem = computed(() => {
    if (!props.showTotal) { return undefined }
    return Object.keys(props.items[0]).reduce((result: {}, key: string) => {
        if (playerRankingKeys.findIndex((opt: Option) => opt.value === key) === -1) {
            result[key] = '' 
        } else {
            result[key] = props.items.reduce((tot: number, item) => tot + Number(item[key]), 0) 
        }
        return result
    }, {} as {})
})
</script>

<style scoped lang="scss"></style>
