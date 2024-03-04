import { teamCompetitionsComputedName, teamsColl } from '@/firebase-firestore.js'
import { useFirestore } from '@vueuse/firebase/useFirestore'
import { collection } from 'firebase/firestore'
import type { TeamId } from '@/types/teams'
import { computed, type Ref } from 'vue'
import { computedStandingConverter } from '@/utils/firestore-converters'
import type { CompetitionStandingComputed } from '@/models/CompetitionComputed'

export default function useTeamComputed(teamId: TeamId) {
  const computedCompetitionsCollection = collection(
    teamsColl,
    `/${teamId}/${teamCompetitionsComputedName}`
  ).withConverter(computedStandingConverter)

  const rows = useFirestore(computedCompetitionsCollection, undefined) as Ref<
    CompetitionStandingComputed[] | undefined
  >

  const isReady = computed(() => {
    return Array.isArray(rows.value) && rows.value.every(Boolean)
  })

  return {
    isReady,
    rows
  }
}
