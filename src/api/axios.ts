import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem('access_token')?.trim()
  const token = storedToken && storedToken !== 'undefined' && storedToken !== 'null'
    ? storedToken.replace(/^Bearer\s+/i, '')
    : null

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api