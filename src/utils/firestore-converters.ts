import type { Competition, CompetitionId, Phase, PhaseGroup } from '@/types/competitions'
import type { CompetitionPlayer, PlayerDoc } from '@/types/players'
import { Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { dateToTimeStamp } from '@/utils/dates'
import type { CompetitionTeamDoc, TeamDoc, TeamId } from '@/types/teams'
import type { GameDoc } from '@/types/games'
import type { CompetitionPlayerComputed, CompetitionStandingComputed } from '@/types/computed'

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
      ...data
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
      ...data
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
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
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
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
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
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
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
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
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
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data
    }
  }
}
