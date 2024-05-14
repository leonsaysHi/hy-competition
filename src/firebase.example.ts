import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

export const admins = ['leon.ronssin@gmail.com']

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: ''
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
