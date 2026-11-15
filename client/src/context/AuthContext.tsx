
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { apiRequest } from '../services/api'

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

interface SyncResponse {
  success: boolean
  message: string
  data: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  register: (name: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const syncUser = async () => {
    const response = await apiRequest<SyncResponse>('/api/users/sync', {
      method: 'POST',
    })

    setUser(response.data)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setToken(null)
        setLoading(false)
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()
        setToken(idToken)
        await syncUser()
      } catch (error) {
        console.error('Authentication synchronization failed:', error)
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const register = async (
    name: string,
    email: string,
    password: string,
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )

    await updateProfile(credential.user, { displayName: name })

    const idToken = await credential.user.getIdToken(true)
    setToken(idToken)

    await syncUser()

    await apiRequest('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })

    setUser({
      id: '',
      name,
      email: credential.user.email || email,
      role: 'customer',
    })

    await syncUser()
  }

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    )

    const idToken = await credential.user.getIdToken()
    setToken(idToken)

    await syncUser()
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}
