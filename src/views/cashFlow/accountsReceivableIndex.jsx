import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineX,
    HiOutlineCheckCircle,
    HiOutlineExclamationCircle,
    HiOutlineClock,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineBan,
    HiOutlineRefresh,
    HiOutlineCurrencyDollar,
    HiOutlineUser,
    HiOutlineDocumentText,
    HiOutlineCalendar,
    HiOutlineReceiptTax,
    HiOutlineArrowDown,
} from 'react-icons/hi'
import { Notification, toast } from '@/components/ui'
import { DateRangeFilter } from '@/components/shared'
import {
    getChargesByCompany,
    createCharge,
    recordSettlement,
    cancelCharge,
} from '@/api/billing/billingService'

// ─── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const STATUS_CFG = {
    pendente:    { label: 'Pendente',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',       dot: 'bg-amber-400 animate-pulse' },
    parcial:     { label: 'Parcial',     cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',               dot: 'bg-sky-400 animate-pulse' },
    vencido:     { label: 'Vencido',     cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',           dot: 'bg-rose-500 animate-pulse' },
    recebido:    { label: 'Recebido',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
    rascunho:    { label: 'Rascunho',    cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',              dot: 'bg-gray-400' },
    cancelado:   { label: 'Cancelado',   cls: 'bg-gray-100 text-gray-400 dark:bg-gray-700/60 dark:text-gray-500',           dot: 'bg-gray-300' },
    estornado:   { label: 'Estornado',   cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',   dot: 'bg-purple-400' },
    renegociado: { label: 'Renegociado', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',   dot: 'bg-orange-400' },
}

const INST_STATUS_CFG = {
    agendado:   { label: 'Agendado',   cls: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300' },
    parcial:    { label: 'Parcial',    cls: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-300' },
    pago:       { label: 'Pago',       cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' },
    vencido:    { label: 'Vencido',    cls: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-300' },
    dispensado: { label: 'Dispensado', cls: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

const PAYMENT_METHODS = [
    { value: 3, label: 'Dinheiro' },
    { value: 0, label: 'PIX' },
    { value: 2, label: 'Cartão' },
    { value: 1, label: 'Boleto' },
]

const KIND_OPTIONS = [
    { value: '', label: 'Todos os tipos' },
    { value: 'avulso', label: 'Avulso' },
    { value: 'procedimento', label: 'Procedimento' },
    { value: 'parcelado', label: 'Parcelado' },
    { value: 'recorrente', label: 'Recorrente' },
    { value: 'contrato', label: 'Contrato' },
]

// ChargeKind enum: OneOff=0, Procedure=1, Recurring=2, InstallmentPlan=3, Contract=4
const KIND_ENUM = { avulso: 0, procedimento: 1, parcelado: 3 }

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtDate = (iso) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

const todayIso = () => new Date().toISOString().split('T')[0]

const diffDays = (iso) => {
    if (!iso) return 0
    return Math.ceil((new Date() - new Date(iso + 'T12:00:00')) / 86400000)
}

// ─── EmptyState ────────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-1'>{action}</div>}
    </div>
)

// ─── StatusBadge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.rascunho
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

// ─── NovaCobrancaModal ─────────────────────────────────────────────────────────

function NovaCobrancaModal({ onClose, onConfirm, companyPublicId }) {
    const today = todayIso()
    const [form, setForm] = useState({
        consumerName: '',
        description: '',
        principalAmount: '',
        firstDueDate: today,
        installmentCount: 1,
        installmentPeriodicity: 1,
        kind: 0,
    })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
    const canSave = form.consumerName.trim() && form.description.trim() && Number(form.principalAmount) > 0 && form.firstDueDate

    const handleSave = async () => {
        setSaving(true)
        try {
            await onConfirm({
                companyPublicId,
                consumerName:           form.consumerName.trim(),
                description:            form.description.trim(),
                principalAmount:        Number(form.principalAmount),
                currency:               'BRL',
                kind:                   Number(form.installmentCount) > 1 ? 3 : form.kind,
                initialStatus:          2,
                paymentSelectionMode:   0,
                allowedPaymentMethods:  [],
                entryProfile:           0,
                installmentCount:       Number(form.installmentCount),
                installmentPeriodicity: Number(form.installmentCount) > 1 ? form.installmentPeriodicity : undefined,
                firstDueDateUtc:        form.firstDueDate ? new Date(form.firstDueDate + 'T12:00:00').toISOString() : undefined,
            })
        } finally { setSaving(false) }
    }

    const multi = form.installmentCount > 1

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg'>
                <div className='flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <div className='w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5'>
                        <HiOutlinePlus className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Nova Conta a Receber</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Registre um novo título de cobrança</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='p-6 space-y-4'>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Paciente / Devedor *</label>
                        <input value={form.consumerName} onChange={e => set('consumerName', e.target.value)}
                            placeholder='Nome do paciente ou empresa'
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30' />
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Descrição / Serviço *</label>
                        <input value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder='Ex: Tratamento de canal, Aparelho ortodôntico...'
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30' />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Valor Total (R$) *</label>
                            <input type='number' min='0.01' step='0.01' value={form.principalAmount} onChange={e => set('principalAmount', e.target.value)}
                                placeholder='0,00'
                                className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 tabular-nums font-semibold' />
                        </div>
                        <div>
                            <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Primeiro Vencimento *</label>
                            <input type='date' value={form.firstDueDate} onChange={e => set('firstDueDate', e.target.value)}
                                className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30' />
                        </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Nº de Parcelas</label>
                            <input type='number' min='1' max='60' value={form.installmentCount} onChange={e => set('installmentCount', parseInt(e.target.value) || 1)}
                                className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 tabular-nums' />
                        </div>
                        {multi && (
                            <div>
                                <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Periodicidade</label>
                                <select value={form.installmentPeriodicity} onChange={e => set('installmentPeriodicity', Number(e.target.value))}
                                    className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30'>
                                    <option value={1}>Mensal</option>
                                    <option value={0}>Semanal</option>
                                </select>
                            </div>
                        )}
                        {!multi && (
                            <div>
                                <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Tipo</label>
                                <select value={form.kind} onChange={e => set('kind', Number(e.target.value))}
                                    className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30'>
                                    <option value={0}>Avulso</option>
                                    <option value={1}>Procedimento</option>
                                    <option value={4}>Contrato</option>
                                </select>
                            </div>
                        )}
                    </div>
                    {form.principalAmount && Number(form.principalAmount) > 0 && multi && (
                        <div className='flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/30'>
                            <HiOutlineCurrencyDollar className='w-4 h-4 text-violet-500 shrink-0' />
                            <p className='text-xs text-violet-700 dark:text-violet-300'>
                                {form.installmentCount}x de{' '}
                                <strong>{fmt(Number(form.principalAmount) / form.installmentCount)}</strong>
                            </p>
                        </div>
                    )}
                </div>
                <div className='flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className='flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'>
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!canSave || saving}
                        className='flex-1 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition'>
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Salvando…</>
                            : <><HiOutlinePlus className='w-4 h-4' />Criar Cobrança</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── ReceberModal ──────────────────────────────────────────────────────────────

function ReceberModal({ charge, onClose, onConfirm }) {
    const today = todayIso()
    const [form, setForm] = useState({
        amount: charge.amountRemaining ?? charge.netPayableAmount,
        method: 3,
        date: today,
        externalRef: '',
    })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
    const canSave = Number(form.amount) > 0 && form.method !== ''

    const handleSave = async () => {
        setSaving(true)
        try {
            await onConfirm(charge.publicId, {
                amount:           Number(form.amount),
                method:           Number(form.method),
                source:           0,
                settledAtUtc:     new Date(form.date + 'T12:00:00').toISOString(),
                externalReference: form.externalRef.trim() || null,
            })
        } finally { setSaving(false) }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md'>
                <div className='flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <div className='w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5'>
                        <HiOutlineCheckCircle className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Registrar Recebimento</h3>
                        <p className='text-xs text-gray-400 mt-0.5 truncate'>
                            {charge.consumerName || charge.description}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='p-6 space-y-4'>
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Valor Recebido (R$) *</label>
                            <input type='number' min='0.01' step='0.01' value={form.amount} onChange={e => set('amount', e.target.value)}
                                className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 tabular-nums font-semibold' />
                        </div>
                        <div>
                            <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Data do Recebimento *</label>
                            <input type='date' value={form.date} onChange={e => set('date', e.target.value)}
                                className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30' />
                        </div>
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Forma de Pagamento *</label>
                        <div className='grid grid-cols-2 gap-2'>
                            {PAYMENT_METHODS.map(m => (
                                <button key={m.value} onClick={() => set('method', m.value)}
                                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${form.method === m.value ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-emerald-200 dark:hover:border-emerald-800/40'}`}>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Referência / Comprovante</label>
                        <input value={form.externalRef} onChange={e => set('externalRef', e.target.value)}
                            placeholder='Nº do comprovante, chave PIX, etc.'
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30' />
                    </div>
                    <div className='flex items-start gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50'>
                        <HiOutlineReceiptTax className='w-4 h-4 text-gray-400 mt-0.5 shrink-0' />
                        <div className='text-xs text-gray-500 dark:text-gray-400 space-y-0.5'>
                            <p>Saldo em aberto: <span className='font-bold text-gray-700 dark:text-gray-300 tabular-nums'>{fmt(charge.amountRemaining)}</span></p>
                            {charge.installmentCount > 1 && (
                                <p>Parcelas: {charge.installmentsPaid}/{charge.installmentCount} pagas</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className='flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'>
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={!canSave || saving}
                        className='flex-1 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20'>
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Confirmando…</>
                            : <><HiOutlineCheckCircle className='w-4 h-4' />Confirmar Recebimento</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── CancelarModal ─────────────────────────────────────────────────────────────

function CancelarModal({ charge, onClose, onConfirm }) {
    const [reason, setReason] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (!reason.trim()) return
        setSaving(true)
        try { await onConfirm(charge.publicId, { reason: reason.trim() }) }
        finally { setSaving(false) }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm'>
                <div className='flex items-start gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <div className='w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0 mt-0.5'>
                        <HiOutlineBan className='w-5 h-5 text-rose-600 dark:text-rose-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Cancelar Cobrança</h3>
                        <p className='text-xs text-gray-400 mt-0.5 truncate'>{charge.consumerName || charge.description}</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='p-6 space-y-4'>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Motivo do Cancelamento *</label>
                        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
                            placeholder='Descreva o motivo do cancelamento...'
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none' />
                    </div>
                    <div className='flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30'>
                        <HiOutlineExclamationCircle className='w-4 h-4 text-rose-500 shrink-0' />
                        <p className='text-xs text-rose-700 dark:text-rose-300'>Esta ação é irreversível. O título ficará com status <strong>Cancelado</strong>.</p>
                    </div>
                </div>
                <div className='flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className='flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'>
                        Voltar
                    </button>
                    <button onClick={handleSave} disabled={!reason.trim() || saving}
                        className='flex-1 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition'>
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Cancelando…</>
                            : <><HiOutlineBan className='w-4 h-4' />Cancelar Cobrança</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── ChargeDetailDrawer ────────────────────────────────────────────────────────

function ChargeDetailDrawer({ charge, onClose, onReceber, onCancelar }) {
    const canAct = ['pendente', 'parcial', 'vencido'].includes(charge.status)
    const canReceber = canAct
    const canCancelar = canAct || charge.status === 'rascunho'

    return (
        <div className='fixed inset-0 z-50 flex items-stretch justify-end' style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className='relative w-full max-w-xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col' onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'>
                    <div className='flex items-start gap-3 px-6 py-4'>
                        <div className='flex-1 min-w-0'>
                            <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold mb-0.5'>Conta a Receber</p>
                            <h2 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-snug truncate'>
                                {charge.consumerName || 'Sem identificação'}
                            </h2>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate'>{charge.description}</p>
                            <div className='flex items-center gap-2 mt-2 flex-wrap'>
                                <StatusBadge status={charge.status} />
                                {charge.kind && (
                                    <span className='text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium capitalize'>{charge.kind}</span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className='w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0'>
                            <HiOutlineX className='w-4 h-4' />
                        </button>
                    </div>

                    {/* KPI strip */}
                    <div className='grid grid-cols-3 border-t border-gray-100 dark:border-gray-800'>
                        {[
                            { label: 'Valor Total',   value: fmt(charge.netPayableAmount), color: 'text-gray-800 dark:text-gray-100' },
                            { label: 'Pago',          value: fmt(charge.amountPaid),        color: 'text-emerald-600 dark:text-emerald-400' },
                            { label: 'Saldo Aberto',  value: fmt(charge.amountRemaining),   color: charge.amountRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400' },
                        ].map(k => (
                            <div key={k.label} className='px-4 py-3 border-r border-gray-100 dark:border-gray-800 last:border-r-0'>
                                <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wide'>{k.label}</p>
                                <p className={`text-sm font-bold mt-0.5 tabular-nums ${k.color}`}>{k.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className='flex-1 px-6 py-5 space-y-6'>

                    {/* Info row */}
                    <div className='grid grid-cols-2 gap-3'>
                        {[
                            { label: 'Vencimento', value: fmtDate(charge.nextDueDate || charge.maturityDate), icon: <HiOutlineCalendar className='w-3.5 h-3.5' /> },
                            { label: 'Emissão', value: charge.createdAtUtc ? new Date(charge.createdAtUtc).toLocaleDateString('pt-BR') : '—', icon: <HiOutlineDocumentText className='w-3.5 h-3.5' /> },
                        ].map(i => (
                            <div key={i.label} className='flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/40'>
                                <span className='text-gray-400'>{i.icon}</span>
                                <div>
                                    <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wide'>{i.label}</p>
                                    <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums'>{i.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Installments */}
                    {charge.installmentCount > 1 && charge.installments?.length > 0 && (
                        <div>
                            <div className='flex items-center gap-2 mb-3'>
                                <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Parcelas</span>
                                <span className='px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500'>{charge.installmentCount}</span>
                                <div className='flex-1 h-px bg-gray-100 dark:bg-gray-700/60' />
                            </div>
                            <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                                {charge.installments.map((inst, i) => {
                                    const cfg = INST_STATUS_CFG[inst.status] ?? INST_STATUS_CFG.agendado
                                    return (
                                        <div key={inst.publicId} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/30 last:border-b-0 ${i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}>
                                            <span className='text-[10px] font-bold text-gray-400 w-5 text-center tabular-nums'>{inst.sequenceNumber}</span>
                                            <span className='text-xs text-gray-500 dark:text-gray-400 tabular-nums flex-1'>{fmtDate(inst.dueDate)}</span>
                                            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums'>{fmt(inst.amount)}</span>
                                            {inst.amountPaid > 0 && (
                                                <span className='text-[10px] text-emerald-600 dark:text-emerald-400 tabular-nums'>+{fmt(inst.amountPaid)}</span>
                                            )}
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Settlements */}
                    <div>
                        <div className='flex items-center gap-2 mb-3'>
                            <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>Recebimentos Registrados</span>
                            <span className='px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500'>{charge.settlements?.length ?? 0}</span>
                            <div className='flex-1 h-px bg-gray-100 dark:bg-gray-700/60' />
                        </div>
                        {!charge.settlements?.length ? (
                            <p className='text-xs text-gray-400 italic px-1'>Nenhum recebimento registrado ainda.</p>
                        ) : (
                            <div className='space-y-1.5'>
                                {charge.settlements.map(s => (
                                    <div key={s.publicId} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${s.reversed ? 'border-gray-100 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/20 opacity-60' : 'border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10'}`}>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-1.5'>
                                                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums'>{fmt(s.amount)}</span>
                                                <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500'>{s.method}</span>
                                                {s.reversed && <span className='text-[10px] text-rose-500 font-semibold'>Estornado</span>}
                                            </div>
                                            <p className='text-[11px] text-gray-400 tabular-nums mt-0.5'>
                                                {new Date(s.settledAtUtc).toLocaleDateString('pt-BR')}
                                                {s.externalReference && <> · {s.externalReference}</>}
                                            </p>
                                        </div>
                                        {!s.reversed && <HiOutlineCheckCircle className='w-4 h-4 text-emerald-500 flex-shrink-0' />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                {(canReceber || canCancelar) && (
                    <div className='sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex gap-2'>
                        {canCancelar && (
                            <button onClick={() => onCancelar(charge)}
                                className='flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition'>
                                <HiOutlineBan className='w-3.5 h-3.5' />
                                Cancelar
                            </button>
                        )}
                        {canReceber && (
                            <button onClick={() => onReceber(charge)}
                                className='flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-500/20'>
                                <HiOutlineCheckCircle className='w-4 h-4' />
                                Registrar Recebimento
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AccountsReceivableIndex() {
    const companyPublicId = useSelector(s => s.auth.user.companyPublicId)

    const [charges, setCharges]         = useState([])
    const [loading, setLoading]         = useState(false)
    const [search, setSearch]           = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')
    const [kindFilter, setKindFilter]   = useState('')
    const [dateRange, setDateRange]     = useState(null)
    const [page, setPage]               = useState(1)

    const [selectedCharge, setSelectedCharge] = useState(null)
    const [receberCharge, setReceberCharge]   = useState(null)
    const [cancelarCharge, setCancelarCharge] = useState(null)
    const [showNova, setShowNova]             = useState(false)

    const load = useCallback(async () => {
        if (!companyPublicId) return
        setLoading(true)
        try {
            const data = await getChargesByCompany(companyPublicId)
            setCharges(data ?? [])
        } catch {
            toast.push(<Notification type='danger' title='Erro ao carregar cobranças' />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [companyPublicId])

    useEffect(() => { load() }, [load])

    const PENDING_STATUSES = new Set(['pendente', 'rascunho'])
    const PARTIAL_STATUSES = new Set(['parcial'])
    const ACTIVE_STATUSES  = new Set(['pendente', 'parcial', 'rascunho'])

    const filtered = useMemo(() => {
        return charges.filter(c => {
            const matchSearch = !search || (c.consumerName?.toLowerCase().includes(search.toLowerCase())) || (c.description?.toLowerCase().includes(search.toLowerCase()))
            const matchKind = !kindFilter || c.kind === kindFilter
            const matchStatus = statusFilter === 'todos'
                ? true
                : statusFilter === 'pendente' ? ACTIVE_STATUSES.has(c.status)
                : statusFilter === 'vencido'  ? c.status === 'vencido'
                : statusFilter === 'recebido' ? c.status === 'recebido'
                : c.status === statusFilter
            const venc = c.nextDueDate || c.maturityDate
            const matchDate = !dateRange || (venc && venc >= dateRange.from && venc <= dateRange.to)
            return matchSearch && matchKind && matchStatus && matchDate
        })
    }, [charges, search, kindFilter, statusFilter, dateRange])

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE
        return filtered.slice(start, start + PAGE_SIZE)
    }, [filtered, page])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

    const summary = useMemo(() => {
        const sum = (pred, field = 'amountRemaining') => ({
            total: charges.filter(pred).reduce((a, c) => a + (c[field] ?? 0), 0),
            count: charges.filter(pred).length,
        })
        return {
            pendente: sum(c => ACTIVE_STATUSES.has(c.status)),
            vencido:  sum(c => c.status === 'vencido'),
            recebido: sum(c => c.status === 'recebido', 'amountPaid'),
        }
    }, [charges])

    const handleChangeFilter = (f) => { setStatusFilter(f); setPage(1) }

    const handleNovaSave = async (payload) => {
        try {
            await createCharge(payload)
            toast.push(<Notification type='success' title='Cobrança criada com sucesso' />, { placement: 'top-center' })
            setShowNova(false)
            load()
        } catch (err) {
            const msg = err?.response?.data
            toast.push(<Notification type='danger' title={typeof msg === 'string' ? msg : 'Erro ao criar cobrança'} />, { placement: 'top-center' })
            throw err
        }
    }

    const handleReceberSave = async (publicId, payload) => {
        try {
            await recordSettlement(publicId, payload)
            toast.push(<Notification type='success' title='Recebimento registrado' />, { placement: 'top-center' })
            setReceberCharge(null)
            setSelectedCharge(null)
            load()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao registrar recebimento' />, { placement: 'top-center' })
            throw new Error()
        }
    }

    const handleCancelarSave = async (publicId, payload) => {
        try {
            await cancelCharge(publicId, payload)
            toast.push(<Notification type='success' title='Cobrança cancelada' />, { placement: 'top-center' })
            setCancelarCharge(null)
            setSelectedCharge(null)
            load()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao cancelar cobrança' />, { placement: 'top-center' })
            throw new Error()
        }
    }

    const openReceber = (c) => { setSelectedCharge(null); setReceberCharge(c) }
    const openCancelar = (c) => { setSelectedCharge(null); setCancelarCharge(c) }

    // date field for DateRangeFilter: derive array of objects with a date field
    const chargesForFilter = useMemo(() =>
        charges.map(c => ({ ...c, _venc: c.nextDueDate || c.maturityDate })), [charges])

    return (
        <div className='space-y-5'>

            {/* Modals */}
            {showNova && (
                <NovaCobrancaModal companyPublicId={companyPublicId} onClose={() => setShowNova(false)} onConfirm={handleNovaSave} />
            )}
            {receberCharge && (
                <ReceberModal charge={receberCharge} onClose={() => setReceberCharge(null)} onConfirm={handleReceberSave} />
            )}
            {cancelarCharge && (
                <CancelarModal charge={cancelarCharge} onClose={() => setCancelarCharge(null)} onConfirm={handleCancelarSave} />
            )}
            {selectedCharge && (
                <ChargeDetailDrawer
                    charge={selectedCharge}
                    onClose={() => setSelectedCharge(null)}
                    onReceber={openReceber}
                    onCancelar={openCancelar}
                />
            )}

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                    <h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Contas a Receber</h1>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>Controle de títulos e recebimentos</p>
                </div>
                <div className='flex items-center gap-2'>
                    <button onClick={load} title='Atualizar' className='w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setShowNova(true)}
                        className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm self-start'>
                        <HiOutlinePlus className='w-4 h-4' />
                        Nova Cobrança
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {[
                    {
                        key: 'pendente', icon: <HiOutlineClock className='w-4 h-4 text-amber-500' />,
                        label: 'Pendente', labelColor: 'text-amber-600 dark:text-amber-400',
                        total: summary.pendente.total, count: summary.pendente.count,
                        totalColor: 'text-gray-800 dark:text-gray-100', bar: 'from-amber-400 via-amber-200 to-transparent',
                        foot: 'Aguardando recebimento',
                        selected: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600',
                        hover: 'hover:border-amber-200',
                    },
                    {
                        key: 'vencido', icon: <HiOutlineExclamationCircle className='w-4 h-4 text-rose-500' />,
                        label: 'Vencido', labelColor: 'text-rose-600 dark:text-rose-400',
                        total: summary.vencido.total, count: summary.vencido.count,
                        totalColor: 'text-rose-600 dark:text-rose-400', bar: 'from-rose-400 via-rose-200 to-transparent',
                        foot: 'Atenção imediata',
                        selected: 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600',
                        hover: 'hover:border-rose-200',
                    },
                    {
                        key: 'recebido', icon: <HiOutlineCheckCircle className='w-4 h-4 text-emerald-500' />,
                        label: 'Recebido', labelColor: 'text-emerald-600 dark:text-emerald-400',
                        total: summary.recebido.total, count: summary.recebido.count,
                        totalColor: 'text-emerald-600 dark:text-emerald-400', bar: 'from-emerald-400 via-emerald-200 to-transparent',
                        foot: 'Total recebido',
                        selected: 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600',
                        hover: 'hover:border-emerald-200',
                    },
                ].map(card => (
                    <button key={card.key} onClick={() => handleChangeFilter(statusFilter === card.key ? 'todos' : card.key)}
                        className={`text-left p-5 rounded-2xl border transition-all shadow-sm ${statusFilter === card.key ? card.selected : `border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 ${card.hover}`}`}>
                        <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center gap-2'>
                                {card.icon}
                                <span className={`text-xs font-medium ${card.labelColor}`}>{card.label}</span>
                            </div>
                            <span className='text-xs text-gray-400'>{card.count} título{card.count !== 1 ? 's' : ''}</span>
                        </div>
                        <p className={`text-2xl font-bold tabular-nums ${card.totalColor}`}>{fmt(card.total)}</p>
                        <div className={`h-[1.5px] bg-gradient-to-r ${card.bar} mt-3`} />
                        <p className='text-[11px] text-gray-400 mt-2'>{card.foot}</p>
                    </button>
                ))}
            </div>

            {/* Date filter */}
            <DateRangeFilter
                data={chargesForFilter}
                dateField='_venc'
                label='Período de vencimento'
                onChange={setDateRange}
                onPageReset={() => setPage(1)}
            />

            {/* Filters */}
            <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 shadow-sm'>
                <div className='flex flex-col sm:flex-row gap-3'>
                    <div className='relative flex-1'>
                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder='Buscar paciente ou descrição...'
                            className='w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400' />
                    </div>
                    <div className='flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl'>
                        {[
                            { k: 'todos', l: 'Todos' },
                            { k: 'pendente', l: 'Pendentes' },
                            { k: 'vencido', l: 'Vencidos' },
                            { k: 'recebido', l: 'Recebidos' },
                        ].map(f => (
                            <button key={f.k} onClick={() => handleChangeFilter(f.k)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all whitespace-nowrap ${statusFilter === f.k ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                {f.l}
                            </button>
                        ))}
                    </div>
                    <select value={kindFilter} onChange={e => { setKindFilter(e.target.value); setPage(1) }}
                        className='px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'>
                        {KIND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
                <div className='px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                        {filtered.length} {filtered.length === 1 ? 'título' : 'títulos'}
                    </p>
                    <div className='flex items-center gap-2 text-xs text-gray-400'>
                        <HiOutlineArrowDown className='w-3.5 h-3.5' />
                        <span>Mais recentes primeiro</span>
                    </div>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30'>
                                <th className='px-5 py-3 text-left font-medium'>Paciente / Descrição</th>
                                <th className='px-4 py-3 text-right font-medium'>Valor</th>
                                <th className='px-4 py-3 text-center font-medium hidden sm:table-cell'>Vencimento</th>
                                <th className='px-4 py-3 text-center font-medium hidden md:table-cell'>Atraso</th>
                                <th className='px-4 py-3 text-center font-medium hidden lg:table-cell'>Parcelas</th>
                                <th className='px-4 py-3 text-center font-medium'>Status</th>
                                <th className='px-5 py-3 text-center font-medium'>Ações</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50 dark:divide-gray-700/20'>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className='px-5 py-12 text-center'>
                                        <div className='flex items-center justify-center gap-3 text-gray-400'>
                                            <div className='w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin' />
                                            <span className='text-sm'>Carregando cobranças…</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {!loading && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={7}>
                                        <EmptyState
                                            icon={<HiOutlineDocumentText />}
                                            message='Nenhum título encontrado'
                                            sub='Tente ajustar os filtros ou crie uma nova cobrança'
                                            action={
                                                <button onClick={() => setShowNova(true)} className='text-xs text-indigo-500 hover:text-indigo-700 font-semibold'>
                                                    Nova cobrança →
                                                </button>
                                            }
                                        />
                                    </td>
                                </tr>
                            )}
                            {!loading && paginated.map(c => {
                                const venc = c.nextDueDate || c.maturityDate
                                const atrasoDias = c.status === 'vencido' ? diffDays(venc) : 0
                                const canAct = ['pendente', 'parcial', 'vencido'].includes(c.status)
                                const parcelaStr = c.installmentCount > 1
                                    ? `${c.installmentsPaid}/${c.installmentCount}`
                                    : '1/1'
                                return (
                                    <tr key={c.publicId} onClick={() => setSelectedCharge(c)}
                                        className='hover:bg-gray-50/60 dark:hover:bg-gray-700/10 transition-colors cursor-pointer group'>
                                        <td className='px-5 py-3.5'>
                                            <div className='flex items-center gap-2.5'>
                                                <div className='w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0'>
                                                    <HiOutlineUser className='w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400' />
                                                </div>
                                                <div className='min-w-0'>
                                                    <p className='font-semibold text-gray-700 dark:text-gray-200 text-sm leading-snug truncate max-w-[200px]'>
                                                        {c.consumerName || <span className='text-gray-400 italic'>Sem nome</span>}
                                                    </p>
                                                    <p className='text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]'>{c.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-4 py-3.5 text-right'>
                                            <p className='font-bold tabular-nums text-gray-800 dark:text-gray-100 text-sm'>{fmt(c.netPayableAmount)}</p>
                                            {c.amountPaid > 0 && c.status !== 'recebido' && (
                                                <p className='text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums'>+{fmt(c.amountPaid)} pago</p>
                                            )}
                                        </td>
                                        <td className='px-4 py-3.5 text-center hidden sm:table-cell'>
                                            <span className={`text-xs tabular-nums ${c.status === 'vencido' ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {fmtDate(venc)}
                                            </span>
                                        </td>
                                        <td className='px-4 py-3.5 text-center hidden md:table-cell'>
                                            {c.status === 'vencido' ? (
                                                <span className='text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full tabular-nums'>
                                                    {atrasoDias}d
                                                </span>
                                            ) : (
                                                <span className='text-xs text-gray-400'>—</span>
                                            )}
                                        </td>
                                        <td className='px-4 py-3.5 text-center text-xs text-gray-400 hidden lg:table-cell tabular-nums'>
                                            {parcelaStr}
                                        </td>
                                        <td className='px-4 py-3.5 text-center'>
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className='px-5 py-3.5 text-center' onClick={e => e.stopPropagation()}>
                                            {canAct ? (
                                                <div className='flex items-center justify-center gap-1.5'>
                                                    <button onClick={() => openReceber(c)}
                                                        className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors'>
                                                        <HiOutlineCheckCircle className='w-3.5 h-3.5' />
                                                        Receber
                                                    </button>
                                                    <button onClick={() => openCancelar(c)}
                                                        className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition'>
                                                        <HiOutlineBan className='w-3.5 h-3.5' />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className='text-xs text-gray-400'>
                                                    {c.status === 'recebido' ? fmtDate(c.settlements?.[0]?.settledAtUtc ? new Date(c.settlements[0].settledAtUtc).toISOString().split('T')[0] : null) : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className='px-5 py-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between'>
                        <p className='text-xs text-gray-400'>
                            Página {page} de {totalPages} · {filtered.length} registros
                        </p>
                        <div className='flex items-center gap-1'>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-500 dark:text-gray-400 transition-colors'>
                                <HiOutlineChevronLeft className='w-4 h-4' />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                                <button key={n} onClick={() => setPage(n)}
                                    className={`w-7 h-7 text-xs rounded-lg font-medium transition-colors ${n === page ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                    {n}
                                </button>
                            ))}
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 text-gray-500 dark:text-gray-400 transition-colors'>
                                <HiOutlineChevronRight className='w-4 h-4' />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
