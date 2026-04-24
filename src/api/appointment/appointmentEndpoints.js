export const appointmentAPI_range = '/appointments/range'
export const appointmentAPI_byPatient = (patientId) => `/appointments/patient/${patientId}`
export const appointmentAPI_createService = '/appointments/service'
export const appointmentAPI_editService = (id) => `/appointments/service/${id}`
export const appointmentAPI_confirm = (id) => `/appointments/${id}/confirm`
export const appointmentAPI_cancel = (id) => `/appointments/${id}/cancel`
export const appointmentAPI_delete = (id) => `/appointments/${id}`