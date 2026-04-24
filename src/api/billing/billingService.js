import { billingApi } from '../apiBaseService'
import endpoints from './billingEndpoints'

// ── AR — Contas a Receber ─────────────────────────────────────────────────────

export const getChargesByCompany = (companyPublicId, filters = {}) =>
    billingApi.get(endpoints.chargesByCompany, { params: { companyPublicId, ...filters } })

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

// ── AP — Centros de Custo ─────────────────────────────────────────────────────

export const getCostCenters = (companyPublicId, activeOnly = true) =>
    billingApi.get(endpoints.costCenters, { params: { companyPublicId, activeOnly } })

export const createCostCenter = (payload) =>
    billingApi.post(endpoints.costCenters, payload)

export const updateCostCenter = (publicId, payload) =>
    billingApi.put(endpoints.costCenterById(publicId), payload)

// ── AP — Plano de Contas ──────────────────────────────────────────────────────

export const getAccountCategories = (companyPublicId, kind) =>
    billingApi.get(endpoints.accountCategories, { params: { companyPublicId, ...(kind !== undefined && { kind }) } })

export const createAccountCategory = (payload) =>
    billingApi.post(endpoints.accountCategories, payload)

export const updateAccountCategory = (publicId, payload) =>
    billingApi.put(endpoints.accountCategoryById(publicId), payload)

// ── AP — Contas Financeiras ───────────────────────────────────────────────────

export const getFinancialAccounts = (companyPublicId, activeOnly = true) =>
    billingApi.get(endpoints.financialAccounts, { params: { companyPublicId, activeOnly } })

export const createFinancialAccount = (payload) =>
    billingApi.post(endpoints.financialAccounts, payload)

export const updateFinancialAccount = (publicId, payload) =>
    billingApi.put(endpoints.financialAccountById(publicId), payload)

// ── Fechamento de Caixa ───────────────────────────────────────────────────────

export const getCashSessions = (companyPublicId, year, month) =>
    billingApi.get(endpoints.cashSessions, { params: { companyPublicId, year, month } })

export const getCashSessionDetail = (publicId, companyPublicId) =>
    billingApi.get(endpoints.cashSessionById(publicId), { params: { companyPublicId } })

export const openCashSession = (payload) =>
    billingApi.post(endpoints.cashSessions, payload)

export const closeCashSession = (publicId, payload) =>
    billingApi.post(endpoints.cashSessionClose(publicId), payload)

export const addCashMovement = (publicId, payload) =>
    billingApi.post(endpoints.cashSessionMovements(publicId), payload)

export const deleteCashMovement = (sessionPublicId, movementPublicId, companyPublicId) =>
    billingApi.delete(endpoints.cashSessionMovementById(sessionPublicId, movementPublicId), { params: { companyPublicId } })

export const reopenCashSession = (publicId, payload) =>
    billingApi.post(endpoints.cashSessionReopen(publicId), payload)

// ── Dashboard Financeiro ──────────────────────────────────────────────────────

export const getFinancialDashboard = (companyPublicId) =>
    billingApi.get(endpoints.financialDashboard, { params: { companyPublicId } })

// ── AP — Contas a Pagar ───────────────────────────────────────────────────────

export const getPayables = (companyPublicId, filters = {}) =>
    billingApi.get(endpoints.payables, { params: { companyPublicId, ...filters } })

export const getPayableById = (publicId) =>
    billingApi.get(endpoints.payableById(publicId))

export const createPayable = (payload) =>
    billingApi.post(endpoints.payables, payload)

export const recordPayablePayment = (payablePublicId, payload) =>
    billingApi.post(endpoints.recordPayment(payablePublicId), payload)

export const reversePayablePayment = (paymentPublicId, payload) =>
    billingApi.post(endpoints.reversePayment(paymentPublicId), payload)

export const cancelPayable = (payablePublicId, payload) =>
    billingApi.post(endpoints.cancelPayable(payablePublicId), payload)
