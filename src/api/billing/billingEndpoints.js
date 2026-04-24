const endpoints = {
    // AR — Contas a Receber
    chargesByCompany:                         '/billing/charges',
    chargesByConsumer: (consumerPublicId) => `/billing/charges/consumer/${consumerPublicId}`,
    chargeById:        (publicId)         => `/billing/charges/${publicId}`,
    createCharge:                            '/billing/charges',
    recordSettlement:  (publicId)         => `/billing/charges/${publicId}/settlements`,
    cancelCharge:      (publicId)         => `/billing/charges/${publicId}/cancel`,

    // AP — Centros de Custo
    costCenters:                             '/billing/cost-centers',
    costCenterById:    (publicId)         => `/billing/cost-centers/${publicId}`,

    // AP — Plano de Contas
    accountCategories:                       '/billing/account-categories',
    accountCategoryById: (publicId)       => `/billing/account-categories/${publicId}`,

    // AP — Contas Financeiras
    financialAccounts:                           '/billing/financial-accounts',
    financialAccountById: (publicId)          => `/billing/financial-accounts/${publicId}`,

    // Fechamento de Caixa
    cashSessions:                                '/billing/cash-sessions',
    cashSessionById:      (publicId)          => `/billing/cash-sessions/${publicId}`,
    cashSessionClose:     (publicId)          => `/billing/cash-sessions/${publicId}/close`,
    cashSessionMovements: (publicId)          => `/billing/cash-sessions/${publicId}/movements`,
    cashSessionMovementById: (sid, mid)       => `/billing/cash-sessions/${sid}/movements/${mid}`,
    cashSessionReopen:        (publicId)       => `/billing/cash-sessions/${publicId}/reopen`,

    // Dashboard
    financialDashboard:                         '/billing/dashboard',

    // AP — Contas a Pagar
    payables:                                '/billing/payables',
    payableById:       (publicId)         => `/billing/payables/${publicId}`,
    recordPayment:     (publicId)         => `/billing/payables/${publicId}/payments`,
    reversePayment:    (paymentPublicId)  => `/billing/payables/payments/${paymentPublicId}/reverse`,
    cancelPayable:     (publicId)         => `/billing/payables/${publicId}/cancel`,
}

export default endpoints
