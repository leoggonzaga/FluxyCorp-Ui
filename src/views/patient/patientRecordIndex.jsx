import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Badge, Card, Notification, Tabs, toast } from '@/components/ui'
import { Pattern1 } from '@/components/shared/listPatterns'
import {
    HiOutlineCalendar,
    HiOutlineChevronLeft,
    HiOutlineChevronDown,
    HiOutlineChevronRight,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCollection,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineExclamation,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlinePhotograph,
    HiOutlinePencil,
    HiOutlinePlay,
    HiOutlinePlus,
    HiOutlinePrinter,
    HiOutlineAnnotation,
    HiOutlineTrash,
    HiOutlineBell,
    HiOutlineCheckCircle,
    HiOutlineShieldCheck,
    HiOutlineHashtag,
    HiOutlineX,
    HiOutlineBan,
    HiOutlineCash,
    HiOutlineCreditCard,
    HiOutlineReceiptRefund,
} from 'react-icons/hi'
import SectionCard from './components/SectionCard'
import AppointmentCard from './components/AppointmentCard'
import FilePermissionPopover from './components/FilePermissionPopover'
import ConsumerUpsertDialog from './components/ConsumerUpsertDialog'
import {
    getConsumerById,
    getConsumerConvenios,
    getConsumerNotes,
    createConsumerNote,
    deleteConsumerNote,
} from '@/api/consumer/consumerService'
import { sessionGetByPatient } from '@/api/consultation/consultationService'
import { getAppointmentsByPatient } from '@/api/appointment/appointmentService'
import { operadorasGetByCompany } from '@/api/enterprise/EnterpriseService'
import { mergeConsumerConvenioForUi } from '@/views/patient/mergeConsumerConvenio'
import ConsumerSearchInput from '@/components/shared/ConsumerSearchInput'
import {
    getChargesByConsumer,
    createCharge,
    recordSettlement,
    cancelCharge as cancelChargeApi,
} from '@/api/billing/billingService'

// ─── Empty state ─────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-8 gap-2.5 select-none'>
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

// ─── Billing helpers ──────────────────────────────────────────────────────────

const PAYMENT_METHOD_MAP = { Pix: 0, Boleto: 1, Card: 2, Cash: 3 }
const ALL_PAYMENT_METHODS = ['Pix', 'Boleto', 'Card', 'Cash']
const PM_LABELS = { Pix: 'PIX', Boleto: 'Boleto', Card: 'Cartão', Cash: 'Dinheiro' }

const CHARGE_STATUS_CFG = {
    0: { label: 'Rascunho',    barColor: 'bg-gray-300',     badgeClass: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
    1: { label: 'Pendente',    barColor: 'bg-gray-400',     badgeClass: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700' },
    2: { label: 'Em aberto',   barColor: 'bg-blue-400',     badgeClass: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
    3: { label: 'Parc. pago',  barColor: 'bg-amber-400',    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
    4: { label: 'Pago',        barColor: 'bg-emerald-500',  badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
    5: { label: 'Vencida',     barColor: 'bg-red-500',      badgeClass: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
    6: { label: 'Cancelada',   barColor: 'bg-gray-300',     badgeClass: 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700' },
    7: { label: 'Renegociada', barColor: 'bg-purple-400',   badgeClass: 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800' },
    8: { label: 'Estornada',   barColor: 'bg-gray-400',     badgeClass: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
    9: { label: 'Falhou',      barColor: 'bg-red-300',      badgeClass: 'bg-red-50 text-red-400 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' },
}

const INSTALLMENT_STATUS_CFG = {
    0: { label: 'Agendada',   dotClass: 'bg-gray-400' },
    1: { label: 'Parc. pago', dotClass: 'bg-amber-400' },
    2: { label: 'Pago',       dotClass: 'bg-emerald-500' },
    3: { label: 'Vencida',    dotClass: 'bg-red-500' },
    4: { label: 'Dispensada', dotClass: 'bg-gray-300' },
}

const fmtBrl = (v) => {
    const n = Math.abs(v ?? 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `R$ ${n}`
}
const fmtDateUtc = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}
const chargeKindLabel = (kind) => [3, 4].includes(kind) ? 'Parcelada' : 'Avulsa'

const EMPTY_CHARGE_FORM = {
    description: '', amount: '', tipo: 'avulsa', vencimento: '',
    nParcelas: 2, periodicidade: 1, temEntrada: false, entrada: '',
    paymentMethods: ['Pix', 'Cash'], temDesconto: false, tipoDesconto: 0, desconto: '',
}

const inputClsBilling = (accent) =>
    `w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 ${accent} focus:border-transparent outline-none`

// ─── NewChargeDialog ──────────────────────────────────────────────────────────

const NewChargeDialog = ({ open, onClose, onSaved, consumerPublicId, companyPublicId }) => {
    const [step, setStep] = useState(1)
    const [form, setForm] = useState(EMPTY_CHARGE_FORM)
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    useEffect(() => {
        if (!open) { setStep(1); setForm(EMPTY_CHARGE_FORM) }
    }, [open])

    const togglePm = (pm) => set('paymentMethods',
        form.paymentMethods.includes(pm)
            ? form.paymentMethods.filter(x => x !== pm)
            : [...form.paymentMethods, pm]
    )

    const canNext = form.amount && parseFloat(form.amount) > 0 && form.vencimento

    const submit = async () => {
        setSaving(true)
        const isParc = form.tipo === 'parcelada'
        const result = await createCharge({
            companyPublicId,
            consumerPublicId,
            kind: isParc ? 3 : 0,
            initialStatus: 2,
            principalAmount: parseFloat(form.amount),
            currency: 'BRL',
            paymentSelectionMode: 1,
            allowedPaymentMethods: form.paymentMethods.map(m => PAYMENT_METHOD_MAP[m]),
            entryProfile: isParc && form.temEntrada ? 1 : 0,
            installmentCount: isParc ? Number(form.nParcelas) : 1,
            installmentPeriodicity: isParc ? Number(form.periodicidade) : undefined,
            firstDueDateUtc: form.vencimento ? new Date(form.vencimento).toISOString() : undefined,
            downPaymentOrSignalAmount: isParc && form.temEntrada && form.entrada ? parseFloat(form.entrada) : undefined,
            applyInterestAfterDue: false,
            gracePeriodDaysAfterDue: 0,
            description: form.description || undefined,
            discounts: form.temDesconto && form.desconto ? [{
                kind: Number(form.tipoDesconto),
                amount: form.tipoDesconto == 0 ? parseFloat(form.desconto) : undefined,
                percent: form.tipoDesconto == 1 ? parseFloat(form.desconto) : undefined,
                reason: '',
            }] : [],
        })
        setSaving(false)
        if (result) { onSaved(result); onClose() }
    }

    if (!open) return null
    const ic = inputClsBilling('focus:ring-violet-400')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden'>
                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                        <HiOutlineCurrencyDollar className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>Nova Cobrança</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Etapa {step} de 2 — {step === 1 ? 'Dados da cobrança' : 'Pagamento'}</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                {/* Progress */}
                <div className='flex gap-1 px-6 pt-4'>
                    {[1,2].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-violet-500' : 'bg-gray-100 dark:bg-gray-700'}`} />
                    ))}
                </div>
                {/* Body */}
                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[60vh]'>
                    {step === 1 && <>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Descrição</label>
                            <input className={ic} placeholder='Ex: Consulta, Tratamento, Procedimento...'
                                value={form.description} onChange={e => set('description', e.target.value)} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Valor (R$) *</label>
                            <input type='number' min='0' step='0.01' className={ic} placeholder='0,00'
                                value={form.amount} onChange={e => set('amount', e.target.value)} />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Tipo</label>
                            <div className='flex gap-2'>
                                {[{v:'avulsa',l:'Avulsa'},{v:'parcelada',l:'Parcelada'}].map(({v,l}) => (
                                    <button key={v} onClick={() => set('tipo', v)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${form.tipo === v ? 'bg-violet-600 text-white border-violet-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-violet-400'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {form.tipo === 'avulsa' && (
                            <div>
                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Vencimento *</label>
                                <input type='date' className={ic} value={form.vencimento} onChange={e => set('vencimento', e.target.value)} />
                            </div>
                        )}
                        {form.tipo === 'parcelada' && (
                            <div className='space-y-3 p-3.5 bg-violet-50/60 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/40'>
                                <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Parcelas</label>
                                        <select className={ic.replace('focus:ring-violet-400', '')} value={form.nParcelas} onChange={e => set('nParcelas', e.target.value)}>
                                            {Array.from({length:23},(_,i)=>i+2).map(n=>(
                                                <option key={n} value={n}>{n}x</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Periodicidade</label>
                                        <select className={ic.replace('focus:ring-violet-400', '')} value={form.periodicidade} onChange={e => set('periodicidade', e.target.value)}>
                                            <option value={1}>Mensal</option>
                                            <option value={0}>Semanal</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Vencimento da 1ª parcela *</label>
                                    <input type='date' className={ic} value={form.vencimento} onChange={e => set('vencimento', e.target.value)} />
                                </div>
                                <div className='flex items-center justify-between pt-1'>
                                    <span className='text-xs font-semibold text-gray-500 dark:text-gray-400'>Cobrar entrada</span>
                                    <button onClick={() => set('temEntrada', !form.temEntrada)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${form.temEntrada ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.temEntrada ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                                {form.temEntrada && (
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Valor da entrada (R$)</label>
                                        <input type='number' min='0' step='0.01' className={ic} placeholder='0,00'
                                            value={form.entrada} onChange={e => set('entrada', e.target.value)} />
                                    </div>
                                )}
                            </div>
                        )}
                    </>}

                    {step === 2 && <>
                        <div>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2'>Formas de pagamento aceitas *</p>
                            <div className='grid grid-cols-2 gap-2'>
                                {ALL_PAYMENT_METHODS.map(pm => {
                                    const active = form.paymentMethods.includes(pm)
                                    return (
                                        <button key={pm} onClick={() => togglePm(pm)}
                                            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${active ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-violet-200'}`}>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-violet-500 bg-violet-500' : 'border-gray-300'}`}>
                                                {active && <span className='w-2 h-2 bg-white rounded-full' />}
                                            </div>
                                            <span className={`text-sm font-semibold ${active ? 'text-violet-700 dark:text-violet-300' : 'text-gray-600 dark:text-gray-300'}`}>{PM_LABELS[pm]}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <div className='flex items-center justify-between mb-2'>
                                <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>Aplicar desconto</p>
                                <button onClick={() => set('temDesconto', !form.temDesconto)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${form.temDesconto ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.temDesconto ? 'left-5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            {form.temDesconto && (
                                <div className='grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Tipo</label>
                                        <select className={inputClsBilling('focus:ring-violet-400')} value={form.tipoDesconto} onChange={e => set('tipoDesconto', e.target.value)}>
                                            <option value={0}>Valor fixo (R$)</option>
                                            <option value={1}>Percentual (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>{form.tipoDesconto == 0 ? 'Valor (R$)' : 'Percentual (%)'}</label>
                                        <input type='number' min='0' step='0.01' className={ic} placeholder='0'
                                            value={form.desconto} onChange={e => set('desconto', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>}
                </div>
                {/* Footer */}
                <div className='flex justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={() => step === 1 ? onClose() : setStep(1)}
                        className='px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                        {step === 1 ? 'Cancelar' : 'Voltar'}
                    </button>
                    {step === 1 ? (
                        <button onClick={() => setStep(2)} disabled={!canNext}
                            className='px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition'>
                            Continuar
                        </button>
                    ) : (
                        <button onClick={submit} disabled={saving || form.paymentMethods.length === 0}
                            className='px-5 py-2 rounded-xl text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition'>
                            {saving && <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />}
                            Criar Cobrança
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── RecordPaymentDialog ──────────────────────────────────────────────────────

const RecordPaymentDialog = ({ charge, onClose, onSaved }) => {
    const allowedMethods = charge?.allowedPaymentMethods ?? ALL_PAYMENT_METHODS
    const [form, setForm] = useState({ amount: '', method: '', settledAt: new Date().toISOString().slice(0,10), externalReference: '' })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    useEffect(() => {
        if (charge) {
            const rem = Math.max(0, charge.netPayableAmount - charge.amountPaid).toFixed(2)
            const methods = charge.allowedPaymentMethods?.length ? charge.allowedPaymentMethods : ALL_PAYMENT_METHODS
            setForm({ amount: rem, method: methods[0], settledAt: new Date().toISOString().slice(0,10), externalReference: '' })
        }
    }, [charge])

    if (!charge) return null

    const remaining = Math.max(0, charge.netPayableAmount - charge.amountPaid)

    const submit = async () => {
        setSaving(true)
        const result = await recordSettlement(charge.publicId, {
            chargePublicId: charge.publicId,
            amount: parseFloat(form.amount),
            method: PAYMENT_METHOD_MAP[form.method] ?? 3,
            source: 0,
            externalReference: form.externalReference || undefined,
            settledAtUtc: new Date(form.settledAt).toISOString(),
        })
        setSaving(false)
        if (result !== null) { onSaved(); onClose() }
    }

    const ic = inputClsBilling('focus:ring-amber-400')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
                        <HiOutlineCash className='w-5 h-5 text-amber-600 dark:text-amber-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>Registrar Pagamento</h3>
                        <p className='text-xs text-gray-400 mt-0.5 truncate'>{charge.description || chargeKindLabel(charge.kind)} · {fmtBrl(charge.principalAmount)}</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='px-6 py-5 space-y-4'>
                    <div className='p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 flex justify-between items-center'>
                        <span className='text-xs font-semibold text-amber-700 dark:text-amber-400'>Saldo devedor</span>
                        <span className='font-bold text-amber-700 dark:text-amber-300'>{fmtBrl(remaining)}</span>
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Valor a liquidar (R$)</label>
                        <input type='number' min='0.01' step='0.01' className={ic} placeholder='0,00'
                            value={form.amount} onChange={e => set('amount', e.target.value)} />
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2'>Forma de pagamento</label>
                        <div className='grid grid-cols-2 gap-2'>
                            {allowedMethods.map(pm => {
                                const active = form.method === pm
                                return (
                                    <button key={pm} onClick={() => set('method', pm)}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${active ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-amber-200'}`}>
                                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${active ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`} />
                                        <span className={`text-sm font-semibold ${active ? 'text-amber-700 dark:text-amber-300' : 'text-gray-600 dark:text-gray-300'}`}>{PM_LABELS[pm]}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Data do pagamento</label>
                        <input type='date' className={ic} value={form.settledAt} onChange={e => set('settledAt', e.target.value)} />
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Referência <span className='font-normal text-gray-300'>(opcional)</span></label>
                        <input className={ic} placeholder='Código de transação, comprovante...'
                            value={form.externalReference} onChange={e => set('externalReference', e.target.value)} />
                    </div>
                </div>
                <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>Cancelar</button>
                    <button onClick={submit} disabled={saving || !form.amount || parseFloat(form.amount) <= 0}
                        className='px-5 py-2 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition'>
                        {saving && <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />}
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── CancelChargeDialog ───────────────────────────────────────────────────────

const CancelChargeDialog = ({ charge, onClose, onSaved }) => {
    const [motivo, setMotivo] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => { if (!charge) setMotivo('') }, [charge])

    if (!charge) return null

    const submit = async () => {
        if (!motivo.trim()) return
        setSaving(true)
        const result = await cancelChargeApi(charge.publicId, { chargePublicId: charge.publicId, reason: motivo.trim() })
        setSaving(false)
        if (result !== null) { onSaved(); onClose() }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center'>
                        <HiOutlineBan className='w-5 h-5 text-red-600 dark:text-red-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>Cancelar Cobrança</h3>
                        <p className='text-xs text-gray-400 mt-0.5 truncate'>{charge.description || chargeKindLabel(charge.kind)} · {fmtBrl(charge.principalAmount)}</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='px-6 py-5'>
                    <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Motivo do cancelamento</label>
                    <textarea
                        className='w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none'
                        rows={3} placeholder='Descreva o motivo...'
                        value={motivo} onChange={e => setMotivo(e.target.value)}
                    />
                </div>
                <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>Voltar</button>
                    <button onClick={submit} disabled={saving || !motivo.trim()}
                        className='px-5 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition'>
                        {saving && <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />}
                        Cancelar Cobrança
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const PATIENTS = [
    {
        id: 1,
        name: 'João Silva',
        gender: 'male',
        birthDate: '1985-03-15',
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        email: 'joao.silva@email.com',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        bloodType: 'A+',
        allergies: ['Penicilina', 'Ibuprofeno'],
        insurance: 'Unimed',
        insuranceNumber: '123456',
        financial: {
            balance: -320.0,
            history: [
                { id: 1, date: '2026-04-01', description: 'Consulta Geral', value: -150.0, status: 'paid' },
                { id: 2, date: '2026-03-15', description: 'Limpeza Dental', value: -200.0, status: 'paid' },
                { id: 3, date: '2026-04-10', description: 'Retorno', value: -120.0, status: 'pending' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-04-01', time: '10:00', service: 'Consulta Geral', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Paciente relatou dores nas costas.',
                procedures: [
                    { id: 1, name: 'Consulta Clínica', qty: 1, value: 150.0, status: 'done', executedBy: 'Dr. Carlos' },
                    { id: 2, name: 'Eletrocardiograma', qty: 1, value: 80.0, status: 'done', executedBy: 'Dra. Fernanda' },
                    { id: 3, name: 'Aplicação de Injeção', qty: 2, value: 30.0, status: 'done', executedBy: 'Enf. Paulo' },
                ],
            },
            {
                id: 2, date: '2026-03-15', time: '09:30', service: 'Limpeza Dental', professional: 'Dra. Ana', status: 'completed',
                notes: 'Procedimento sem intercorrências.',
                procedures: [
                    { id: 1, name: 'Profilaxia Dental', qty: 1, value: 120.0, status: 'done', executedBy: 'Dra. Ana' },
                    { id: 2, name: 'Aplicação de Flúor', qty: 1, value: 50.0, status: 'done', executedBy: 'Dra. Ana' },
                    { id: 3, name: 'Restauração Resina', qty: 2, value: 200.0, status: 'cancelled', executedBy: 'Dra. Ana' },
                ],
            },
            {
                id: 3, date: '2026-02-10', time: '11:00', service: 'Avaliação', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Solicitado exame de sangue.',
                procedures: [
                    { id: 1, name: 'Avaliação Inicial', qty: 1, value: 100.0, status: 'done', executedBy: 'Dr. Bruno' },
                ],
            },
        ],
        nextAppointments: [
            { id: 4, date: '2026-04-20', time: '10:00', service: 'Retorno', professional: 'Dr. Carlos' },
            { id: 5, date: '2026-05-05', time: '14:30', service: 'Limpeza', professional: 'Dra. Ana' },
        ],
        pendingTreatments: [
            { id: 1, treatment: 'Exame de Sangue', priority: 'high', requestedBy: 'Dr. Bruno', requestedAt: '2026-02-10', notes: 'Solicitar hemograma completo e glicemia.' },
            { id: 2, treatment: 'Raio-X Coluna', priority: 'medium', requestedBy: 'Dr. Carlos', requestedAt: '2026-04-01', notes: 'Coluna lombar e torácica.' },
        ],
    },
    {
        id: 2, name: 'Maria Santos', gender: 'female', birthDate: '1992-07-22', cpf: '987.654.321-00',
        phone: '(11) 99876-5432', email: 'maria.santos@email.com', address: 'Av. Paulista, 500 - São Paulo/SP',
        bloodType: 'O-', allergies: [], insurance: 'Bradesco Saúde', insuranceNumber: '789012',
        financial: {
            balance: 50.0,
            history: [
                { id: 1, date: '2026-03-20', description: 'Consulta', value: -200.0, status: 'paid' },
                { id: 2, date: '2026-03-20', description: 'Crédito', value: 250.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-20', time: '15:00', service: 'Consulta', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Sem queixas relevantes.',
                procedures: [{ id: 1, name: 'Consulta Clínica', qty: 1, value: 200.0, status: 'done', executedBy: 'Dr. Carlos' }],
            },
        ],
        nextAppointments: [{ id: 2, date: '2026-04-25', time: '09:00', service: 'Revisão', professional: 'Dr. Carlos' }],
        pendingTreatments: [],
    },
    {
        id: 3, name: 'Pedro Oliveira', gender: 'male', birthDate: '1978-11-08', cpf: '456.789.123-00',
        phone: '(11) 97654-3210', email: 'pedro.oliveira@email.com', address: 'Rua Augusta, 90 - São Paulo/SP',
        bloodType: 'B+', allergies: ['Dipirona'], insurance: 'SulAmérica', insuranceNumber: '345678',
        financial: {
            balance: -80.0,
            history: [
                { id: 1, date: '2026-04-05', description: 'Tratamento', value: -300.0, status: 'paid' },
                { id: 2, date: '2026-04-05', description: 'Crédito Plano', value: 220.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-04-05', time: '11:00', service: 'Avaliação', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Tratamento iniciado.',
                procedures: [
                    { id: 1, name: 'Avaliação Clínica', qty: 1, value: 120.0, status: 'done', executedBy: 'Dr. Bruno' },
                    { id: 2, name: 'Curativo Simples', qty: 3, value: 60.0, status: 'done', executedBy: 'Enf. Carla' },
                ],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [
            { id: 1, treatment: 'Ultrassom Abdominal', priority: 'low', requestedBy: 'Dr. Bruno', requestedAt: '2026-04-05', notes: 'Acompanhamento de rotina.' },
        ],
    },
    {
        id: 4, name: 'Ana Costa', gender: 'female', birthDate: '1995-01-12', cpf: '321.654.987-00',
        phone: '(11) 96543-2109', email: 'ana.costa@email.com', address: 'Av. Brasil, 456 - São Paulo/SP',
        bloodType: 'AB-', allergies: [], insurance: 'Sulamerica', insuranceNumber: '567890',
        financial: {
            balance: 0.0,
            history: [
                { id: 1, date: '2026-03-05', description: 'Limpeza', value: -100.0, status: 'paid' },
                { id: 2, date: '2026-03-05', description: 'Reembolso', value: 100.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-05', time: '11:00', service: 'Limpeza Dental', professional: 'Dra. Ana', status: 'completed',
                notes: 'Paciente jovem, sem problemas.',
                procedures: [{ id: 1, name: 'Profilaxia Dental', qty: 1, value: 100.0, status: 'done', executedBy: 'Dra. Ana' }],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [],
    },
    {
        id: 5, name: 'Carlos Mendes', gender: 'male', birthDate: '1980-09-30', cpf: '789.123.456-00',
        phone: '(11) 95432-1098', email: 'carlos.mendes@email.com', address: 'Rua Verde, 321 - São Paulo/SP',
        bloodType: 'O+', allergies: ['Penicilina'], insurance: 'Unimed', insuranceNumber: '901234',
        financial: {
            balance: -200.0,
            history: [{ id: 1, date: '2026-02-20', description: 'Extração', value: -200.0, status: 'paid' }],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-02-20', time: '16:00', service: 'Cirurgia', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Extração de dente do siso.',
                procedures: [{ id: 1, name: 'Extração Dental', qty: 1, value: 200.0, status: 'done', executedBy: 'Dr. Bruno' }],
            },
        ],
        nextAppointments: [{ id: 2, date: '2026-05-01', time: '16:00', service: 'Retorno', professional: 'Dr. Bruno' }],
        pendingTreatments: [],
    },
    {
        id: 6, name: 'Fernanda Lima', gender: 'female', birthDate: '1988-05-18', cpf: '654.321.987-00',
        phone: '(11) 94321-0987', email: 'fernanda.lima@email.com', address: 'Rua Azul, 654 - São Paulo/SP',
        bloodType: 'A-', allergies: ['Ibuprofeno'], insurance: 'Bradesco Saúde', insuranceNumber: '123789',
        financial: {
            balance: 75.0,
            history: [
                { id: 1, date: '2026-03-01', description: 'Consulta', value: -150.0, status: 'paid' },
                { id: 2, date: '2026-03-01', description: 'Desconto', value: 225.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-01', time: '10:30', service: 'Consulta Geral', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Paciente com dores de dente.',
                procedures: [{ id: 1, name: 'Consulta Clínica', qty: 1, value: 150.0, status: 'done', executedBy: 'Dr. Carlos' }],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [
            { id: 1, treatment: 'Canal', priority: 'medium', requestedBy: 'Dr. Carlos', requestedAt: '2026-03-01', notes: 'Dente 14 necessita tratamento de canal.' },
        ],
    },
]

const MOCK_IMAGE_SOURCES = [
    '/img/thumbs/layouts/modern.jpg',
    '/img/thumbs/layouts/classic.jpg',
    '/img/thumbs/layouts/simple.jpg',
    '/img/thumbs/layouts/decked.jpg',
    '/img/thumbs/layouts/stackedSide.jpg',
]

const buildMockImages = () =>
    Array.from({ length: 20 }, (_, i) => ({
        id: `img-${i + 1}`,
        name: `Imagem Clinica ${String(i + 1).padStart(2, '0')}`,
        url: MOCK_IMAGE_SOURCES[i % MOCK_IMAGE_SOURCES.length],
        createdAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        size: 250000 + i * 11000,
        permissions: [],
    }))

const buildMockDocuments = () =>
    Array.from({ length: 20 }, (_, i) => ({
        id: `doc-${i + 1}`,
        name: `Documento Clinico ${String(i + 1).padStart(2, '0')}.pdf`,
        createdAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        size: 180000 + i * 9000,
        permissions: [],
    }))

const INITIAL_PATIENT_FILES = {
    1: { images: buildMockImages(), documents: buildMockDocuments() },
    2: {
        images: [{ id: 'img-3', name: 'Imagem Revisao', url: '/img/thumbs/layouts/simple.jpg', createdAt: '2026-03-20' }],
        documents: [{ id: 'doc-3', name: 'Comprovante Atendimento.pdf', createdAt: '2026-03-20', size: 180000 }],
    },
    3: { images: [], documents: [] },
}

// ─── Maps / helpers ───────────────────────────────────────────────────────────

const priorityMap = {
    high: { label: 'Alta', color: 'red' },
    medium: { label: 'Média', color: 'amber' },
    low: { label: 'Baixa', color: 'blue' },
}

const statusFinancialMap = {
    paid: { label: 'Pago', color: 'green' },
    pending: { label: 'Pendente', color: 'amber' },
}

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const formatDateTime = (iso) => {
    const dt = new Date(iso)
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

const calcAge = (birthDate) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date))
const sortByDateAsc  = (items) => [...items].sort((a, b) => new Date(a.date) - new Date(b.date))

const RECENTES_KEY = 'prontuario_recentes'

const displayName = (patient) => patient.socialName || patient.name

const toPatternItem = (patient, operadoraNameByPublicId = new Map()) => {
    const opPub = patient.convenioOperadoraPublicId ?? patient.ConvenioOperadoraPublicId
    const convenioNome =
        opPub && operadoraNameByPublicId?.get
            ? operadoraNameByPublicId.get(String(opPub).toLowerCase())
            : null
    const badge =
        convenioNome ||
        patient.insuranceName ||
        patient.insurance ||
        patient.consumerKind ||
        null

    return {
        id:         patient.publicId ?? patient.id,
        name:       displayName(patient),
        email:      patient.email,
        meta:       patient.cpf,
        badge:      badge || undefined,
        status:     'ativo',
        avatarName: displayName(patient),
        _raw:       patient,
    }
}

// ─── Main component ───────────────────────────────────────────────────────────

const PatientRecordIndex = () => {
    const { TabNav, TabList, TabContent } = Tabs

    const navigate = useNavigate()
    const location = useLocation()
    const companyPublicId = useSelector((state) => state.auth.user.companyPublicId)

    const [searchTerm, setSearchTerm] = useState('')
    const [apiResults, setApiResults] = useState([])
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingPatient, setEditingPatient] = useState(null)
    const [historyStack, setHistoryStack] = useState([])
    const [recentPatients, setRecentPatients] = useState(() => {
        try {
            const stored = localStorage.getItem(RECENTES_KEY)
            if (!stored) return []
            const parsed = JSON.parse(stored)
            if (!Array.isArray(parsed)) return []
            // suporte ao formato legado (array de IDs) — typeof null === 'object', então filtramos com Boolean
            const objects = parsed.filter(Boolean)
            if (objects.length > 0 && typeof objects[0] !== 'object') return []
            return objects
        } catch {
            return []
        }
    })
    const [searchParams] = useSearchParams()

    const enrichPatientFromApis = useCallback(async (publicId) => {
        if (!publicId) return null
        const [full, convenios, ops, sessions, appointmentsResponse] = await Promise.all([
            getConsumerById(publicId),
            getConsumerConvenios(publicId).catch(() => []),
            companyPublicId ? operadorasGetByCompany(companyPublicId).catch(() => []) : Promise.resolve([]),
            sessionGetByPatient(publicId).catch(() => []),
            getAppointmentsByPatient(publicId).catch(() => ({ data: [] })),
        ])
        if (!full) return null
        const patientData = mergeConsumerConvenioForUi(full, convenios, Array.isArray(ops) ? ops : [])
        
        // Converter sessões para o formato esperado pelo componente (atendimentos passados)
        const pastAppointments = Array.isArray(sessions) ? sessions
            .filter(s => s.status === 'Completed' || s.status === 'Cancelled')
            .map(s => ({
                id: s.id,
                date: s.endedAt ? s.endedAt.split('T')[0] : (s.startedAt?.split('T')[0] || ''),
                time: s.startedAt ? new Date(s.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
                service: s.consultationTypeName || 'Atendimento',
                professional: s.professionalName || '',
                status: s.status.toLowerCase() === 'completed' ? 'completed' : 'cancelled',
                notes: s.mainComplaint || '',
                procedures: s.procedures ? JSON.parse(s.procedures) : [],
                evolution: s.mainComplaint || '',
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)) : []
            
        // Converter agendamentos reais da API para o formato esperado
        const appointments = appointmentsResponse.data || []
        const nextAppointments = Array.isArray(appointments) ? appointments
            .filter(apt => {
                // Filtrar apenas agendamentos futuros ou de hoje
                const aptDate = new Date(apt.scheduledAt)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                aptDate.setHours(0, 0, 0, 0)
                return aptDate >= today
            })
            .map(apt => ({
                id: apt.publicId,
                date: apt.scheduledAt.split('T')[0],
                time: new Date(apt.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                service: apt.consultationTypeName || apt.appointmentType || 'Agendamento',
                professional: apt.employeeName || '',
                status: 'scheduled',
                notes: apt.note || '',
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date)) : []
            
        return {
            ...patientData,
            pastAppointments,
            nextAppointments,
        }
    }, [companyPublicId])



    const [patientImages, setPatientImages] = useState([])
    const [patientDocuments, setPatientDocuments] = useState([])
    const [imageViewMode, setImageViewMode] = useState('list')
    const [printTemplates, setPrintTemplates] = useState([])

    const [notes, setNotes] = useState([])
    const [loadingNotes, setLoadingNotes] = useState(false)
    const [noteForm, setNoteForm] = useState({ content: '', noteType: 'note', alertSeverity: '', showOnAttendance: true })
    const [savingNote, setSavingNote] = useState(false)
    const [charges, setCharges] = useState([])
    const [loadingCharges, setLoadingCharges] = useState(false)
    const [newChargeOpen, setNewChargeOpen] = useState(false)
    const [recordPaymentCharge, setRecordPaymentCharge] = useState(null)
    const [cancelingCharge, setCancelingCharge] = useState(null)
    const [expandedChargeId, setExpandedChargeId] = useState(null)

    const operadoraNameByPublicId = useMemo(() => new Map(), [])

    /** Nome da operadora no cabeçalho (API: convenioOperadoraPublicId + mapa; ou insuranceName / insurance). */
    const headerConvenioName = useMemo(() => {
        if (!selectedPatient) return ''
        const opId =
            selectedPatient.convenioOperadoraPublicId ??
            selectedPatient.ConvenioOperadoraPublicId ??
            selectedPatient.insurancePublicId ??
            selectedPatient.InsurancePublicId
        if (opId) {
            const fromMap = operadoraNameByPublicId.get(String(opId).toLowerCase())
            if (fromMap) return fromMap
        }
        return (
            selectedPatient.insuranceName ||
            selectedPatient.insurance ||
            ''
        )
    }, [selectedPatient, operadoraNameByPublicId])

    const imageInputRef    = useRef(null)
    const documentInputRef = useRef(null)

    useEffect(() => {
        const patientId = searchParams.get('id')
        if (!patientId) return
        enrichPatientFromApis(patientId)
            .then((full) => { if (full) setSelectedPatient(full) })
            .catch(() => {})
    }, [searchParams, enrichPatientFromApis])

    useEffect(() => {
        const raw = localStorage.getItem('patient_record_templates')
        if (!raw) return
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) setPrintTemplates(parsed)
        } catch (_) {}
    }, [])

    useEffect(() => {
        if (!selectedPatient) return
        const uid = selectedPatient.publicId ?? selectedPatient.id
        const snapshot = {
            publicId:                   selectedPatient.publicId ?? selectedPatient.id,
            id:                         selectedPatient.id,
            name:                       selectedPatient.name,
            socialName:                 selectedPatient.socialName ?? null,
            email:                      selectedPatient.email ?? null,
            cpf:                        selectedPatient.cpf ?? null,
            convenioOperadoraPublicId:  selectedPatient.convenioOperadoraPublicId ?? null,
            insuranceName:              selectedPatient.insuranceName ?? null,
            insurance:                  selectedPatient.insurance ?? null,
            consumerKind:               selectedPatient.consumerKind ?? null,
            _cachedAt:                  Date.now(),
        }
        setRecentPatients((prev) => {
            const next = [snapshot, ...prev.filter((p) => p && (p.publicId ?? p.id) !== uid)].slice(0, 15)
            localStorage.setItem(RECENTES_KEY, JSON.stringify(next))
            return next
        })
    }, [selectedPatient?.publicId, selectedPatient?.id])

    useEffect(() => {
        if (!selectedPatient) {
            setPatientImages([])
            setPatientDocuments([])
            setNotes([])
            setCharges([])
            return
        }
        const base = INITIAL_PATIENT_FILES[selectedPatient.id] || { images: [], documents: [] }
        setPatientImages(base.images)
        setPatientDocuments(base.documents)
        setImageViewMode('list')

        const pid = selectedPatient.publicId ?? selectedPatient.id
        setLoadingNotes(true)
        getConsumerNotes(pid)
            .then((data) => setNotes(Array.isArray(data) ? data : []))
            .catch(() => {})
            .finally(() => setLoadingNotes(false))

        const isRealId = pid && typeof pid === 'string' && pid.includes('-')
        if (isRealId) {
            setLoadingCharges(true)
            getChargesByConsumer(pid)
                .then(data => setCharges(Array.isArray(data) ? data : []))
                .catch(() => setCharges([]))
                .finally(() => setLoadingCharges(false))
        } else {
            setCharges([])
        }
    }, [selectedPatient])


    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleStartAppointment = () =>
        navigate(`/attendance?patientPublicId=${selectedPatient.publicId}`)

    const handleUploadImages = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const newImages = files.map((file, i) => ({
            id: `new-img-${Date.now()}-${i}`,
            name: file.name,
            url: URL.createObjectURL(file),
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
            permissions: [],
        }))
        setPatientImages((prev) => [...newImages, ...prev])
        e.target.value = ''
    }

    const handleUploadDocuments = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const newDocs = files.map((file, i) => ({
            id: `new-doc-${Date.now()}-${i}`,
            name: file.name,
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
            permissions: [],
        }))
        setPatientDocuments((prev) => [...newDocs, ...prev])
        e.target.value = ''
    }

    const applyPatientVariables = (content, templateTitle = '') => {
        if (!selectedPatient) return content
        const todayIso = new Date().toISOString().slice(0, 10)
        const replacements = {
            '[PACIENTE_NOME]': displayName(selectedPatient),
            '[PACIENTE_CPF]': selectedPatient.cpf,
            '[PACIENTE_NASCIMENTO]': formatDate(selectedPatient.birthDate),
            '[PROFISSIONAL_NOME]': 'Profissional Responsavel',
            '[CLINICA_NOME]': 'Fluxy Clinic',
            '[CLINICA_CNPJ]': '00.000.000/0001-00',
            '[DATA_ATUAL]': formatDate(todayIso),
            '[VALOR_TOTAL]': 'R$ 0,00',
            '[FORMA_PAGAMENTO]': 'A definir',
            '[VIGENCIA_CONTRATO]': '12 meses',
            '[TEMPLATE_NOME]': templateTitle,
        }
        return Object.entries(replacements).reduce(
            (acc, [token, value]) => acc.split(token).join(value),
            content,
        )
    }

    const buildPrintHtml = (title, content) => `
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#111827;line-height:1.5}h1{margin:0 0 8px}.meta{font-size:12px;color:#6b7280;margin-bottom:18px}.content{white-space:pre-wrap;font-size:14px}</style>
</head><body>
<h1>${title}</h1>
<div class="meta">Paciente: ${selectedPatient ? displayName(selectedPatient) : ''} | Emitido em: ${formatDateTime(new Date().toISOString())}</div>
<div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body></html>`

    const handlePrintTemplate = (templateId) => {
        if (!selectedPatient) return
        const template = printTemplates.find((t) => String(t.id) === String(templateId || printTemplates[0]?.id))
        if (!template) {
            toast.push(<Notification type='warning' title='Aviso'>Nenhum template encontrado.</Notification>)
            return
        }
        const content = applyPatientVariables(template.content, template.title)
        const title = `${template.type === 'contract' ? 'Contrato' : 'Receita'} - ${template.title}`
        const win = window.open('', '_blank', 'width=900,height=700')
        if (!win) {
            toast.push(<Notification type='danger' title='Erro'>Não foi possível abrir a janela de impressão.</Notification>)
            return
        }
        win.document.open()
        win.document.write(buildPrintHtml(title, content))
        win.document.close()
        win.focus()
        win.print()

        const now = new Date().toISOString()
        setPatientDocuments((prev) => [{
            id: `print-${Date.now()}`,
            name: `${title} - ${displayName(selectedPatient)}.pdf`,
            createdAt: now.slice(0, 10),
            createdAtDateTime: now,
            size: Math.max(180000, content.length * 20),
            source: 'print',
            templateType: template.type,
            templateTitle: template.title,
            permissions: [],
        }, ...prev])
        toast.push(<Notification type='success' title='Impresso e Registrado'>Documento registrado no gerenciador.</Notification>)
    }

    const handleSetFilePermissions = (id, type, permissions) => {
        if (type === 'image') {
            setPatientImages((prev) => prev.map((f) => f.id === id ? { ...f, permissions } : f))
        } else {
            setPatientDocuments((prev) => prev.map((f) => f.id === id ? { ...f, permissions } : f))
        }
    }

    const handleSchedule = () =>
        toast.push(<Notification type='info' title='Agendar'>Acesse a aba de agendamento.</Notification>)

    const openPatient = async (patient, fromLabel) => {
        setHistoryStack((prev) => [
            ...prev,
            { label: fromLabel ?? (selectedPatient ? displayName(selectedPatient) : 'Prontuários Recentes'), patient: selectedPatient },
        ])
        setSelectedPatient(patient)
        try {
            const merged = await enrichPatientFromApis(patient.publicId ?? patient.id)
            if (merged) setSelectedPatient((prev) => ({ ...prev, ...merged }))
        } catch (_) {}
    }

    const openEdit = async (patient) => {
        try {
            const merged = await enrichPatientFromApis(patient.publicId ?? patient.id)
            setEditingPatient(merged ?? patient)
        } catch {
            setEditingPatient(patient)
        }
        setShowEditDialog(true)
    }

    const handleEditSuccess = (updated) => {
        setShowEditDialog(false)
        const convenioOpId =
            updated.insurancePublicId ?? updated.convenioOperadoraPublicId ?? updated.ConvenioOperadoraPublicId
        const patch = convenioOpId
            ? { ...updated, convenioOperadoraPublicId: convenioOpId }
            : { ...updated, convenioOperadoraPublicId: null }
        if ((selectedPatient?.publicId ?? selectedPatient?.id) === (updated.publicId ?? updated.id)) {
            setSelectedPatient((prev) => ({ ...prev, ...patch }))
        }
        toast.push(
            <Notification type='success' title='Prontuário atualizado'>
                Dados de <strong>{updated?.name}</strong> salvos com sucesso.
            </Notification>,
            { placement: 'top-center' }
        )
    }

    const buildAddress = (p) => {
        if (p.street) {
            const parts = [
                p.street,
                p.addressNumber,
                p.complement,
                p.neighborhood,
                p.city && p.state ? `${p.city}/${p.state}` : (p.city || p.state),
            ].filter(Boolean)
            return parts.join(', ')
        }
        return p.address ?? '—'
    }

    const handleSaveNote = async () => {
        if (!noteForm.content.trim()) return
        const pid = selectedPatient.publicId ?? selectedPatient.id
        setSavingNote(true)
        const payload = {
            content: noteForm.content.trim(),
            noteType: noteForm.noteType,
            alertSeverity: noteForm.noteType === 'alert' ? (noteForm.alertSeverity || 'info') : null,
            showOnAttendance: noteForm.showOnAttendance,
        }
        const created = await createConsumerNote(pid, payload)
        if (created) {
            setNotes((prev) => [created, ...prev])
            setNoteForm({ content: '', noteType: 'note', alertSeverity: '', showOnAttendance: true })
            toast.push(<Notification type='success' title='Anotação salva' />, { placement: 'top-center' })
        }
        setSavingNote(false)
    }

    const handleDeleteNote = async (notePublicId) => {
        const pid = selectedPatient.publicId ?? selectedPatient.id
        const ok = await deleteConsumerNote(pid, notePublicId)
        if (ok !== null) {
            setNotes((prev) => prev.filter((n) => n.publicId !== notePublicId))
            toast.push(<Notification type='success' title='Anotação removida' />, { placement: 'top-center' })
        }
    }

    const goBack = () => {
        if (historyStack.length > 0) {
            const prev = historyStack[historyStack.length - 1]
            setHistoryStack((s) => s.slice(0, -1))
            setSelectedPatient(prev.patient)
        } else {
            navigate(-1)
        }
    }

    const backLabel = historyStack.length > 0
        ? historyStack[historyStack.length - 1].label
        : (location.state?.fromLabel ?? null)

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className='w-full p-4 space-y-6'>

            <ConsumerUpsertDialog
                isOpen={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                mode='edit'
                initialData={editingPatient}
                onSuccess={handleEditSuccess}
            />

            <ConsumerUpsertDialog
                isOpen={showNewDialog}
                onClose={() => setShowNewDialog(false)}
                onSuccess={(created) => {
                    setShowNewDialog(false)
                    openPatient(created, 'Prontuários')
                }}
            />

            <NewChargeDialog
                open={newChargeOpen}
                onClose={() => setNewChargeOpen(false)}
                consumerPublicId={selectedPatient?.publicId ?? selectedPatient?.id}
                companyPublicId={companyPublicId}
                onSaved={(newCharge) => setCharges(prev => [newCharge, ...prev])}
            />

            <RecordPaymentDialog
                charge={recordPaymentCharge}
                onClose={() => setRecordPaymentCharge(null)}
                onSaved={() => {
                    const pid = selectedPatient?.publicId ?? selectedPatient?.id
                    if (pid && typeof pid === 'string' && pid.includes('-')) {
                        getChargesByConsumer(pid).then(data => setCharges(Array.isArray(data) ? data : [])).catch(() => {})
                    }
                }}
            />

            <CancelChargeDialog
                charge={cancelingCharge}
                onClose={() => setCancelingCharge(null)}
                onSaved={() => {
                    const pid = selectedPatient?.publicId ?? selectedPatient?.id
                    if (pid && typeof pid === 'string' && pid.includes('-')) {
                        getChargesByConsumer(pid).then(data => setCharges(Array.isArray(data) ? data : [])).catch(() => {})
                    }
                }}
            />

            {/* ── Patient Content ── */}
            {selectedPatient && (
                <>
                    {/* ── Breadcrumb / Voltar ── */}
                    <button
                        onClick={goBack}
                        className='group flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150'
                    >
                        <HiOutlineChevronLeft
                            size={16}
                            className='transition-transform duration-150 group-hover:-translate-x-0.5'
                        />
                        <span className='font-medium'>
                            {backLabel ?? 'Voltar'}
                        </span>
                    </button>

                    {/* ── Header ── */}
                    <div className={`relative rounded-2xl overflow-hidden shadow-sm border border-white/80 ${
                        selectedPatient.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-50 via-red-50 to-rose-50'
                            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
                    }`}>
                        <div className='absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 pointer-events-none'
                            style={{
                                background: selectedPatient.gender === 'female'
                                    ? 'radial-gradient(circle, #f87171 0%, transparent 70%)'
                                    : 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                                transform: 'translate(30%, -40%)',
                            }} />

                        <div className='relative p-6 flex flex-col md:flex-row md:items-start gap-6'>
                            {/* Avatar */}
                            <div className='flex-shrink-0'>
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-md select-none ${
                                    selectedPatient.gender === 'female'
                                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                    {displayName(selectedPatient).charAt(0)}
                                </div>
                                <div className='mt-2 text-center'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-indigo-400'>Prontuário</span>
                                    <p className='text-[10px] text-gray-400'>#{String(selectedPatient.id).padStart(5, '0')}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className='flex-1 min-w-0'>
                                <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
                                    <div>
                                        <h2 className='text-xl font-bold text-gray-900 leading-tight'>{displayName(selectedPatient)}</h2>
                                        {selectedPatient.socialName && (
                                            <p className='text-xs text-gray-400 mt-0.5'>
                                                Nome civil: <span className='font-medium text-gray-500'>{selectedPatient.name}</span>
                                            </p>
                                        )}
                                        <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                            <span className='text-xs text-gray-500'>
                                                {selectedPatient.birthDate
                                                    ? `${formatDate(selectedPatient.birthDate)} · ${calcAge(selectedPatient.birthDate)} anos`
                                                    : '—'}
                                            </span>
                                            <span className='w-1 h-1 rounded-full bg-gray-300 inline-block' />
                                            <span className='text-xs font-mono text-gray-500'>{selectedPatient.cpf}</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 p-1 rounded-xl border border-white/80 bg-white/60 backdrop-blur-sm shadow-sm'>
                                        <button title='Editar cadastro' onClick={() => openEdit(selectedPatient)}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition'>
                                            <HiOutlinePencil className='w-4 h-4' />
                                        </button>
                                        <button title='Iniciar atendimento' onClick={handleStartAppointment}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-700 hover:bg-green-50 transition'>
                                            <HiOutlinePlay className='w-4 h-4' />
                                        </button>
                                        <button title='Imprimir e registrar' onClick={() => handlePrintTemplate(printTemplates[0]?.id)}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition'>
                                            <HiOutlinePrinter className='w-4 h-4' />
                                        </button>
                                        <button title='Agendar' onClick={handleSchedule}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition'>
                                            <HiOutlineCalendar className='w-4 h-4' />
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                    {[
                                        { icon: <HiOutlinePhone />, label: 'Telefone', value: selectedPatient.phoneNumber ?? selectedPatient.phone ?? '—', color: 'indigo' },
                                        { icon: <HiOutlineMail />, label: 'E-mail', value: selectedPatient.email ?? '—', color: 'purple' },
                                        { icon: <HiOutlineLocationMarker />, label: 'Endereço', value: buildAddress(selectedPatient), color: 'sky' },
                                    ].map(({ icon, label, value, color }) => (
                                        <div key={label} className='flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80'>
                                            <div className={`w-7 h-7 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                                                <span className={`text-${color}-400 w-3.5 h-3.5 flex`}>{icon}</span>
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>{label}</p>
                                                <p className='text-sm font-semibold text-gray-700 truncate'>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex flex-wrap items-center gap-2 mt-3'>
                                    {selectedPatient.bloodType && (
                                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200'>
                                            🩸 {selectedPatient.bloodType}
                                        </span>
                                    )}
                                    {headerConvenioName && (
                                        <span
                                            title='Convênio'
                                            className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-900/35 dark:text-teal-200 dark:border-teal-800'
                                        >
                                            <HiOutlineShieldCheck className='w-3.5 h-3.5 flex-shrink-0' />
                                            {headerConvenioName}
                                        </span>
                                    )}
                                    {selectedPatient.allergies?.length > 0 && (
                                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200'>
                                            ⚠ Alergias: {selectedPatient.allergies.join(', ')}
                                        </span>
                                    )}
                                    {notes
                                        .filter((n) => n.noteType === 'alert' && (n.alertSeverity === 'danger' || n.alertSeverity === 'warning'))
                                        .map((n) => n.alertSeverity === 'danger' ? (
                                            <span key={n.publicId} title={n.content} className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 cursor-default max-w-[220px]'>
                                                <HiOutlineBell className='w-3.5 h-3.5 flex-shrink-0' />
                                                <span className='truncate'>{n.content}</span>
                                            </span>
                                        ) : (
                                            <span key={n.publicId} title={n.content} className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 cursor-default max-w-[220px]'>
                                                <HiOutlineBell className='w-3.5 h-3.5 flex-shrink-0' />
                                                <span className='truncate'>{n.content}</span>
                                            </span>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <Card>
                        <Tabs defaultValue='dashboard'>
                            <TabList>
                                <div className='flex flex-wrap items-center gap-2 w-full'>
                                    <TabNav value='dashboard' icon={<HiOutlineClipboardList />}>Dashboard</TabNav>
                                    <TabNav value='financial' icon={<HiOutlineCurrencyDollar />}>Financeiro</TabNav>
                                    <TabNav value='appointments' icon={<HiOutlineCalendar />}>Atendimentos</TabNav>
                                    <TabNav value='notes' icon={<HiOutlineAnnotation />}>Anotações</TabNav>
                                    <TabNav value='media' icon={<HiOutlinePhotograph />}>Imagens e Documentos</TabNav>
                                </div>
                            </TabList>

                            <div className='pt-4'>

                                {/* ── Dashboard ── */}
                                <TabContent value='dashboard'>
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                                        <SectionCard icon={<HiOutlineCurrencyDollar />} title='Últimos Financeiros' subtitle='Cobranças recentes do paciente' color='emerald'>
                                            {loadingCharges ? (
                                                <div className='flex justify-center py-6'>
                                                    <span className='w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin' />
                                                </div>
                                            ) : charges.length === 0 ? (
                                                <EmptyState
                                                    icon={<HiOutlineCurrencyDollar />}
                                                    message='Nenhuma cobrança registrada'
                                                    sub='Crie a primeira cobrança para este paciente'
                                                />
                                            ) : (
                                                <div className='space-y-2'>
                                                    {charges.slice(0, 4).map((charge) => {
                                                        const cfg = CHARGE_STATUS_CFG[charge.status] ?? CHARGE_STATUS_CFG[1]
                                                        return (
                                                            <div key={charge.publicId} className='flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50'>
                                                                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${cfg.barColor}`} />
                                                                <div className='flex-1 min-w-0'>
                                                                    <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate'>{charge.description || chargeKindLabel(charge.kind)}</p>
                                                                    <p className='text-[11px] text-gray-400'>{fmtDateUtc(charge.firstDueDateUtc)}</p>
                                                                </div>
                                                                <div className='text-right flex-shrink-0'>
                                                                    <p className='font-bold text-sm text-gray-800 dark:text-gray-100'>{fmtBrl(charge.principalAmount)}</p>
                                                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.badgeClass}`}>{cfg.label}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClock />} title='Próximos Agendamentos' subtitle='Agenda futura do paciente' color='blue'>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments ?? []).length === 0 ? (
                                                    <EmptyState
                                                        icon={<HiOutlineCalendar />}
                                                        message='Nenhum agendamento futuro'
                                                        sub='O paciente não possui consultas marcadas'
                                                    />
                                                ) : sortByDateAsc(selectedPatient.nextAppointments ?? []).map((apt) => (
                                                    <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50'>
                                                        <div className='bg-blue-600 text-white rounded-xl p-2 text-center min-w-14'>
                                                            <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                            <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>{apt.service}</p>
                                                            <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                        </div>
                                                        <Badge color='blue'>Agendado</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>

                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5'>
                                        <SectionCard icon={<HiOutlineExclamation />} title='Tratamentos Pendentes' subtitle='Aguardando realização' color='amber'>
                                            {selectedPatient.pendingTreatments ?? [].length === 0 ? (
                                                <EmptyState
                                                    icon={<HiOutlineCheckCircle />}
                                                    message='Nenhum tratamento pendente'
                                                    sub='Tudo em dia por aqui'
                                                />
                                            ) : (
                                                <div className='space-y-3'>
                                                    {selectedPatient.pendingTreatments ?? [].map((t) => (
                                                        <div key={t.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40'>
                                                            <div className='flex items-center justify-between'>
                                                                <p className='font-bold text-gray-800 dark:text-gray-200 text-sm'>{t.treatment}</p>
                                                                <Badge color={priorityMap[t.priority].color}>{priorityMap[t.priority].label}</Badge>
                                                            </div>
                                                            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>{t.notes}</p>
                                                            <p className='text-xs text-gray-500 mt-2'>Solicitado por {t.requestedBy} · {formatDate(t.requestedAt)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClipboardList />} title='Últimos 3 Atendimentos' subtitle='Histórico mais recente' color='violet'>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments ?? []).slice(0, 3).length === 0 ? (
                                                    <EmptyState
                                                        icon={<HiOutlineClipboardList />}
                                                        message='Nenhum atendimento registrado'
                                                        sub='O histórico aparecerá após a primeira consulta'
                                                    />
                                                ) : sortByDateDesc(selectedPatient.pastAppointments ?? []).slice(0, 3).map((apt) => (
                                                    <AppointmentCard key={apt.id} appointment={apt} />
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>

                                    {/* ── Convênio ── */}
                                    <div className='mt-5'>
                                        <SectionCard icon={<HiOutlineShieldCheck />} title='Convênio' subtitle='Plano de saúde do paciente' color='teal'
                                            headerAction={
                                                <button
                                                    onClick={() => openEdit(selectedPatient)}
                                                    className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 border border-teal-200 dark:border-teal-800 transition'
                                                >
                                                    <HiOutlinePencil className='w-3.5 h-3.5' />
                                                    Editar
                                                </button>
                                            }
                                        >
                                            {!(selectedPatient.insuranceName || selectedPatient.insurance) ? (
                                                <EmptyState
                                                    icon={<HiOutlineShieldCheck />}
                                                    message='Nenhum convênio cadastrado'
                                                    sub='Clique em Editar para vincular um plano'
                                                />
                                            ) : (
                                                <div className='flex flex-wrap gap-4'>
                                                    {[
                                                        { icon: <HiOutlineShieldCheck />, label: 'Operadora', value: selectedPatient.insuranceName || selectedPatient.insurance },
                                                        selectedPatient.insurancePlan   && { icon: <HiOutlineShieldCheck />, label: 'Plano',          value: selectedPatient.insurancePlan },
                                                        selectedPatient.insuranceNumber && { icon: <HiOutlineHashtag />,      label: 'Carteirinha',   value: selectedPatient.insuranceNumber },
                                                        selectedPatient.insuranceExpiry && { icon: <HiOutlineCalendar />,     label: 'Validade',      value: formatDate(selectedPatient.insuranceExpiry?.slice(0, 10)) },
                                                        selectedPatient.insuranceHolder && { icon: <HiOutlineIdentification />, label: 'Titular',     value: selectedPatient.insuranceHolder },
                                                    ].filter(Boolean).map(({ icon, label, value }) => (
                                                        <div key={label} className='flex items-center gap-2.5 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 rounded-xl px-3.5 py-2.5 min-w-[160px]'>
                                                            <span className='text-teal-400 flex-shrink-0'>{icon}</span>
                                                            <div>
                                                                <p className='text-[10px] font-semibold text-teal-500 dark:text-teal-400 uppercase tracking-wide'>{label}</p>
                                                                <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>{value}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>
                                    </div>
                                </TabContent>

                                {/* ── Financeiro ── */}
                                <TabContent value='financial'>
                                    {(() => {
                                        const totalPendente = charges.filter(c => [1,2,3,5].includes(c.status)).reduce((s,c) => s + Math.max(0, c.netPayableAmount - c.amountPaid), 0)
                                        const totalPago     = charges.reduce((s,c) => s + (c.amountPaid ?? 0), 0)
                                        const abertas       = charges.filter(c => [1,2,3,5].includes(c.status)).length
                                        return (
                                            <>
                                                {/* Cards de resumo */}
                                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5'>
                                                    {[
                                                        { label: 'A Receber', value: fmtBrl(totalPendente), sub: `${abertas} em aberto`, accent: 'border-blue-200 dark:border-blue-800', textColor: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50/60 dark:bg-blue-950/20' },
                                                        { label: 'Total Recebido', value: fmtBrl(totalPago), sub: 'Pagamentos confirmados', accent: 'border-emerald-200 dark:border-emerald-800', textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/60 dark:bg-emerald-950/20' },
                                                        { label: 'Total Cobranças', value: charges.length, sub: 'Registradas no sistema', accent: 'border-gray-200 dark:border-gray-700', textColor: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50/60 dark:bg-gray-800/40' },
                                                    ].map(card => (
                                                        <div key={card.label} className={`flex flex-col gap-1 p-4 rounded-2xl border ${card.accent} ${card.bg}`}>
                                                            <p className='text-[11px] font-semibold text-gray-400 uppercase tracking-wide'>{card.label}</p>
                                                            <p className={`text-2xl font-bold leading-tight ${card.textColor}`}>{card.value}</p>
                                                            <p className='text-[11px] text-gray-400'>{card.sub}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Lista de cobranças */}
                                                <SectionCard
                                                    icon={<HiOutlineCollection />}
                                                    title='Cobranças'
                                                    subtitle='Histórico de cobranças do paciente'
                                                    color='violet'
                                                    headerAction={
                                                        <button
                                                            onClick={() => setNewChargeOpen(true)}
                                                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition shadow-sm'
                                                        >
                                                            <HiOutlinePlus className='w-3.5 h-3.5' />
                                                            Nova Cobrança
                                                        </button>
                                                    }
                                                >
                                                    {loadingCharges ? (
                                                        <div className='flex justify-center py-8'>
                                                            <span className='w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
                                                        </div>
                                                    ) : charges.length === 0 ? (
                                                        <EmptyState
                                                            icon={<HiOutlineCurrencyDollar />}
                                                            message='Nenhuma cobrança registrada'
                                                            sub='Registre pagamentos e cobranças deste paciente'
                                                            action={
                                                                <button onClick={() => setNewChargeOpen(true)}
                                                                    className='px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition shadow-sm'>
                                                                    Criar primeira cobrança
                                                                </button>
                                                            }
                                                        />
                                                    ) : (
                                                        <div className='space-y-2 max-h-[560px] overflow-y-auto pr-1'>
                                                            {charges.map(charge => {
                                                                const cfg = CHARGE_STATUS_CFG[charge.status] ?? CHARGE_STATUS_CFG[1]
                                                                const expanded = expandedChargeId === charge.publicId
                                                                const hasInstallments = (charge.installments?.length ?? 0) > 1
                                                                const canPay = [1,2,3,5].includes(charge.status)
                                                                const canCancel = [1,2,3].includes(charge.status)
                                                                return (
                                                                    <div key={charge.publicId}>
                                                                        <div className='flex items-stretch gap-0 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-xl overflow-hidden hover:border-violet-200 dark:hover:border-violet-700/50 hover:shadow-sm transition-all'>
                                                                            <div className={`w-1 flex-shrink-0 ${cfg.barColor}`} />
                                                                            <div className='flex items-center gap-3 px-4 py-3 flex-1 min-w-0'>
                                                                                <div className='w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-500 flex-shrink-0'>
                                                                                    <HiOutlineCurrencyDollar className='w-4 h-4' />
                                                                                </div>
                                                                                <div className='flex-1 min-w-0'>
                                                                                    <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>
                                                                                        {charge.description || chargeKindLabel(charge.kind)}
                                                                                    </p>
                                                                                    <div className='flex items-center gap-2.5 mt-0.5 flex-wrap'>
                                                                                        {charge.firstDueDateUtc && (
                                                                                            <span className='text-[11px] text-gray-400 flex items-center gap-1'>
                                                                                                <HiOutlineCalendar className='w-3 h-3' />
                                                                                                {fmtDateUtc(charge.firstDueDateUtc)}
                                                                                            </span>
                                                                                        )}
                                                                                        {hasInstallments && (
                                                                                            <span className='text-[11px] text-gray-400'>{charge.installments.length}x</span>
                                                                                        )}
                                                                                        {charge.allowedPaymentMethods?.length > 0 && (
                                                                                            <span className='text-[11px] text-gray-400 hidden sm:inline'>{charge.allowedPaymentMethods.map(m => PM_LABELS[m] ?? m).join(' · ')}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className={`hidden sm:flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${cfg.badgeClass}`}>
                                                                                    {cfg.label}
                                                                                </div>
                                                                                <div className='text-right flex-shrink-0 min-w-[72px]'>
                                                                                    <p className='text-base font-bold text-gray-800 dark:text-gray-100 leading-tight'>{fmtBrl(charge.principalAmount)}</p>
                                                                                    {charge.amountPaid > 0 && (
                                                                                        <p className='text-[11px] text-emerald-500 mt-0.5'>+{fmtBrl(charge.amountPaid)}</p>
                                                                                    )}
                                                                                </div>
                                                                                <div className='flex items-center gap-1.5 flex-shrink-0' onClick={e => e.stopPropagation()}>
                                                                                    {canPay && (
                                                                                        <button onClick={() => setRecordPaymentCharge(charge)}
                                                                                            className='px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm whitespace-nowrap'>
                                                                                            Pagar
                                                                                        </button>
                                                                                    )}
                                                                                    {canCancel && (
                                                                                        <button onClick={() => setCancelingCharge(charge)}
                                                                                            className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition'>
                                                                                            <HiOutlineBan className='w-4 h-4' />
                                                                                        </button>
                                                                                    )}
                                                                                    {hasInstallments && (
                                                                                        <button onClick={() => setExpandedChargeId(expanded ? null : charge.publicId)}
                                                                                            className='p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition'>
                                                                                            {expanded ? <HiOutlineChevronDown className='w-4 h-4' /> : <HiOutlineChevronRight className='w-4 h-4' />}
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {expanded && hasInstallments && (
                                                                            <div className='ml-5 mt-1 space-y-1 pl-3 border-l-2 border-violet-100 dark:border-violet-900/40'>
                                                                                {charge.installments.map(inst => {
                                                                                    const icfg = INSTALLMENT_STATUS_CFG[inst.status] ?? INSTALLMENT_STATUS_CFG[0]
                                                                                    return (
                                                                                        <div key={inst.publicId} className='flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/40'>
                                                                                            <div className='flex items-center gap-2.5'>
                                                                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${icfg.dotClass}`} />
                                                                                                <span className='text-xs font-semibold text-gray-600 dark:text-gray-300'>Parcela {inst.sequenceNumber}</span>
                                                                                                <span className='text-[11px] text-gray-400'>{fmtDateUtc(inst.dueDateUtc)}</span>
                                                                                            </div>
                                                                                            <div className='flex items-center gap-3'>
                                                                                                <span className='text-[11px] font-medium text-gray-400'>{icfg.label}</span>
                                                                                                {inst.status === 1 ? (
                                                                                                    <div className='text-right'>
                                                                                                        <span className='text-xs font-bold text-gray-700 dark:text-gray-200'>{fmtBrl(inst.amount)}</span>
                                                                                                        <div className='flex items-center gap-1.5 mt-0.5 justify-end'>
                                                                                                            <span className='text-[10px] text-emerald-500 font-medium'>+{fmtBrl(inst.amountPaid)} pago</span>
                                                                                                            <span className='text-[10px] text-gray-300'>·</span>
                                                                                                            <span className='text-[10px] text-amber-500 font-medium'>{fmtBrl(inst.amount - inst.amountPaid)} falta</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ) : (
                                                                                                    <span className='text-xs font-bold text-gray-700 dark:text-gray-200'>{fmtBrl(inst.amount)}</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </SectionCard>
                                            </>
                                        )
                                    })()}
                                </TabContent>

                                {/* ── Atendimentos ── */}
                                <TabContent value='appointments'>
                                    <div className='space-y-5'>
                                        <SectionCard icon={<HiOutlineClock />} title='Próximos Agendamentos' subtitle='Agenda futura do paciente' color='blue'>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments ?? []).length === 0 ? (
                                                    <EmptyState
                                                        icon={<HiOutlineCalendar />}
                                                        message='Nenhum agendamento futuro'
                                                        sub='O paciente não possui consultas marcadas'
                                                    />
                                                ) : sortByDateAsc(selectedPatient.nextAppointments ?? []).map((apt) => (
                                                    <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50'>
                                                        <div className='bg-blue-600 text-white rounded-xl p-2 text-center min-w-14'>
                                                            <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                            <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>{apt.service}</p>
                                                            <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                        </div>
                                                        <Badge color='blue'>Agendado</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClipboardList />} title='Todos os Atendimentos' subtitle='Histórico completo de consultas' color='violet'>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments ?? []).length === 0 ? (
                                                    <EmptyState
                                                        icon={<HiOutlineClipboardList />}
                                                        message='Nenhum atendimento registrado'
                                                        sub='O histórico aparecerá após a primeira consulta'
                                                    />
                                                ) : sortByDateDesc(selectedPatient.pastAppointments ?? []).map((apt) => (
                                                    <AppointmentCard key={apt.id} appointment={apt} />
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>
                                </TabContent>

                                {/* ── Anotações ── */}
                                <TabContent value='notes'>
                                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
                                        {/* Formulário de nova anotação */}
                                        <div className='lg:col-span-1'>
                                            <SectionCard icon={<HiOutlineAnnotation />} title='Nova Anotação' subtitle='Adicione observações ao prontuário' color='violet'>
                                                <div className='space-y-3'>
                                                    <div>
                                                        <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5'>Tipo</label>
                                                        <div className='flex gap-2'>
                                                            {[
                                                                { value: 'note', label: 'Nota', color: 'indigo' },
                                                                { value: 'alert', label: 'Alerta', color: 'amber' },
                                                                { value: 'observation', label: 'Observação', color: 'sky' },
                                                            ].map(({ value, label, color }) => (
                                                                <button
                                                                    key={value}
                                                                    onClick={() => setNoteForm((f) => ({ ...f, noteType: value }))}
                                                                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                                                        noteForm.noteType === value
                                                                            ? `bg-${color}-600 text-white border-${color}-600`
                                                                            : `bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-${color}-300`
                                                                    }`}
                                                                >
                                                                    {label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {noteForm.noteType === 'alert' && (
                                                        <div>
                                                            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5'>Severidade</label>
                                                            <div className='flex gap-2'>
                                                                {[
                                                                    { value: 'info', label: 'Info', color: 'blue' },
                                                                    { value: 'warning', label: 'Atenção', color: 'amber' },
                                                                    { value: 'danger', label: 'Crítico', color: 'red' },
                                                                ].map(({ value, label, color }) => (
                                                                    <button
                                                                        key={value}
                                                                        onClick={() => setNoteForm((f) => ({ ...f, alertSeverity: value }))}
                                                                        className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                                                            noteForm.alertSeverity === value
                                                                                ? `bg-${color}-500 text-white border-${color}-500`
                                                                                : `bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-${color}-300`
                                                                        }`}
                                                                    >
                                                                        {label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className='text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5'>Conteúdo</label>
                                                        <textarea
                                                            rows={5}
                                                            value={noteForm.content}
                                                            onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))}
                                                            placeholder='Descreva a observação, alerta ou nota clínica…'
                                                            className='w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-800 dark:text-gray-200 px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 transition placeholder-gray-400'
                                                        />
                                                    </div>

                                                    <label className='flex items-center gap-2 cursor-pointer group'>
                                                        <input
                                                            type='checkbox'
                                                            checked={noteForm.showOnAttendance}
                                                            onChange={(e) => setNoteForm((f) => ({ ...f, showOnAttendance: e.target.checked }))}
                                                            className='w-4 h-4 accent-violet-600 rounded'
                                                        />
                                                        <span className='text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-violet-600 transition'>
                                                            Exibir no atendimento
                                                        </span>
                                                    </label>

                                                    <button
                                                        onClick={handleSaveNote}
                                                        disabled={savingNote || !noteForm.content.trim()}
                                                        className='w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900/40 text-white transition shadow-sm shadow-violet-200'
                                                    >
                                                        <HiOutlinePlus className='w-4 h-4' />
                                                        {savingNote ? 'Salvando…' : 'Salvar Anotação'}
                                                    </button>
                                                </div>
                                            </SectionCard>
                                        </div>

                                        {/* Lista de anotações */}
                                        <div className='lg:col-span-2'>
                                            <SectionCard icon={<HiOutlineAnnotation />} title='Histórico de Anotações' subtitle={`${notes.length} registro${notes.length !== 1 ? 's' : ''}`} color='indigo'>
                                                {loadingNotes ? (
                                                    <div className='flex items-center justify-center py-10'>
                                                        <div className='w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin' />
                                                    </div>
                                                ) : notes.length === 0 ? (
                                                    <EmptyState
                                                        icon={<HiOutlineAnnotation />}
                                                        message='Nenhuma anotação registrada'
                                                        sub='Use as anotações para registrar alertas, observações e evoluções'
                                                    />
                                                ) : (
                                                    <div className='space-y-3 max-h-[600px] overflow-y-auto pr-1'>
                                                        {notes.map((note) => {
                                                            const typeConfig = {
                                                                alert: {
                                                                    danger:  { bar: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-950/20',    border: 'border-red-200 dark:border-red-900/40',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',    icon: <HiOutlineBell className='w-3.5 h-3.5' />,         label: 'Crítico' },
                                                                    warning: { bar: 'bg-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: <HiOutlineBell className='w-3.5 h-3.5' />,         label: 'Atenção' },
                                                                    info:    { bar: 'bg-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/20',   border: 'border-blue-200 dark:border-blue-900/40',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: <HiOutlineBell className='w-3.5 h-3.5' />,         label: 'Info' },
                                                                },
                                                                note:        { bar: 'bg-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-900/40', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <HiOutlineAnnotation className='w-3.5 h-3.5' />, label: 'Nota' },
                                                                observation: { bar: 'bg-sky-400',    bg: 'bg-sky-50 dark:bg-sky-950/20',     border: 'border-sky-200 dark:border-sky-900/40',     badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',       icon: <HiOutlineAnnotation className='w-3.5 h-3.5' />, label: 'Observação' },
                                                            }

                                                            const cfg = note.noteType === 'alert'
                                                                ? (typeConfig.alert[note.alertSeverity] ?? typeConfig.alert.info)
                                                                : (typeConfig[note.noteType] ?? typeConfig.note)

                                                            return (
                                                                <div
                                                                    key={note.publicId}
                                                                    className={`flex gap-0 rounded-xl border overflow-hidden ${cfg.border} ${cfg.bg}`}
                                                                >
                                                                    <div className={`w-1 flex-shrink-0 ${cfg.bar}`} />
                                                                    <div className='flex-1 p-3.5'>
                                                                        <div className='flex items-start justify-between gap-2 mb-2'>
                                                                            <div className='flex items-center gap-1.5 flex-wrap'>
                                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                                                                                    {cfg.icon}
                                                                                    {cfg.label}
                                                                                </span>
                                                                                {note.showOnAttendance && (
                                                                                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
                                                                                        <HiOutlineCheckCircle className='w-3.5 h-3.5' />
                                                                                        Exibir no atendimento
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <button
                                                                                onClick={() => handleDeleteNote(note.publicId)}
                                                                                className='flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition'
                                                                                title='Excluir anotação'
                                                                            >
                                                                                <HiOutlineTrash className='w-4 h-4' />
                                                                            </button>
                                                                        </div>
                                                                        <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap'>{note.content}</p>
                                                                        <p className='text-[11px] text-gray-400 mt-2'>{formatDateTime(note.createdAt)}</p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </SectionCard>
                                        </div>
                                    </div>
                                </TabContent>

                                {/* ── Mídia ── */}
                                <TabContent value='media'>
                                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
                                        <SectionCard
                                            icon={<HiOutlineDocumentText />}
                                            title='Documentos do Paciente'
                                            subtitle='Arquivos e contratos'
                                            color='indigo'
                                            headerAction={
                                                <>
                                                    <input ref={documentInputRef} type='file' multiple className='hidden' onChange={handleUploadDocuments} />
                                                    <button onClick={() => documentInputRef.current?.click()}
                                                        className='flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition'>
                                                        <HiOutlinePlus className='w-3.5 h-3.5' />
                                                        Incluir
                                                    </button>
                                                </>
                                            }
                                        >
                                            {patientDocuments.length === 0 ? (
                                                <EmptyState
                                                    icon={<HiOutlineDocumentText />}
                                                    message='Nenhum documento cadastrado'
                                                    sub='Clique em Incluir para anexar contratos, receitas ou laudos'
                                                />
                                            ) : (
                                                <div className='space-y-2'>
                                                    {patientDocuments.map((doc) => (
                                                        <div key={doc.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40'>
                                                            <div className='flex items-center justify-between gap-2'>
                                                                <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-0 truncate'>{doc.name}</p>
                                                                <div className='flex items-center gap-2 flex-shrink-0'>
                                                                    {doc.source === 'print' && <Badge color='blue'>Impresso</Badge>}
                                                                    <FilePermissionPopover
                                                                        permissions={doc.permissions || []}
                                                                        onChange={(perms) => handleSetFilePermissions(doc.id, 'doc', perms)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className='text-xs text-gray-500 mt-1'>
                                                                Adicionado em {formatDate(doc.createdAt)} · {formatFileSize(doc.size)}
                                                            </p>
                                                            {doc.source === 'print' && (
                                                                <p className='text-xs text-indigo-600 dark:text-indigo-400 mt-1'>
                                                                    Rastro: {doc.templateType === 'contract' ? 'Contrato' : 'Receita'} "{doc.templateTitle}" impresso em {formatDateTime(doc.createdAtDateTime || `${doc.createdAt}T00:00:00`)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>

                                        <SectionCard
                                            icon={<HiOutlinePhotograph />}
                                            title='Imagens do Paciente'
                                            subtitle='Galeria clínica'
                                            color='rose'
                                            headerAction={
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex items-center rounded-xl border border-rose-200 dark:border-rose-800/50 overflow-hidden'>
                                                        {['list', 'thumbs'].map((mode) => (
                                                            <button key={mode} onClick={() => setImageViewMode(mode)}
                                                                className={`px-2.5 py-1.5 text-xs font-semibold transition ${
                                                                    imageViewMode === mode
                                                                        ? 'bg-rose-500 text-white'
                                                                        : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                                                }`}>
                                                                {mode === 'list' ? 'Lista' : 'Thumbs'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input ref={imageInputRef} type='file' accept='image/*' multiple className='hidden' onChange={handleUploadImages} />
                                                    <button onClick={() => imageInputRef.current?.click()}
                                                        className='flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-rose-300 dark:border-rose-700 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition'>
                                                        <HiOutlinePlus className='w-3.5 h-3.5' />
                                                        Incluir
                                                    </button>
                                                </div>
                                            }
                                        >
                                            {patientImages.length === 0 ? (
                                                <EmptyState
                                                    icon={<HiOutlinePhotograph />}
                                                    message='Nenhuma imagem cadastrada'
                                                    sub='Adicione radiografias, fotos clínicas e registros visuais'
                                                />
                                            ) : imageViewMode === 'list' ? (
                                                <div className='space-y-2'>
                                                    {patientImages.map((img) => (
                                                        <div key={img.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40 flex items-center gap-3'>
                                                            <img src={img.url} alt={img.name} className='w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0' />
                                                            <div className='min-w-0 flex-1'>
                                                                <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate'>{img.name}</p>
                                                                <p className='text-xs text-gray-500 mt-1'>Adicionado em {formatDate(img.createdAt)} · {formatFileSize(img.size)}</p>
                                                            </div>
                                                            <FilePermissionPopover
                                                                permissions={img.permissions || []}
                                                                onChange={(perms) => handleSetFilePermissions(img.id, 'image', perms)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                    {patientImages.map((img) => (
                                                        <div key={img.id} className='rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden bg-gray-50 dark:bg-gray-800/40'>
                                                            <img src={img.url} alt={img.name} className='w-full h-36 object-cover' />
                                                            <div className='p-2.5'>
                                                                <div className='flex items-start justify-between gap-1'>
                                                                    <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate min-w-0'>{img.name}</p>
                                                                    <FilePermissionPopover
                                                                        permissions={img.permissions || []}
                                                                        onChange={(perms) => handleSetFilePermissions(img.id, 'image', perms)}
                                                                    />
                                                                </div>
                                                                <p className='text-xs text-gray-500'>Adicionado em {formatDate(img.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>
                                    </div>
                                </TabContent>

                            </div>
                        </Tabs>
                    </Card>
                </>
            )}

            {/* ── Recentes / Busca ── */}
            {!selectedPatient && (
                <div className='space-y-5'>
                    {/* Header bar: busca + botão novo */}
                    <div className='flex items-center gap-3'>
                        <div className='flex-1'>
                            <ConsumerSearchInput
                                value={searchTerm}
                                onChange={(v) => { setSearchTerm(v); if (!v.trim()) setApiResults([]) }}
                                onResults={setApiResults}
                                onSelect={(consumer) => { setSearchTerm(''); setApiResults([]); openPatient(consumer, 'Busca') }}
                                placeholder='Buscar paciente por nome, nome social ou CPF…'
                            />
                        </div>
                        <button
                            onClick={() => setShowNewDialog(true)}
                            className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                        >
                            <HiOutlinePlus className='w-4 h-4' />
                            Novo Prontuário
                        </button>
                    </div>

                    {searchTerm.trim() ? (
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                                    Resultados
                                </p>
                                <span className='px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
                                    {apiResults.length}
                                </span>
                            </div>
                            <Pattern1
                                items={apiResults.map((p) => toPatternItem(p, operadoraNameByPublicId))}
                                emptyMessage={searchTerm.trim().length < 2 ? 'Digite ao menos 2 caracteres…' : 'Nenhum paciente encontrado'}
                                onItemClick={(item) => { setSearchTerm(''); setApiResults([]); openPatient(item._raw, 'Busca') }}
                                actions={[{
                                    key: 'edit',
                                    icon: <HiOutlinePencil />,
                                    tooltip: 'Editar',
                                    onClick: (item) => openEdit(item._raw),
                                }]}
                            />
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>
                                    Prontuários Recentes
                                </p>
                                {recentPatients.length > 0 && (
                                    <span className='px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'>
                                        {recentPatients.length}
                                    </span>
                                )}
                            </div>
                            <Pattern1
                                items={recentPatients.filter(Boolean).map((p) =>
                                    toPatternItem(p, operadoraNameByPublicId)
                                )}
                                emptyMessage='Nenhum prontuário acessado recentemente'
                                onItemClick={(item) => openPatient(item._raw, 'Prontuários Recentes')}
                                actions={[{
                                    key: 'edit',
                                    icon: <HiOutlinePencil />,
                                    tooltip: 'Editar',
                                    onClick: (item) => openEdit(item._raw),
                                }]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default PatientRecordIndex
