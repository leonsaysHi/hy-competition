import { app } from '@/firebase.js'
import { collection, getFirestore } from 'firebase/firestore'
import { competitionConverter } from '@/utils/firestore-converters'

// Initialize Firestore
export const db = getFirestore(app)

export const competitionsName = 'competitions'
export const gamesName = 'games'
export const teamsName = 'teams'
export const playersName = 'players'
export const bracketsName = 'brackets'

export const playerCompetitionsComputedName = `player-${competitionsName}-computed`
export const teamCompetitionsComputedName = `team-${competitionsName}-computed`

export const teamsColl = collection(db, teamsName)
export const playersColl = collection(db, playersName)
export const gamesColl = collection(db, gamesName)
export const bracketsColl = collection(db, bracketsName)
export const competitionsColl = collection(db, competitionsName).withConverter(competitionConverter)

// storage
export const storageTeams = 'competition-teams'
export const storageSponsors = 'competition-sponsors'
