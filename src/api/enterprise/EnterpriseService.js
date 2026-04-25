import { enterpriseApi } from '../apiBaseService'
import * as endpoints from './enterpriseEndpoints'

export const enterpriseApiPostEmployees = async (param) => {
    return await enterpriseApi.post(endpoints.enterpriseAPI_Employees, param);
}

export const enterpriseApiPutEmployeeSimple = async (uid, param) => {
    return await enterpriseApi.put(endpoints.enterpriseAPI_Employees + `/${uid}/principalInfo`, param);
}

export const enterpriseApiGetEmployees = async (param) => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_Employees, { params: param });
}

export const enterpriseApiGetEmployeeById = async (id) => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_Employees + `/${id}`);
}

export const enterpriseApiGetEmployeeSimplifiedById = async (param) => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_Employees + `/${param.employeeId}/simple`, param);
}

export const enterpriseApiGetJobTitles = async (type) => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_JobTitles + `/${type}`);
}

export const enterpriseApiGetAllJobTitles = () =>
    enterpriseApi.get(endpoints.enterpriseAPI_JobTitles)

export const employeeUpdatePersonalInfo = (publicId, data) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeePersonalInfo(publicId), data)

export const employeeUpdateProfessionalInfo = (publicId, data) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeeProfessionalInfo(publicId), data)

export const enterpriseApiGetGender = async () => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_Genders);
}

export const enterpriseApiGetCatalog = async (param) => {
    return await enterpriseApi.get(endpoints.enterpriseAPI_Catalog, { params: param });
}

export const operadorasTipos = () =>
    enterpriseApi.get(endpoints.operadorasAPI_tipos)

export const operadorasGetByCompany = (companyPublicId) =>
    enterpriseApi.get(endpoints.operadorasAPI_getByCompany(companyPublicId))

export const operadorasCreate = (data) =>
    enterpriseApi.post(endpoints.operadorasAPI_create, data)

export const operadorasUpdate = (publicId, data) =>
    enterpriseApi.put(endpoints.operadorasAPI_update(publicId), data)

export const operadorasDelete = (publicId) =>
    enterpriseApi.delete(endpoints.operadorasAPI_delete(publicId))

export const paymentMethodsGetCardBrands = () =>
    enterpriseApi.get(endpoints.paymentMethodsAPI_cardBrands)

export const paymentMethodsGetByCompany = (companyPublicId) =>
    enterpriseApi.get(endpoints.paymentMethodsAPI_getByCompany(companyPublicId))

export const paymentMethodsCreate = (data) =>
    enterpriseApi.post(endpoints.paymentMethodsAPI_create, data)

export const paymentMethodsUpdate = (publicId, data) =>
    enterpriseApi.put(endpoints.paymentMethodsAPI_update(publicId), data)

export const paymentMethodsDelete = (publicId) =>
    enterpriseApi.delete(endpoints.paymentMethodsAPI_delete(publicId))

export const paymentMethodsAddRate = (publicId, data) =>
    enterpriseApi.post(endpoints.paymentMethodsAPI_addRate(publicId), data)

export const paymentMethodsUpdateRate = (ratePublicId, data) =>
    enterpriseApi.put(endpoints.paymentMethodsAPI_updateRate(ratePublicId), data)

export const paymentMethodsDeleteRate = (ratePublicId) =>
    enterpriseApi.delete(endpoints.paymentMethodsAPI_deleteRate(ratePublicId))

export const roomsGetAll = () =>
    enterpriseApi.get(endpoints.roomsAPI_getAll)

export const roomsCreate = (data) =>
    enterpriseApi.post(endpoints.roomsAPI_create, data)

export const roomsUpdate = (publicId, data) =>
    enterpriseApi.put(endpoints.roomsAPI_update(publicId), data)

export const roomsDelete = (publicId) =>
    enterpriseApi.delete(endpoints.roomsAPI_delete(publicId))

export const employeeGetAvailability = (publicId) =>
    enterpriseApi.get(endpoints.enterpriseAPI_EmployeeAvailability(publicId))

export const employeeReplaceAvailability = (publicId, slots) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeeAvailability(publicId), { slots })

export const employeeGetSpecificDates = (publicId) =>
    enterpriseApi.get(endpoints.enterpriseAPI_EmployeeSpecificDates(publicId))

export const employeeReplaceSpecificDates = (publicId, slots) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeeSpecificDates(publicId), { slots })

export const employeeGetUnavailabilities = (publicId) =>
    enterpriseApi.get(endpoints.enterpriseAPI_EmployeeUnavailabilities(publicId))

export const employeeReplaceUnavailabilities = (publicId, slots) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeeUnavailabilities(publicId), { slots })

export const employeeUpdateRoleProfile = (publicId, roleProfileId) =>
    enterpriseApi.put(endpoints.enterpriseAPI_EmployeeRoleProfile(publicId), { roleProfileId })

export const estabelecimentoGetSettings = () =>
    enterpriseApi.get(endpoints.estabelecimentoAPI_getSettings)

export const estabelecimentoUpdateSettings = (data) =>
    enterpriseApi.put(endpoints.estabelecimentoAPI_updateSettings, data)

export const estabelecimentoAddDocument = (data) =>
    enterpriseApi.post(endpoints.estabelecimentoAPI_addDocument, data)

export const estabelecimentoDeleteDocument = (publicId) =>
    enterpriseApi.delete(endpoints.estabelecimentoAPI_deleteDocument(publicId))

export const monitorGetSettings = () =>
    enterpriseApi.get(endpoints.monitorAPI_getSettings)

export const monitorUpdateSettings = (data) =>
    enterpriseApi.put(endpoints.monitorAPI_updateSettings, data)

export const monitorCallPatient = (patientName, room) =>
    enterpriseApi.post(endpoints.monitorAPI_callPatient, { patientName, room })

export const monitorVerifyPassword = (password) =>
    enterpriseApi.post(endpoints.monitorAPI_verifyPassword, { password })

// Endpoints públicos — não requerem autenticação (usados pelo monitor display na TV)
export const monitorGetSettingsPublic = (companyPublicId) =>
    enterpriseApi.get(endpoints.monitorAPI_getSettingsPublic(companyPublicId))

export const monitorVerifyPasswordPublic = (password, companyPublicId) =>
    enterpriseApi.post(endpoints.monitorAPI_verifyPasswordPublic, { password, companyPublicId })

export const roleProfilesGetAll = () =>
    enterpriseApi.get(endpoints.roleProfilesAPI_getAll)

export const roleProfilesCreate = (body) =>
    enterpriseApi.post(endpoints.roleProfilesAPI_create, body)

export const roleProfilesUpdate = (publicId, body) =>
    enterpriseApi.put(endpoints.roleProfilesAPI_update(publicId), body)

export const roleProfilesDelete = (publicId) =>
    enterpriseApi.delete(endpoints.roleProfilesAPI_delete(publicId))
