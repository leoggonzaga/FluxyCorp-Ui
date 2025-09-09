import axios from "axios";

export const loginAuthenticationApi = axios.create({
    baseURL: import.meta.env.VITE_AUTHENTICATION_URL,

    headers: {
        Authorization: `Bearer ${import.meta.env.VITE_AUTHENTICATION_URL}`
    }
})

export const enterpriseApi = axios.create({
    baseURL: import.meta.env.VITE_ENTERPRISE_URL,
    headers: {
        Authorization: `Bearer ${JSON.parse(JSON.parse(localStorage.admin).auth).session.token}`
    }
})

export const catalogApi = axios.create({
    baseURL: import.meta.env.VITE_CATALOG_URL,
    headers: {
        Authorization: `Bearer ${JSON.parse(JSON.parse(localStorage.admin).auth).session.token}`
    }
})