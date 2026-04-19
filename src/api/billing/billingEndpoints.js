const endpoints = {
    chargesByConsumer: (consumerPublicId) => `/billing/charges/consumer/${consumerPublicId}`,
    chargeById:        (publicId)         => `/billing/charges/${publicId}`,
    createCharge:                            '/billing/charges',
    recordSettlement:  (publicId)         => `/billing/charges/${publicId}/settlements`,
    cancelCharge:      (publicId)         => `/billing/charges/${publicId}/cancel`,
}

export default endpoints
