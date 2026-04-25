import { reportsApi } from '../apiBaseService'
import * as endpoints from './reportsEndpoints'

export const reportsCreate = (body) =>
    reportsApi.post(endpoints.reportsAPI_create, body)

export const reportsGetById = (id) =>
    reportsApi.get(endpoints.reportsAPI_get(id))
