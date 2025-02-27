import type { Competition, CompetitionId, Phase, PhaseGroup } from '@/types/competitions'
import type { CompetitionPlayer, CompetitionPlayerDoc, Player, PlayerDoc } from '@/types/player'
import { Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { dateToTimeStamp } from '@/utils/dates'
import type { CompetitionTeamDoc, Team, TeamDoc } from '@/types/team'
import type { Game, GameDoc } from '@/types/games'
import type { CompetitionPlayerComputed, CompetitionPlayerStats, CompetitionStanding, CompetitionStandingComputed } from '@/types/computed'

const dateFromFirestore = (ts: Timestamp): Date => {
  return ts.toDate()
}

const dateToFireStore = (date: Date): Timestamp => {
  return dateToTimeStamp(date)
}

export const competitionConverter = {
  toFirestore: (row: Competition): DocumentData => {
    const payload = {
      ...row,
      lastUpdate: dateToFireStore(new Date())
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null)) as DocumentData
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    const payload = {
      id: snapshot.id as CompetitionId,
      games: [],
      teams: [],
      ...data,
      phases: Array.isArray(data.phases)
        ? data.phases
          .map((phase: Phase) => {
            return {
              ...phase,
              title: phase.title || phase.type,
              groups: Array.isArray(phase.groups) 
                ? phase.groups
                  .map((group: PhaseGroup, idx:Number) => {
                    return {
                      ...group,
                      title: group.title || group['name'] || idx.toString()
                    }
                  })
                : []
            }
          })
        : [],
      lastUpdate: data.lastUpdate ? dateFromFirestore(data.lastUpdate) : new Date()
    }
    return payload
  }
}
export const competitionPlayerConverter = {
  toFirestore: (row: CompetitionPlayer): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CompetitionPlayer => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as CompetitionPlayerDoc)
    }
  }
}
export const competitionTeamConverter = {
  toFirestore: (row: CompetitionTeamDoc): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CompetitionTeamDoc => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as CompetitionTeamDoc)
    }
  }
}

export const gameConverter = {
  toFirestore: (row: GameDoc): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Game => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as GameDoc)
    }
  }
}

export const teamConverter = {
  toFirestore: (row: TeamDoc): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Team => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as TeamDoc)
    }
  }
}

export const playerConverter = {
  toFirestore: (row: PlayerDoc): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Player => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as PlayerDoc)
    }
  }
}

export const computedRankingConverter = {
  toFirestore: (row: CompetitionPlayerComputed): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CompetitionPlayerComputed => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as CompetitionPlayerStats)
    }
  }
}
export const computedStandingConverter = {
  toFirestore: (row: CompetitionStandingComputed): DocumentData => {
    const payload = {
      ...row
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CompetitionStandingComputed => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...(data as CompetitionStanding)
    }
  }
}
