import { catalogApi } from "../apiBaseService";
import * as endpoints from "./catalogEndpoints";

export const catalogApiGetCatalogs = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Catalog, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPostCatalogs = async (param) => {
    try {
        const result = await catalogApi.post(endpoints.enterpriseAPI_Catalog, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPutCatalogs = async (param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Catalog, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}