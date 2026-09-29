import type { User } from '../utils/mockData'
import { apiJson, apiMode } from './api'

export type AuthMode = 'local' | 'remote'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegistrationData extends AuthCredentials {
  name: string
}

export interface AuthResult {
  success: boolean
  message: string
  token?: string
  user?: User
}

const loginPath = import.meta.env.VITE_AUTH_LOGIN_PATH?.trim() || '/api/v1/auth/login'
const registerPath = import.meta.env.VITE_AUTH_REGISTER_PATH?.trim() || '/api/v1/auth/register'

export const authMode: AuthMode = apiMode

export const demoCredentials = [
  {
    role: 'Admin',
    email: 'admin@requirementsys.com',
    password: 'Admin@123',
  },
  {
    role: 'Candidate',
    email: 'john@example.com',
    password: 'User@123',
  },
] as const

function createAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

function normalizeUser(input: unknown): User | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<User> & { id?: string | number }
  if (!candidate.id || !candidate.email) {
    return null
  }

  const name = candidate.name?.trim() || candidate.email.split('@')[0]

  return {
    id: String(candidate.id),
    name,
    email: candidate.email,
    role: candidate.role === 'admin' ? 'admin' : 'user',
    avatar: candidate.avatar || createAvatarUrl(name),
    resumeUrl: candidate.resumeUrl,
    resumeName: candidate.resumeName,
  }
}

function extractMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string') {
    return (payload as { message: string }).message
  }

  return fallback
}

function extractAuthResult(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return {
      token: undefined,
      user: null,
      message: undefined,
    }
  }

  const container = payload as {
    message?: unknown
    token?: unknown
    accessToken?: unknown
    access_token?: unknown
    user?: unknown
    data?: {
      token?: unknown
      accessToken?: unknown
      user?: unknown
    } | unknown
  }

  const nestedData = container.data && typeof container.data === 'object' ? container.data as {
    token?: unknown
    accessToken?: unknown
    user?: unknown
  } : undefined

  return {
    token:
      typeof container.token === 'string'
        ? container.token
        : typeof container.access_token === 'string'
          ? container.access_token
        : typeof container.accessToken === 'string'
          ? container.accessToken
          : typeof nestedData?.token === 'string'
            ? nestedData.token
            : typeof nestedData?.accessToken === 'string'
              ? nestedData.accessToken
              : undefined,
    user: normalizeUser(container.user ?? nestedData?.user ?? nestedData ?? payload),
    message: typeof container.message === 'string' ? container.message : undefined,
  }
}

async function postAuthRequest(pathname: string, payload: AuthCredentials | RegistrationData) {
  if (authMode !== 'remote') {
    return null
  }

  let body: unknown
  try {
    body = await apiJson<unknown>(pathname, 'POST', payload)
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication request failed.',
    } satisfies AuthResult
  }

  const result = extractAuthResult(body)
  if (!result.user) {
    return {
      success: false,
      message: extractMessage(body, 'Authentication succeeded but no user payload was returned.'),
    } satisfies AuthResult
  }

  return {
    success: true,
    message: result.message || 'Authentication successful.',
    token: result.token || `session-${result.user.id}`,
    user: result.user,
  } satisfies AuthResult
}

export async function loginWithRemoteApi(credentials: AuthCredentials) {
  try {
    return await postAuthRequest(loginPath, credentials)
  } catch {
    return {
      success: false,
      message: 'Unable to reach the configured login API. Check the server URL, CORS policy, and server status.',
    } satisfies AuthResult
  }
}

export async function registerWithRemoteApi(payload: RegistrationData) {
  try {
    return await postAuthRequest(registerPath, payload)
  } catch {
    return {
      success: false,
      message: 'Unable to reach the configured registration API. Check the server URL, CORS policy, and server status.',
    } satisfies AuthResult
  }
}
