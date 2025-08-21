import { enterpriseApi } from '../apiBaseService'
import * as endpoints from './enterpriseEndpoints'

export const enterpriseApiPostEmployees = async (param) => {
    try {
        const result = await enterpriseApi.post(endpoints.enterpriseAPI_Employees, param)
        return result.data;
    }
    catch (err) {
        // console.log(err)
        return null
    }
}

export const enterpriseApiPutEmployeeSimple = async (uid, param) => {
    try {
        const result = await enterpriseApi.put(endpoints.enterpriseAPI_Employees + `/${uid}/principalInfo`, param)
        return result.data;
    }
    catch (err) {
        // console.log(err)
        return null
    }
}

export const enterpriseApiGetEmployees = async (param) => {
    try {

        const result = await enterpriseApi.get(endpoints.enterpriseAPI_Employees, { params: param });
        return result.data;
    }
    catch (err) {
        //console.log(err?.message)
        return null
    }
}

export const enterpriseApiGetEmployeeById = async (id) => {
    try {
        const result = await enterpriseApi.get(endpoints.enterpriseAPI_Employees + `/${id}`)
        return result.data;
    }
    catch (err) {
        //console.log(err?.message)
        return null
    }
}

export const enterpriseApiGetEmployeeSimplifiedById = async (param) => {
    try {
        const result = await enterpriseApi.get(endpoints.enterpriseAPI_Employees + `/${param.employeeId}/simple`, param)
        return result.data;
    }
    catch (err) {
        //console.log(err?.message)
        return null
    }
}

export const enterpriseApiGetJobTitles = async (type) => {
    try {
        const result = await enterpriseApi.get(endpoints.enterpriseAPI_JobTitles + `/${type}`)
        return result.data;
    }
    catch (err) {
        ////console.log(err?.message)
        return null
    }
}

export const enterpriseApiGetGender = async () => {
    try {
        const result = await enterpriseApi.get(endpoints.enterpriseAPI_Genders);
        return result.data;
    }
    catch (err) {
        ////console.log(err?.message)
        return null
    }
}

