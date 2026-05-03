import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5021/api',
})

//Inteceptor para agregar el token al header de la solicitud
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api;
