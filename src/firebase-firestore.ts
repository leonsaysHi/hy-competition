import { app } from '@/firebase.js'
import { collectionGroup, collection, getFirestore } from 'firebase/firestore'

// Initialize Firestore
export const db = getFirestore(app)

export const competitionsName = 'competitions'
export const gamesName = 'games'
export const teamsName = 'teams'
export const playersName = 'players'

export const competitionsColl = collection(db, competitionsName)
export const teamsColl = collection(db, teamsName)
export const playersColl = collection(db, playersName)
export const gamesCollGroup = collectionGroup(db, gamesName)
