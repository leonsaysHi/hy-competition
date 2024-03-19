import type { Competition, CompetitionId, Phase } from '@/types/competitions'
import type { CompetitionPlayer, PlayerDoc } from '@/types/players'
import { Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { dateToTimeStamp } from '@/utils/dates'
import type { CompetitionTeamDoc, TeamDoc, TeamId } from '@/types/teams'
import type { GameDoc } from '@/types/games'
import { add } from './maths'
import type { CompetitionRankingComputed, CompetitionStandingComputed } from '@/types/computed'
import type { PlayByPlayDoc, PlayStack, PlayStackDoc } from '@/play-by-play/GameInput.vue'

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
      phases: Array.isArray(row.phases)
        ? row.phases.map((phase: Phase) => ({
            ...phase,
            groups: phase.groups.map((group: TeamId[]) => group.join(';'))
          }))
        : [],
      lastUpdate: dateToFireStore(new Date())
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null)) as DocumentData
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id as CompetitionId,
      games: [],
      teams: [],
      ...data,
      phases: Array.isArray(data.phases)
        ? (data.phases.map((phase) => ({
            ...phase,
            groups: phase.groups.map((group: string) => group.split(';'))
          })) as Phase[])
        : [],
      lastUpdate: data.lastUpdate ? dateFromFirestore(data.lastUpdate) : new Date()
    }
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
      ...row,
      isFinished: Object.values(row.scores).some((score) => score.reduce(add, 0))
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
  toFirestore: (row: CompetitionRankingComputed): DocumentData => {
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

export const playByPlayStackConverter = {
  toFirestore: (row: PlayByPlayDoc): DocumentData => {
    const payload = {
      ...row,
      playStacks: row.playStacks.map((stack: PlayStack) => JSON.stringify(stack))
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): PlayStackDoc => {
    const data = snapshot.data(options)!
    console.log(data)
    return data.playStacks.map((stack: string) => JSON.parse(stack))
  }
}
