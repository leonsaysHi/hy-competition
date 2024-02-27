import type { Competition, CompetitionId, Phase } from '@/types/competitions'
import type { CompetitionPlayer, Player } from '@/types/players'
import { Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { dateToTimeStamp } from '@/utils/dates'
import type { CompetitionTeamDoc, TeamDoc, TeamId } from '@/types/teams'
import type { CompetitionComputed } from '@/types/computed'
import type { Game } from '@/types/games'

const dateFromFirestore = (ts: Timestamp): Date => {
  return ts.toDate()
}

const dateToFireStore = (date: Date): Timestamp => {
  return dateToTimeStamp(date)
}

export const competitionConverter = {
  toFirestore: (row: Competition): DocumentData => {
    const lastUpdate = dateToFireStore(new Date())
    const payload = {
      ...row,
      phases: Array.isArray(row.phases)
        ? row.phases.map((phase: Phase) => ({
            ...phase,
            groups: phase.groups.map((group: TeamId[]) => group.join(';'))
          }))
        : [],
      lastUpdate
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

export const computedConverter = {
  toFirestore: (row: CompetitionComputed): DocumentData => {
    const lastUpdate = dateToFireStore(new Date())
    const payload = {
      ...row,
      lastUpdate
    }
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      ...data,
      lastUpdate: data.lastUpdate ? dateFromFirestore(data.lastUpdate) : new Date()
    }
  }
}

export const gameConverter = {
  toFirestore: (row: Game): DocumentData => {
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
  toFirestore: (row: Player): DocumentData => {
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
