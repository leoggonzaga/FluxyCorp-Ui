import axios from "axios";

export const loginAuthenticationApi = axios.create({
    baseURL: import.meta.env.VITE_AUTHENTICATION_URL,

    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AUTHENTICATION_URL}`
    }
})

export const authenticationApi = axios.create({
    baseURL: import.meta.env.REACT_APP_PUBLIC_USER_URL,
    headers: {
        Authorization: `Bearer ${import.meta.env.REACT_APP_USER_API_TOKEN}`
    }
})

export const enterpriseApi = axios.create({
    baseURL: import.meta.env.VITE_ENTERPRISE_URL,
    headers: {
        Authorization: `Bearer ${JSON.parse(JSON.parse(localStorage.admin).auth).session.token}`
        // Authorization: `Bearer ${JSON.parse(localStorage.getItem('fluxyCareSession'))?.session?.token}`
    }
})

// enterpriseApi.interceptors.request.use((config) => {
//     const token = JSON.parse(localStorage.getItem('fluxyCareSession'))?.session?.token;
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });
