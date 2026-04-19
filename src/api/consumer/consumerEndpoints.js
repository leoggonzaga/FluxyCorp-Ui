const endpoints = {
    createConsumer: '/consumers',
    getConsumersByCompany: (companyPublicId, search) =>
        `/consumers/company/${companyPublicId}${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    getConsumer: (publicId) => `/consumers/${publicId}`,
    updateConsumer: (publicId) => `/consumers/${publicId}`,
    deleteConsumer: (publicId) => `/consumers/${publicId}`,
    getNotes: (consumerPublicId) => `/consumers/${consumerPublicId}/notes`,
    createNote: (consumerPublicId) => `/consumers/${consumerPublicId}/notes`,
    deleteNote: (consumerPublicId, notePublicId) => `/consumers/${consumerPublicId}/notes/${notePublicId}`,
    getConvenios: (consumerPublicId) => `/consumers/${consumerPublicId}/convenios`,
    createConvenio: (consumerPublicId) => `/consumers/${consumerPublicId}/convenios`,
    updateConvenio: (consumerPublicId, convenioPublicId) =>
        `/consumers/${consumerPublicId}/convenios/${convenioPublicId}`,
    deleteConvenio: (consumerPublicId, convenioPublicId) =>
        `/consumers/${consumerPublicId}/convenios/${convenioPublicId}`,
}

export default endpoints

