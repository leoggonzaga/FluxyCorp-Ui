export const consultationTypeAPI_types          = '/consultation/types'
export const consultationTypeAPI_create         = '/consultation/types'
export const consultationTypeAPI_update         = (id) => `/consultation/types/${id}`
export const consultationTypeAPI_delete         = (id) => `/consultation/types/${id}`

export const consultationCategoryAPI_list       = '/consultation/categories'
export const consultationCategoryAPI_create     = '/consultation/categories'
export const consultationCategoryAPI_update     = (id) => `/consultation/categories/${id}`
export const consultationCategoryAPI_delete     = (id) => `/consultation/categories/${id}`

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionAPI_create                  = '/consultation/sessions'
export const sessionAPI_getById                 = (id) => `/consultation/sessions/${id}`
export const sessionAPI_getByPatient            = (patientId) => `/consultation/sessions/patient/${patientId}`
export const sessionAPI_update                  = (id) => `/consultation/sessions/${id}`
export const sessionAPI_updateEvolution         = (id) => `/consultation/sessions/${id}/evolution`
export const sessionAPI_start                   = (id) => `/consultation/sessions/${id}/start`
export const sessionAPI_finish                  = (id) => `/consultation/sessions/${id}/finish`
export const sessionAPI_cancel                  = (id) => `/consultation/sessions/${id}/cancel`

// ── Treatment Plans ───────────────────────────────────────────────────────────
export const treatmentPlanAPI_create            = '/treatment/plans'
export const treatmentPlanAPI_getById           = (publicId) => `/treatment/plans/${publicId}`
export const treatmentPlanAPI_getByPatient      = (patientId) => `/treatment/plans/patient/${patientId}`
export const treatmentPlanAPI_addItem           = (publicId) => `/treatment/plans/${publicId}/items`
export const treatmentPlanAPI_removeItem        = (publicId, itemId) => `/treatment/plans/${publicId}/items/${itemId}`
export const treatmentPlanAPI_submit            = (publicId) => `/treatment/plans/${publicId}/submit`
export const treatmentPlanAPI_approve           = (publicId) => `/treatment/plans/${publicId}/approve`
export const treatmentPlanAPI_reject            = (publicId) => `/treatment/plans/${publicId}/reject`
export const treatmentPlanAPI_delete            = (publicId) => `/treatment/plans/${publicId}`

// ── Treatment Contracts ───────────────────────────────────────────────────────
export const treatmentContractAPI_getById       = (publicId) => `/treatment/contracts/${publicId}`
export const treatmentContractAPI_getByPatient  = (patientId) => `/treatment/contracts/patient/${patientId}`
export const treatmentContractAPI_completeItem  = (publicId, itemId) => `/treatment/contracts/${publicId}/items/${itemId}/complete`
export const treatmentContractAPI_cancel        = (publicId) => `/treatment/contracts/${publicId}/cancel`
