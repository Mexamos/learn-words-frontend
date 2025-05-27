import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // если будете слать куки
})

// interceptor для токена (пока заглушка)
api.interceptors.request.use(cfg => {
  // cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
  return cfg
})

export default api