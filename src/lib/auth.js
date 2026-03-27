export const setToken = (token) => {
  localStorage.setItem('authToken', token)
}

export const getToken = () => {
  return localStorage.getItem('authToken')
}

export const removeToken = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userId')
  localStorage.removeItem('userRole')
}

export const setUserRole = (role) => {
  localStorage.setItem('userRole', role)
}

export const setUserId = (userId) => {
  localStorage.setItem('userId', userId)
}

export const getUserId = () => {
  return localStorage.getItem('userId')
}

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;

  const base64Payload = token.split('.')[1]; // Payload 부분 추출
  const payload = JSON.parse(atob(base64Payload)); // Base64 디코딩 후 JSON 파싱

  const roles = payload.roles;
  const user_role = roles[0];
  return user_role;
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
