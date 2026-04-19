import { consultationTypeApi } from '../apiBaseService'
import * as endpoints from './consultationEndpoints'

const unwrap = (res) => (res?.data !== undefined ? res.data : res)

// ── Types ─────────────────────────────────────────────────────────────────────

export const consultationTypeApiGetTypes = () =>
    consultationTypeApi.get(endpoints.consultationTypeAPI_types).then(unwrap)

export const consultationTypeApiCreate = (data) =>
    consultationTypeApi.post(endpoints.consultationTypeAPI_create, data)

export const consultationTypeApiUpdate = (id, data) =>
    consultationTypeApi.put(endpoints.consultationTypeAPI_update(id), data)

export const consultationTypeApiDelete = (id) =>
    consultationTypeApi.delete(endpoints.consultationTypeAPI_delete(id))

// ── Categories ────────────────────────────────────────────────────────────────

export const consultationCategoryApiGetAll = () =>
    consultationTypeApi.get(endpoints.consultationCategoryAPI_list).then(unwrap)

export const consultationCategoryApiCreate = (data) =>
    consultationTypeApi.post(endpoints.consultationCategoryAPI_create, data)

export const consultationCategoryApiUpdate = (id, data) =>
    consultationTypeApi.put(endpoints.consultationCategoryAPI_update(id), data)

export const consultationCategoryApiDelete = (id) =>
    consultationTypeApi.delete(endpoints.consultationCategoryAPI_delete(id))
