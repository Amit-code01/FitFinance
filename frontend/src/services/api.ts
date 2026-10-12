import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api', headers: { 'Content-Type':'application/json' } });
api.interceptors.request.use(config => { const token=localStorage.getItem('fitfinance-token'); if(token) config.headers.Authorization=`Bearer ${token}`; return config; });
api.interceptors.response.use(r=>r, error=>{ if(error.response?.status===401 && localStorage.getItem('fitfinance-token')) { localStorage.removeItem('fitfinance-token'); localStorage.removeItem('fitfinance-user'); if(location.pathname!=='/login') location.assign('/login'); } return Promise.reject(error); });
