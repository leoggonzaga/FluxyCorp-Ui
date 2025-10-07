import { Notification, toast } from "../../components/ui";
import { catalogApi } from "../apiBaseService";
import * as endpoints from "./catalogEndpoints";

export const catalogApiGetCatalogs = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Catalog, { params: param });
}

export const catalogApiGetCatalogById = async (id) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Catalog + `/${id}`);
}

export const catalogApiPostCatalogs = async (param) => {
    return await catalogApi.post(endpoints.enterpriseAPI_Catalog, param);
}

export const catalogApiPutCatalogs = async (id, param) => {
    return await catalogApi.put(endpoints.enterpriseAPI_Catalog + `/${id}`, param);
}

export const catalogApiDeleteCatalogs = async (id) => {
    return await catalogApi.delete(endpoints.enterpriseAPI_Catalog + `/${id}`);
}





export const catalogApiGetProducts = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Product, param);
}

export const catalogApiPostProduct = async (param) => {
    return await catalogApi.post(endpoints.enterpriseAPI_Product, param);
}

export const catalogApiPutProduct = async (id, param) => {
    return await catalogApi.put(endpoints.enterpriseAPI_Product + `/${id}`, param);
}

export const catalogApiDeleteProduct = async (id) => {
    return await catalogApi.delete(endpoints.enterpriseAPI_Product + `/${id}`);
}








export const catalogApiGetServices = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Service, param);
}

export const catalogApiPostService = async (param) => {
    return await catalogApi.post(endpoints.enterpriseAPI_Service, param);
}

export const catalogApiPutService = async (id, param) => {
    return await catalogApi.put(endpoints.enterpriseAPI_Service + `/${id}`, param);
}

export const catalogApiDeleteService = async (id) => {
    return await catalogApi.delete(endpoints.enterpriseAPI_Service + `/${id}`);
}





export const catalogApiGetBundle = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Bundle, param);
}

export const catalogApiPostBundle = async (param) => {
    return await catalogApi.post(endpoints.enterpriseAPI_Bundle, param);
}

export const catalogApiPutBundle = async (id, param) => {
    return await catalogApi.put(endpoints.enterpriseAPI_Bundle + `/${id}`, param);
}

export const catalogApiDeleteBundle = async (id) => {
    return await catalogApi.delete(endpoints.enterpriseAPI_Bundle + `/${id}`);
}


export const catalogApiPostCatalogItem = async (id, param) => {
    return await catalogApi.post(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', param);
}

export const catalogApiPutCatalogItem = async (id, param) => {
    return await catalogApi.put(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', param);
}

export const catalogApiDeleteCatalogItem = async (id, param) => {
    return await catalogApi.delete(endpoints.enterpriseAPI_Catalog + `/${id}` + '/items', { data: { ...param } });
}



export const catalogApiGetServiceCategories = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/services', param);
}

export const catalogApiGetProductCategories = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/products', param);
}

export const catalogApiGetBundleCategories = async (param) => {
    return await catalogApi.get(endpoints.enterpriseAPI_Categorie + '/bundles', param);
}