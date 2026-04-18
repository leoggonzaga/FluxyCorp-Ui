import { inventoryApi } from '../apiBaseService'
import * as endpoints from './inventoryEndpoints'

// Products
export const getProductsPaged = (params) =>
    inventoryApi.get(endpoints.inventoryAPI_Products, { params })

export const createProduct = (data) =>
    inventoryApi.post(endpoints.inventoryAPI_Products, data)

export const updateProduct = (publicId, data) =>
    inventoryApi.put(`${endpoints.inventoryAPI_Products}/${publicId}`, data)

export const deleteProduct = (publicId) =>
    inventoryApi.delete(`${endpoints.inventoryAPI_Products}/${publicId}`)

// Categories
export const getCategories = () =>
    inventoryApi.get(endpoints.inventoryAPI_Categories)

export const createCategory = (data) =>
    inventoryApi.post(endpoints.inventoryAPI_Categories, data)

export const updateCategory = (publicId, data) =>
    inventoryApi.put(`${endpoints.inventoryAPI_Categories}/${publicId}`, data)

export const deleteCategory = (publicId) =>
    inventoryApi.delete(`${endpoints.inventoryAPI_Categories}/${publicId}`)

// Suppliers
export const getSuppliers = () =>
    inventoryApi.get(endpoints.inventoryAPI_Suppliers)

export const createSupplier = (data) =>
    inventoryApi.post(endpoints.inventoryAPI_Suppliers, data)

export const updateSupplier = (publicId, data) =>
    inventoryApi.put(`${endpoints.inventoryAPI_Suppliers}/${publicId}`, data)

export const deleteSupplier = (publicId) =>
    inventoryApi.delete(`${endpoints.inventoryAPI_Suppliers}/${publicId}`)

// Stock Movements
export const getMovementsPaged = (params) =>
    inventoryApi.get(endpoints.inventoryAPI_StockMovements, { params })

export const getMovementsByProduct = (productPublicId) =>
    inventoryApi.get(`${endpoints.inventoryAPI_StockMovements}/by-product/${productPublicId}`)

export const createStockMovement = (data) =>
    inventoryApi.post(endpoints.inventoryAPI_StockMovements, data)

// Stock Requests
export const createStockRequest = (data) =>
    inventoryApi.post(endpoints.inventoryAPI_StockRequests, data)

export const getStockRequestsPaged = (params) =>
    inventoryApi.get(endpoints.inventoryAPI_StockRequests, { params })

export const getPendingRequestsByProduct = (productPublicId) =>
    inventoryApi.get(`${endpoints.inventoryAPI_StockRequests}/by-product/${productPublicId}/pending`)

export const fulfillStockRequest = (requestPublicId, data) =>
    inventoryApi.post(`${endpoints.inventoryAPI_StockRequests}/${requestPublicId}/fulfill`, data)

export const cancelStockRequest = (requestPublicId) =>
    inventoryApi.patch(`${endpoints.inventoryAPI_StockRequests}/${requestPublicId}/cancel`)
