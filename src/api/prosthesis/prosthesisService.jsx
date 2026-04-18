import { prosthesisApi } from '../apiBaseService'
import * as endpoints from './prosthesisEndpoints'

// Prosthesis Requests
export const getProsthesisRequestsPaged = async (params) =>
    prosthesisApi.get(endpoints.prosthesisAPI_Requests, { params })

export const getProsthesisRequestById = async (publicId) =>
    prosthesisApi.get(`${endpoints.prosthesisAPI_Requests}/${publicId}`)

export const createProsthesisRequest = async (data) =>
    prosthesisApi.post(endpoints.prosthesisAPI_Requests, data)

export const updateProsthesisRequest = async (publicId, data) =>
    prosthesisApi.put(`${endpoints.prosthesisAPI_Requests}/${publicId}`, data)

export const updateProsthesisStatus = async (publicId, data) =>
    prosthesisApi.patch(`${endpoints.prosthesisAPI_Requests}/${publicId}/status`, data)

export const deleteProsthesisRequest = async (publicId) =>
    prosthesisApi.delete(`${endpoints.prosthesisAPI_Requests}/${publicId}`)

// Prosthesis Types
export const getProsthesisTypes = async () =>
    prosthesisApi.get(endpoints.prosthesisAPI_Types)

export const createProsthesisType = async (data) =>
    prosthesisApi.post(endpoints.prosthesisAPI_Types, data)

export const deleteProsthesisType = async (publicId) =>
    prosthesisApi.delete(`${endpoints.prosthesisAPI_Types}/${publicId}`)

// Laboratories
export const getLaboratories = async () =>
    prosthesisApi.get(endpoints.prosthesisAPI_Laboratories)

export const createLaboratory = async (data) =>
    prosthesisApi.post(endpoints.prosthesisAPI_Laboratories, data)

export const updateLaboratory = async (publicId, data) =>
    prosthesisApi.put(`${endpoints.prosthesisAPI_Laboratories}/${publicId}`, data)

export const deleteLaboratory = async (publicId) =>
    prosthesisApi.delete(`${endpoints.prosthesisAPI_Laboratories}/${publicId}`)

// Service Orders
export const getServiceOrdersByRequest = async (prosthesisRequestPublicId) =>
    prosthesisApi.get(endpoints.prosthesisAPI_ServiceOrders, { params: { prosthesisRequestPublicId } })

export const createServiceOrder = async (data) =>
    prosthesisApi.post(endpoints.prosthesisAPI_ServiceOrders, data)

export const updateServiceOrderStatus = async (publicId, data) =>
    prosthesisApi.patch(`${endpoints.prosthesisAPI_ServiceOrders}/${publicId}/status`, data)
