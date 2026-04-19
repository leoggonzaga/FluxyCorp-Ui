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
