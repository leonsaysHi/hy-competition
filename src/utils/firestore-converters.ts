import type { Competition, Phase } from '@/types/competitions'
import type { Player } from '@/types/players'
import { Timestamp } from 'firebase/firestore'
import type { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'
import { dateToTimeStamp } from '@/utils/dates'
import type { TeamId } from '@/types/teams'

const dateFromFirestore = (ts: Timestamp) => {
  return ts.toDate()
}

const dateToFireStore = (date: Date) => {
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
    return Object.fromEntries(Object.entries(payload).filter(([_, v]) => v != null))
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
    const data = snapshot.data(options)!
    return {
      id: snapshot.id,
      games: [],
      teams: [],
      ...data,
      phases: Array.isArray(data.phases)
        ? data.phases.map((phase) => ({
            ...phase,
            groups: phase.groups.map((group: string) => group.split(';'))
          }))
        : {},
      lastUpdate: data.lastUpdate ? dateFromFirestore(data.lastUpdate) : new Date()
    }
  }
}

export const gameConverter = {
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

export const teamConverter = {
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
      players: [],
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
