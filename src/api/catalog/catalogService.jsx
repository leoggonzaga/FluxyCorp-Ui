import { catalogApi } from "../apiBaseService";
import * as endpoints from "./catalogEndpoints";

export const catalogApiGetCatalogs = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Catalog, { params: param })
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiGetCatalogById = async (id) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Catalog + `/${id}`)
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

export const catalogApiPutCatalogs = async (id, param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Catalog + `/${id}`, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiDeleteCatalogs = async (id) => {
    try {
        const result = await catalogApi.delete(endpoints.enterpriseAPI_Catalog + `/${id}`)
        return result.data;
    }
    catch (err) {
        return null
    }
}





export const catalogApiGetProducts = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Product, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPostProduct = async (param) => {
    try {
        const result = await catalogApi.post(endpoints.enterpriseAPI_Product, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPutProduct = async (id, param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Product + `/${id}`, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiDeleteProduct = async (id) => {
    try {
        const result = await catalogApi.delete(endpoints.enterpriseAPI_Product + `/${id}`)
        return result.data;
    }
    catch (err) {
        return null
    }
}








export const catalogApiGetServices = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Service, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPostService = async (param) => {
    try {
        const result = await catalogApi.post(endpoints.enterpriseAPI_Service, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPutService = async (id, param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Service + `/${id}`, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiDeleteService = async (id) => {
    try {
        const result = await catalogApi.delete(endpoints.enterpriseAPI_Service + `/${id}`)
        return result.data;
    }
    catch (err) {
        return null
    }
}





export const catalogApiGetBundle = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Bundle, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPostBundle = async (param) => {
    try {
        const result = await catalogApi.post(endpoints.enterpriseAPI_Bundle, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPutBundle = async (id, param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Bundle + `/${id}`, param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiDeleteBundle = async (id) => {
    try {
        const result = await catalogApi.delete(endpoints.enterpriseAPI_Bundle + `/${id}`)
        return result.data;
    }
    catch (err) {
        return null
    }
}


export const catalogApiPostCatalogItem = async (id, param) => {
    try {
        const result = await catalogApi.post(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiPutCatalogItem = async (id, param) => {
    try {
        const result = await catalogApi.put(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiDeleteCatalogItem = async (id, param) => {
    try {
        const result = await catalogApi.delete(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', { data: { ...param } })
        return result.data;
    }
    catch (err) {
        return null
    }
}



export const catalogApiGetServiceCategories = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/services', param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiGetProductCategories = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/products', param)
        return result.data;
    }
    catch (err) {
        return null
    }
}

export const catalogApiGetBundleCategories = async (param) => {
    try {
        const result = await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/bundles', param)
        return result.data;
    }
    catch (err) {
        return null
    }
}