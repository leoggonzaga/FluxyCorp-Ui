export const enterpriseAPI_Employees = '/Employees'
export const enterpriseAPI_EmployeeAvailability      = (publicId) => `/Employees/${publicId}/availability`
export const enterpriseAPI_EmployeePersonalInfo      = (publicId) => `/Employees/${publicId}/personal-info`
export const enterpriseAPI_EmployeeProfessionalInfo  = (publicId) => `/Employees/${publicId}/professional-info`
export const enterpriseAPI_EmployeeSpecificDates     = (publicId) => `/Employees/${publicId}/specific-dates`
export const enterpriseAPI_EmployeeUnavailabilities  = (publicId) => `/Employees/${publicId}/unavailabilities`
export const enterpriseAPI_EmployeeRoleProfile       = (publicId) => `/Employees/${publicId}/role-profile`
export const enterpriseAPI_JobTitles = '/Enterprises/jobtitles';
export const enterpriseAPI_Genders = '/Enterprises/genders';
export const enterpriseAPI_Catalog = '/Catalogs';

export const operadorasAPI_tipos                       = '/operadoras/tipos'
export const operadorasAPI_create                      = '/operadoras'
export const operadorasAPI_getByCompany  = (cid)      => `/operadoras/company/${cid}`
export const operadorasAPI_getById       = (id)       => `/operadoras/${id}`
export const operadorasAPI_update        = (id)       => `/operadoras/${id}`
export const operadorasAPI_delete        = (id)       => `/operadoras/${id}`

export const roomsAPI_getAll                         = '/Rooms'
export const roomsAPI_create                         = '/Rooms'
export const roomsAPI_update             = (id)      => `/Rooms/${id}`
export const roomsAPI_delete             = (id)      => `/Rooms/${id}`

export const paymentMethodsAPI_cardBrands                    = '/payment-methods/card-brands'
export const paymentMethodsAPI_create                        = '/payment-methods'
export const paymentMethodsAPI_getByCompany  = (cid)        => `/payment-methods/company/${cid}`
export const paymentMethodsAPI_getById       = (id)         => `/payment-methods/${id}`
export const paymentMethodsAPI_update        = (id)         => `/payment-methods/${id}`
export const paymentMethodsAPI_delete        = (id)         => `/payment-methods/${id}`
export const paymentMethodsAPI_addRate       = (id)         => `/payment-methods/${id}/rates`
export const paymentMethodsAPI_updateRate    = (rateId)     => `/payment-methods/rates/${rateId}`
export const paymentMethodsAPI_deleteRate    = (rateId)     => `/payment-methods/rates/${rateId}`

export const estabelecimentoAPI_getSettings                      = '/companies/settings'
export const estabelecimentoAPI_updateSettings                   = '/companies/settings'
export const estabelecimentoAPI_addDocument                      = '/companies/settings/documents'
export const estabelecimentoAPI_deleteDocument   = (publicId)   => `/companies/settings/documents/${publicId}`

export const monitorAPI_getSettings                              = '/companies/monitor-settings'
export const monitorAPI_updateSettings                           = '/companies/monitor-settings'
export const monitorAPI_callPatient                              = '/companies/monitor/call-patient'
export const monitorAPI_verifyPassword                           = '/companies/monitor/verify-password'
export const monitorAPI_getSettingsPublic                        = (cid) => `/companies/monitor-settings/public?cid=${cid}`
export const monitorAPI_verifyPasswordPublic                     = '/companies/monitor/verify-password/public'

export const roleProfilesAPI_getAll                              = '/RoleProfiles'
export const roleProfilesAPI_create                              = '/RoleProfiles'
export const roleProfilesAPI_update              = (publicId)   => `/RoleProfiles/${publicId}`
export const roleProfilesAPI_delete              = (publicId)   => `/RoleProfiles/${publicId}`
