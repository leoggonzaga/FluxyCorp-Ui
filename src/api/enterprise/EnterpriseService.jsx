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
