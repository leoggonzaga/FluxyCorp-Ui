import { consumerApi } from '@/api/apiBaseService'
import endpoints from './consumerEndpoints'

export const createConsumer = (data) =>
    consumerApi.post(endpoints.createConsumer, data)

export const getConsumersByCompany = (companyPublicId, search) =>
    consumerApi.get(endpoints.getConsumersByCompany(companyPublicId, search))

export const getConsumerById = (publicId) =>
    consumerApi.get(endpoints.getConsumer(publicId))

export const updateConsumer = (publicId, data) =>
    consumerApi.put(endpoints.updateConsumer(publicId), data)

export const deleteConsumer = (publicId) =>
    consumerApi.delete(endpoints.deleteConsumer(publicId))

export const getConsumerNotes = (consumerPublicId) =>
    consumerApi.get(endpoints.getNotes(consumerPublicId))

export const createConsumerNote = (consumerPublicId, data) =>
    consumerApi.post(endpoints.createNote(consumerPublicId), data)

export const deleteConsumerNote = (consumerPublicId, notePublicId) =>
    consumerApi.delete(endpoints.deleteNote(consumerPublicId, notePublicId))

export const getConsumerConvenios = (consumerPublicId) =>
    consumerApi.get(endpoints.getConvenios(consumerPublicId))

export const createConsumerConvenio = (consumerPublicId, data) =>
    consumerApi.post(endpoints.createConvenio(consumerPublicId), data)

export const updateConsumerConvenio = (consumerPublicId, convenioPublicId, data) =>
    consumerApi.put(endpoints.updateConvenio(consumerPublicId, convenioPublicId), data)

export const deleteConsumerConvenio = (consumerPublicId, convenioPublicId) =>
    consumerApi.delete(endpoints.deleteConvenio(consumerPublicId, convenioPublicId))
