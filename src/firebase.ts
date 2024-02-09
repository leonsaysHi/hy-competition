import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBab4OZXrKhtb-AfyRBCb8d8BCKsfRG1TY',
  authDomain: 'hy-competitions.firebaseapp.com',
  projectId: 'hy-competitions',
  storageBucket: 'hy-competitions.appspot.com',
  messagingSenderId: '782030950250',
  appId: '1:782030950250:web:3fdee3b139e1760f50df13'
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth()
