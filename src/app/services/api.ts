const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const apiMode = configuredBaseUrl ? 'remote' : 'local'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

function apiUrl(pathname: string) {
  if (!configuredBaseUrl) {
    throw new Error('The API URL is not configured.')
  }
  return new URL(pathname, configuredBaseUrl.endsWith('/') ? configuredBaseUrl : `${configuredBaseUrl}/`).toString()
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
  }
}

export async function apiRequest<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(apiUrl(pathname), { ...init, headers })
  if (response.status === 204) {
    return undefined as T
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body && typeof body === 'object' && 'detail' in body
      ? String((body as { detail: unknown }).detail)
      : `API request failed (${response.status}).`
    throw new ApiError(detail, response.status)
  }
  return body as T
}

export function apiJson<T>(pathname: string, method: string, body?: unknown) {
  return apiRequest<T>(pathname, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}
