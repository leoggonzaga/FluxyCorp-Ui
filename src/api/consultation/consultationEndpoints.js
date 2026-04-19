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
