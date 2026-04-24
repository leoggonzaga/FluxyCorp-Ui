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

// ── Sessions ─────────────────────────────────────────────────────────────────

export const sessionCreate = (data) =>
    consultationTypeApi.post(endpoints.sessionAPI_create, data)

export const sessionGetById = (id) =>
    consultationTypeApi.get(endpoints.sessionAPI_getById(id)).then(unwrap)

export const sessionGetByPatient = (patientId) =>
    consultationTypeApi.get(endpoints.sessionAPI_getByPatient(patientId)).then(unwrap)

export const sessionUpdate = (id, data) =>
    consultationTypeApi.put(endpoints.sessionAPI_update(id), data)

export const sessionUpdateEvolution = (id, mainComplaint) =>
    consultationTypeApi.patch(endpoints.sessionAPI_updateEvolution(id), { mainComplaint })

export const sessionStart = (id) =>
    consultationTypeApi.post(endpoints.sessionAPI_start(id))

export const sessionFinish = (id, data) =>
    consultationTypeApi.post(endpoints.sessionAPI_finish(id), data)

export const sessionCancel = (id) =>
    consultationTypeApi.post(endpoints.sessionAPI_cancel(id))

// ── Treatment Plans ───────────────────────────────────────────────────────────

export const treatmentPlanCreate = (data) =>
    consultationTypeApi.post(endpoints.treatmentPlanAPI_create, data)

export const treatmentPlanGetByPatient = (patientId) =>
    consultationTypeApi.get(endpoints.treatmentPlanAPI_getByPatient(patientId)).then(unwrap)

export const treatmentPlanGetById = (publicId) =>
    consultationTypeApi.get(endpoints.treatmentPlanAPI_getById(publicId)).then(unwrap)

export const treatmentPlanAddItem = (publicId, data) =>
    consultationTypeApi.post(endpoints.treatmentPlanAPI_addItem(publicId), data)

export const treatmentPlanRemoveItem = (publicId, itemId) =>
    consultationTypeApi.delete(endpoints.treatmentPlanAPI_removeItem(publicId, itemId))

export const treatmentPlanSubmit = (publicId) =>
    consultationTypeApi.post(endpoints.treatmentPlanAPI_submit(publicId))

export const treatmentPlanApprove = (publicId) =>
    consultationTypeApi.post(endpoints.treatmentPlanAPI_approve(publicId))

export const treatmentPlanReject = (publicId) =>
    consultationTypeApi.post(endpoints.treatmentPlanAPI_reject(publicId))

export const treatmentPlanDelete = (publicId) =>
    consultationTypeApi.delete(endpoints.treatmentPlanAPI_delete(publicId))

// ── Treatment Contracts ───────────────────────────────────────────────────────

export const treatmentContractGetByPatient = (patientId) =>
    consultationTypeApi.get(endpoints.treatmentContractAPI_getByPatient(patientId)).then(unwrap)

export const treatmentContractGetById = (publicId) =>
    consultationTypeApi.get(endpoints.treatmentContractAPI_getById(publicId)).then(unwrap)

export const treatmentContractCompleteItem = (publicId, itemId) =>
    consultationTypeApi.post(endpoints.treatmentContractAPI_completeItem(publicId, itemId))

export const treatmentContractCancel = (publicId) =>
    consultationTypeApi.post(endpoints.treatmentContractAPI_cancel(publicId))
