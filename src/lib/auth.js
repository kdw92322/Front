export const setToken = (token) => {
  localStorage.setItem('authToken', token)
}

export const getToken = () => {
  return localStorage.getItem('authToken')
}

export const removeToken = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
}

export const setUserId = (userId) => {
  localStorage.setItem('userId', userId)
}

export const getUserId = () => {
  return localStorage.getItem('userId')
}

export const parseJwt = (token) => {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(decoded)))
  } catch (error) {
    return null
  }
}

export const getTokenExpiry = () => {
  const token = getToken()
  if (!token) return null
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return null
  return new Date(payload.exp * 1000)
}

export const isAuthenticated = () => {
  return Boolean(getToken())
}
