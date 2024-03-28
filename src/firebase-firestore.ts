import { app } from '@/firebase.js'
import { collection, getFirestore } from 'firebase/firestore'
import { competitionConverter } from '@/utils/firestore-converters'

// Initialize Firestore
export const db = getFirestore(app)

export const competitionsName = 'competitions'
export const gamesName = 'games'
export const teamsName = 'teams'
export const playersName = 'players'
export const playByPlayName = 'play-by-play'

export const playerCompetitionsComputedName = `player-${competitionsName}-computed`
export const teamCompetitionsComputedName = `team-${competitionsName}-computed`

export const teamsColl = collection(db, teamsName)
export const playersColl = collection(db, playersName)
export const gamesColl = collection(db, gamesName)
export const playByPlayColl = collection(db, playByPlayName)
export const competitionsColl = collection(db, competitionsName).withConverter(competitionConverter)

// storage
export const storageTeams = 'hy-competition-teams'
export const storageSponsors = 'hy-competition-sponsors'