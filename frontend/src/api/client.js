import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('iapas_auth')
  if (auth) {
    const { token } = JSON.parse(auth)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401, clear session and redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('iapas_auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
