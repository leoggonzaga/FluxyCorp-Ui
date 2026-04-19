import { billingApi } from '../apiBaseService'
import endpoints from './billingEndpoints'

export const getChargesByConsumer = (consumerPublicId) =>
    billingApi.get(endpoints.chargesByConsumer(consumerPublicId))

export const getChargeById = (publicId) =>
    billingApi.get(endpoints.chargeById(publicId))

export const createCharge = (payload) =>
    billingApi.post(endpoints.createCharge, payload)

export const recordSettlement = (chargePublicId, payload) =>
    billingApi.post(endpoints.recordSettlement(chargePublicId), payload)

export const cancelCharge = (chargePublicId, payload) =>
    billingApi.post(endpoints.cancelCharge(chargePublicId), payload)
