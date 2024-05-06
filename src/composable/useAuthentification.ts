import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useAuth } from '@vueuse/firebase/useAuth'
import { auth, admins } from '@/firebase'
import { computed } from 'vue'

export default function useAuthentification() {
  const { isAuthenticated, user } = useAuth(auth)
  const isAdmin = computed<boolean>(() => typeof user.value?.email === 'string' && admins.includes(user.value?.email))
  const logIn = () => signInWithPopup(auth, new GoogleAuthProvider())
  const logOut = () => signOut(auth)
  return {
    logIn,
    logOut,
    isAuthenticated, 
    user,
    isAdmin
  }
}
