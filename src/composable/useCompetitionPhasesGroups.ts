import type { CompetitionGroupComputed, CompetitionPhaseComputed } from '@/types/computed'
import type { Option } from '@/types/comp-fields'
import { computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useCompetition from './useCompetition'
import useOptionsLib from './useOptionsLib'

export default function useCompetitionPhasesGroups() {
  const router = useRouter()
  const route = useRoute()
  const { competitionId, phase, group } = route.params as {
    competitionId: string
    phase: string
    group: string
  }
  const { computedPhases } = useCompetition(competitionId)
  const { competitionPhases } = useOptionsLib()
  const { t } = useI18n()

  const selectedPhaseIdx = computed<string>({
    get() {
      const { phase } = route.params
      return (phase || '0') as string
    },
    set(v) {
      const params = {
        phase: v,
        group: '0'
      }
      // console.log('change phase', params)
      router.push({
        name: route.name as string,
        params
      })
    }
  })
  const selectedGroupIdx = computed<string>({
    get() {
      const { group } = route.params
      return (group || '0') as string
    },
    set(v) {
      const params = {
        ...route.params,
        group: v
      }
      router.replace({
        name: route.name as string,
        params
      })
    }
  })

  const selectedPhase = computed<CompetitionPhaseComputed | undefined>(() =>
    Array.isArray(computedPhases?.value) && selectedPhaseIdx.value
      ? (computedPhases.value[Number(selectedPhaseIdx.value)] as CompetitionPhaseComputed)
      : undefined
  )
  const selectedGroup = computed<CompetitionGroupComputed | undefined>(() =>
    Array.isArray(selectedPhase.value?.groups) && selectedGroupIdx.value
      ? selectedPhase.value?.groups[Number(selectedGroupIdx.value)]
      : undefined
  )

  const phasesOptions = computed<Option[] | undefined>(() =>
    Array.isArray(computedPhases.value)
      ? computedPhases.value?.map(
          (row: CompetitionPhaseComputed, idx: any): Option => ({
            value: idx.toString(),
            text: competitionPhases.find((opt) => opt.value === row.type)?.text as string
          })
        )
      : undefined
  )
  const groupsOptions = computed<Option[] | undefined>(() =>
    Array.isArray(selectedPhase.value?.groups)
      ? selectedPhase.value?.groups.map(
          (row: CompetitionGroupComputed, idx: any): Option => ({
            value: idx.toString(),
            text: t('global.group') + ` ${idx + 1}`
          })
        )
      : undefined
  )

  watchEffect(() => {
    if (route.params?.phase && route.params?.group) {
      return
    }
    const hasPhases = Array.isArray(computedPhases?.value) && computedPhases?.value.length > 1
    const hasGroups = selectedPhase.value && selectedPhase.value.groups.length > 1
    const params = {} as { phase: string; group?: string }
    if (hasPhases && !phase) {
      const pIdx = computedPhases.value.length - 1
      params.phase = pIdx.toString()
      params.group = '0'
    }
    if (hasGroups && !group) {
      params.group = '0'
      params.phase = params.phase || '0'
    }
    if (params.phase) {
      // console.log('init', params)
      router.replace({
        ...route,
        params
      })
    }
  })

  return {
    phasesOptions,
    selectedPhaseIdx,
    selectedPhase,

    groupsOptions,
    selectedGroupIdx,
    selectedGroup
  }
}
