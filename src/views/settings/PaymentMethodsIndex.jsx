import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { Pattern1 } from '@/components/shared/listPatterns'
import {
    HiOutlineCreditCard,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCheck,
    HiOutlineCash,
    HiOutlineChartBar,
    HiOutlineTag,
    HiOutlineAdjustments,
    HiOutlineLightningBolt,
    HiOutlineDocumentText,
    HiOutlineClipboard,
    HiOutlineSwitchHorizontal,
} from 'react-icons/hi'
import {
    paymentMethodsGetByCompany,
    paymentMethodsCreate,
    paymentMethodsUpdate,
    paymentMethodsDelete,
    paymentMethodsAddRate,
    paymentMethodsUpdateRate,
    paymentMethodsDeleteRate,
    paymentMethodsGetCardBrands,
} from '@/api/enterprise/EnterpriseService'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    {
        value: 0, label: 'PIX',
        icon: HiOutlineLightningBolt,
        iconBg: 'bg-teal-500', iconText: 'text-white',
        badge: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        border: 'border-l-teal-400',
        dot: 'bg-teal-400',
        line: 'from-teal-200 dark:from-teal-700',
    },
    {
        value: 1, label: 'Boleto',
        icon: HiOutlineDocumentText,
        iconBg: 'bg-blue-500', iconText: 'text-white',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        border: 'border-l-blue-400',
        dot: 'bg-blue-400',
        line: 'from-blue-200 dark:from-blue-700',
    },
    {
        value: 2, label: 'Cartão de Crédito',
        icon: HiOutlineCreditCard,
        iconBg: 'bg-violet-500', iconText: 'text-white',
        badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        border: 'border-l-violet-400',
        dot: 'bg-violet-400',
        line: 'from-violet-200 dark:from-violet-700',
    },
    {
        value: 3, label: 'Cartão de Débito',
        icon: HiOutlineCreditCard,
        iconBg: 'bg-indigo-500', iconText: 'text-white',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        border: 'border-l-indigo-400',
        dot: 'bg-indigo-400',
        line: 'from-indigo-200 dark:from-indigo-700',
    },
    {
        value: 4, label: 'Dinheiro',
        icon: HiOutlineCash,
        iconBg: 'bg-emerald-500', iconText: 'text-white',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        border: 'border-l-emerald-400',
        dot: 'bg-emerald-400',
        line: 'from-emerald-200 dark:from-emerald-700',
    },
    {
        value: 5, label: 'Cheque',
        icon: HiOutlineClipboard,
        iconBg: 'bg-amber-500', iconText: 'text-white',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        border: 'border-l-amber-400',
        dot: 'bg-amber-400',
        line: 'from-amber-200 dark:from-amber-700',
    },
    {
        value: 6, label: 'Transferência Bancária',
        icon: HiOutlineSwitchHorizontal,
        iconBg: 'bg-sky-500', iconText: 'text-white',
        badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        border: 'border-l-sky-400',
        dot: 'bg-sky-400',
        line: 'from-sky-200 dark:from-sky-700',
    },
]

const categoryMeta = (v) => CATEGORIES.find((c) => c.value === v) ?? CATEGORIES[0]
const categoryLabel = (v) => categoryMeta(v).label
const categoryBadgeClass = (v) => categoryMeta(v).badge

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pickId = (o) => o?.publicId ?? o?.PublicId

const normalize = (raw) => {
    if (!raw || typeof raw !== 'object') return raw
    return {
        publicId:    pickId(raw),
        name:        raw.name ?? raw.Name ?? '',
        category:    raw.category ?? raw.Category ?? 0,
        description: raw.description ?? raw.Description ?? null,
        isActive:    raw.isActive ?? raw.IsActive ?? true,
        rates:       (raw.rates ?? raw.Rates ?? []).map(normalizeRate),
    }
}

const normalizeRate = (r) => ({
    publicId:       pickId(r),
    cardBrandId:    r.cardBrandId   ?? r.CardBrandId   ?? null,
    cardBrandName:  r.cardBrandName ?? r.CardBrandName ?? null,
    installmentMin: r.installmentMin ?? r.InstallmentMin ?? null,
    installmentMax: r.installmentMax ?? r.InstallmentMax ?? null,
    feePercent:     r.feePercent    ?? r.FeePercent    ?? 0,
    fixedFeeAmount: r.fixedFeeAmount ?? r.FixedFeeAmount ?? 0,
    effectiveFrom:  r.effectiveFrom ?? r.EffectiveFrom ?? '',
    effectiveTo:    r.effectiveTo   ?? r.EffectiveTo   ?? null,
    isActive:       r.isActive      ?? r.IsActive      ?? true,
    notes:          r.notes         ?? r.Notes         ?? null,
})

const fmtPercent = (v) =>
    v != null && v !== 0 ? `${Number(v).toFixed(2)}%` : null

const fmtAmount = (v) =>
    v != null && v !== 0
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
        : null

const todayIso = () => new Date().toISOString().slice(0, 10)

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({ label, icon, error, children }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}
        </label>
        <div className='relative'>
            {icon && (
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                    {icon}
                </span>
            )}
            {children}
        </div>
        {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
    </div>
)

// ─── Method Upsert Dialog ─────────────────────────────────────────────────────

const EMPTY_METHOD = { name: '', category: 0, description: '' }

const MethodDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm]     = useState(EMPTY_METHOD)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)

    useEffect(() => {
        if (!isOpen) return
        setErrors({})
        setForm(initial
            ? { name: initial.name, category: initial.category, description: initial.description ?? '' }
            : EMPTY_METHOD)
    }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => {
        setForm((p) => ({ ...p, [k]: v }))
        if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        const payload = {
            name:           form.name.trim(),
            category:       Number(form.category),
            description:    form.description.trim() || null,
            companyPublicId,
        }
        const id = pickId(initial)
        const result = isEdit
            ? await paymentMethodsUpdate(id, { ...payload, isActive: initial.isActive })
            : await paymentMethodsCreate(payload)
        setSaving(false)
        if (result === null) return
        onSuccess(result, isEdit)
    }

    const accent = isEdit
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    const inputCls = (err) => [
        'w-full py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
        'focus:outline-none focus:ring-2 transition-all pl-9 pr-3',
        err
            ? 'border-rose-400 focus:ring-rose-400/30'
            : `border-gray-200 dark:border-gray-700 ${accent}`,
    ].join(' ')

    const inputNoPad = (err) => inputCls(err).replace('pl-9', 'pl-3')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineCreditCard className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Meio de Pagamento' : 'Novo Meio de Pagamento'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {isEdit ? `Editando: ${initial.name}` : 'Configure como sua clínica recebe pagamentos'}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4'>
                    <Field label='Nome *' icon={<HiOutlineCreditCard className='w-4 h-4' />} error={errors.name}>
                        <input
                            placeholder='Ex: PIX Banco Inter, Máquina Cielo…'
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            className={inputCls(errors.name)}
                        />
                    </Field>

                    <Field label='Categoria *'>
                        <select
                            value={form.category}
                            onChange={(e) => set('category', e.target.value)}
                            className={inputNoPad(false)}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label='Descrição / Observação'>
                        <textarea
                            placeholder='Informações adicionais sobre este meio de pagamento…'
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none'
                        />
                    </Field>
                </div>

                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                        }`}
                    >
                        {saving ? (
                            <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                        ) : (
                            <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Cadastrar'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Rate Upsert Dialog ───────────────────────────────────────────────────────

const EMPTY_RATE = {
    cardBrandId: '',
    installmentMin: '',
    installmentMax: '',
    feePercent: '',
    fixedFeeAmount: '',
    effectiveFrom: todayIso(),
    effectiveTo: '',
    notes: '',
}

const RateDialog = ({ isOpen, onClose, onSuccess, initial, method, cardBrands }) => {
    const isEdit = !!initial
    const isCard = method?.category === 2 || method?.category === 3
    const [form, setForm]     = useState(EMPTY_RATE)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)

    useEffect(() => {
        if (!isOpen) return
        setErrors({})
        setForm(initial ? {
            cardBrandId:    initial.cardBrandId ?? '',
            installmentMin: initial.installmentMin ?? '',
            installmentMax: initial.installmentMax ?? '',
            feePercent:     initial.feePercent ?? '',
            fixedFeeAmount: initial.fixedFeeAmount ?? '',
            effectiveFrom:  initial.effectiveFrom?.slice(0, 10) ?? todayIso(),
            effectiveTo:    initial.effectiveTo?.slice(0, 10) ?? '',
            notes:          initial.notes ?? '',
        } : EMPTY_RATE)
    }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => {
        setForm((p) => ({ ...p, [k]: v }))
        if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.effectiveFrom) e.effectiveFrom = 'Data de início é obrigatória'
        if (!form.feePercent && !form.fixedFeeAmount) e.feePercent = 'Informe ao menos % ou valor fixo'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        const payload = {
            cardBrandId:    form.cardBrandId ? Number(form.cardBrandId) : null,
            installmentMin: form.installmentMin ? Number(form.installmentMin) : null,
            installmentMax: form.installmentMax ? Number(form.installmentMax) : null,
            feePercent:     form.feePercent ? Number(form.feePercent) : 0,
            fixedFeeAmount: form.fixedFeeAmount ? Number(form.fixedFeeAmount) : 0,
            effectiveFrom:  form.effectiveFrom,
            effectiveTo:    form.effectiveTo || null,
            isActive:       true,
            notes:          form.notes.trim() || null,
            companyPublicId,
        }
        const result = isEdit
            ? await paymentMethodsUpdateRate(pickId(initial), payload)
            : await paymentMethodsAddRate(pickId(method), payload)
        setSaving(false)
        if (result === null) return
        onSuccess(normalizeRate(result))
    }

    const accent = isEdit
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    const inputCls = (err) => [
        'w-full py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100',
        'focus:outline-none focus:ring-2 transition-all px-3',
        err
            ? 'border-rose-400 focus:ring-rose-400/30'
            : `border-gray-200 dark:border-gray-700 ${accent}`,
    ].join(' ')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineChartBar className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Taxa' : 'Nova Taxa'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {method?.name} — {categoryLabel(method?.category)}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]'>
                    {isCard && (
                        <Field label='Bandeira (opcional)'>
                            <select
                                value={form.cardBrandId}
                                onChange={(e) => set('cardBrandId', e.target.value)}
                                className={inputCls(false)}
                            >
                                <option value=''>Todas as bandeiras</option>
                                {cardBrands.map((b) => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <p className='text-xs text-gray-400 mt-1'>
                                Deixe em branco para aplicar a todas as bandeiras
                            </p>
                        </Field>
                    )}

                    {isCard && (
                        <div className='grid grid-cols-2 gap-3'>
                            <Field label='Parcelas — de'>
                                <input
                                    type='number'
                                    min='1'
                                    max='24'
                                    placeholder='Ex: 1'
                                    value={form.installmentMin}
                                    onChange={(e) => set('installmentMin', e.target.value)}
                                    className={inputCls(false)}
                                />
                            </Field>
                            <Field label='Parcelas — até'>
                                <input
                                    type='number'
                                    min='1'
                                    max='24'
                                    placeholder='Ex: 3'
                                    value={form.installmentMax}
                                    onChange={(e) => set('installmentMax', e.target.value)}
                                    className={inputCls(false)}
                                />
                            </Field>
                        </div>
                    )}

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Taxa (%)' error={errors.feePercent}>
                            <input
                                type='number'
                                min='0'
                                max='100'
                                step='0.01'
                                placeholder='Ex: 2.50'
                                value={form.feePercent}
                                onChange={(e) => set('feePercent', e.target.value)}
                                className={inputCls(errors.feePercent)}
                            />
                            <p className='text-xs text-gray-400 mt-1'>Percentual sobre o valor</p>
                        </Field>
                        <Field label='Custo fixo (R$)'>
                            <input
                                type='number'
                                min='0'
                                step='0.01'
                                placeholder='Ex: 3.50'
                                value={form.fixedFeeAmount}
                                onChange={(e) => set('fixedFeeAmount', e.target.value)}
                                className={inputCls(false)}
                            />
                            <p className='text-xs text-gray-400 mt-1'>Por transação (ex: boleto)</p>
                        </Field>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Vigência — início *' error={errors.effectiveFrom}>
                            <input
                                type='date'
                                value={form.effectiveFrom}
                                onChange={(e) => set('effectiveFrom', e.target.value)}
                                className={inputCls(errors.effectiveFrom)}
                            />
                        </Field>
                        <Field label='Vigência — fim'>
                            <input
                                type='date'
                                value={form.effectiveTo}
                                onChange={(e) => set('effectiveTo', e.target.value)}
                                className={inputCls(false)}
                            />
                            <p className='text-xs text-gray-400 mt-1'>Opcional — sem prazo se vazio</p>
                        </Field>
                    </div>

                    <Field label='Observação'>
                        <textarea
                            placeholder='Ex: Taxa negociada em jan/2026…'
                            value={form.notes}
                            onChange={(e) => set('notes', e.target.value)}
                            rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none'
                        />
                    </Field>
                </div>

                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                        }`}
                    >
                        {saving ? (
                            <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                        ) : (
                            <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Adicionar Taxa'}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Rates Panel ──────────────────────────────────────────────────────────────

const RatesPanel = ({ method, cardBrands, onUpdated }) => {
    const [rateDialog, setRateDialog]     = useState(false)
    const [editingRate, setEditingRate]   = useState(null)
    const [deletingRate, setDeletingRate] = useState(null)
    const [confirmOpen, setConfirmOpen]   = useState(false)

    const openNewRate  = () => { setEditingRate(null); setRateDialog(true) }
    const openEditRate = (r) => { setEditingRate(r); setRateDialog(true) }
    const openDelRate  = (r) => { setDeletingRate(r); setConfirmOpen(true) }

    const handleRateSuccess = (savedRate) => {
        setRateDialog(false)
        const existing = method.rates.find((r) => r.publicId === savedRate.publicId)
        const newRates = existing
            ? method.rates.map((r) => r.publicId === savedRate.publicId ? savedRate : r)
            : [savedRate, ...method.rates]
        onUpdated({ ...method, rates: newRates })
        toast.push(
            <Notification type='success' title={existing ? 'Taxa atualizada' : 'Taxa adicionada'} />,
            { placement: 'top-center' }
        )
    }

    const handleDelRate = async () => {
        if (!deletingRate) return
        const ok = await paymentMethodsDeleteRate(deletingRate.publicId)
        if (ok !== null) {
            onUpdated({ ...method, rates: method.rates.filter((r) => r.publicId !== deletingRate.publicId) })
            toast.push(<Notification type='success' title='Taxa removida' />, { placement: 'top-center' })
        }
        setConfirmOpen(false)
        setDeletingRate(null)
    }

    const isCard = method.category === 2 || method.category === 3

    const rateLabel = (r) => {
        const parts = []
        if (r.cardBrandName) parts.push(r.cardBrandName)
        if (r.installmentMin != null) {
            parts.push(r.installmentMin === r.installmentMax
                ? `${r.installmentMin}×`
                : `${r.installmentMin}× a ${r.installmentMax}×`)
        }
        if (!parts.length) parts.push('Padrão')
        return parts.join(' · ')
    }

    const rateValue = (r) => {
        const p = fmtPercent(r.feePercent)
        const f = fmtAmount(r.fixedFeeAmount)
        return [p, f].filter(Boolean).join(' + ') || '—'
    }

    const rateValidity = (r) => {
        if (!r.effectiveTo) return `desde ${r.effectiveFrom?.slice(0, 10) ?? '—'}`
        return `${r.effectiveFrom?.slice(0, 10)} → ${r.effectiveTo.slice(0, 10)}`
    }

    return (
        <>
            <RateDialog
                isOpen={rateDialog}
                onClose={() => setRateDialog(false)}
                onSuccess={handleRateSuccess}
                initial={editingRate}
                method={method}
                cardBrands={cardBrands}
            />
            <ConfirmDialog
                isOpen={confirmOpen}
                type='danger'
                title='Remover Taxa'
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelRate}
            >
                <p>Deseja remover esta configuração de taxa?</p>
            </ConfirmDialog>

            <div className='space-y-2'>
                {method.rates.length === 0 ? (
                    <div className='text-center py-8 text-gray-400 text-sm'>
                        Nenhuma taxa configurada. Clique em &ldquo;+ Taxa&rdquo; para adicionar.
                    </div>
                ) : (
                    <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 divide-y divide-gray-50 dark:divide-gray-700/40 overflow-hidden'>
                        {method.rates.map((r) => (
                            <div key={r.publicId} className='flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors group'>
                                <div className='w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0'>
                                    <HiOutlineChartBar className='w-4 h-4 text-violet-500' />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <span className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                                            {rateLabel(r)}
                                        </span>
                                        {isCard && r.cardBrandName && (
                                            <span className='px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                                                {r.cardBrandName}
                                            </span>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-3 mt-0.5'>
                                        <span className='text-xs font-bold text-violet-600 dark:text-violet-400'>
                                            {rateValue(r)}
                                        </span>
                                        <span className='text-xs text-gray-400'>{rateValidity(r)}</span>
                                        {r.notes && (
                                            <span className='text-xs text-gray-400 italic truncate max-w-[180px]'>
                                                {r.notes}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <button
                                        onClick={() => openEditRate(r)}
                                        className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'
                                    >
                                        <HiOutlinePencil className='w-3.5 h-3.5' />
                                    </button>
                                    <button
                                        onClick={() => openDelRate(r)}
                                        className='p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition'
                                    >
                                        <HiOutlineTrash className='w-3.5 h-3.5' />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={openNewRate}
                    className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition'
                >
                    <HiOutlinePlus className='w-3.5 h-3.5' />
                    + Taxa
                </button>
            </div>
        </>
    )
}

// ─── Rates Panel Trigger (modal wrapper) ─────────────────────────────────────

const RatesPanelTrigger = ({ method, cardBrands, onUpdated }) => {
    const [open, setOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition'
            >
                <HiOutlineAdjustments className='w-3.5 h-3.5' />
                Gerenciar taxas
            </button>

            {open && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setOpen(false)} />
                    <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden'>
                        <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                            <div className='flex-1'>
                                <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                                    Taxas — {method.name}
                                </h3>
                                <p className='text-xs text-gray-400 mt-0.5'>{categoryLabel(method.category)}</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'
                            >
                                <HiOutlineX className='w-4 h-4' />
                            </button>
                        </div>
                        <div className='px-6 py-5 overflow-y-auto max-h-[70vh]'>
                            <RatesPanel
                                method={method}
                                cardBrands={cardBrands}
                                onUpdated={(updated) => { onUpdated(updated) }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// ─── Method Card ─────────────────────────────────────────────────────────────

const MethodCard = ({ method, cardBrands, onEdit, onDelete, onUpdated }) => {
    const meta = categoryMeta(method.category)
    const Icon = meta.icon

    const rateChip = (r) => {
        const parts = []
        if (r.cardBrandName) parts.push(r.cardBrandName)
        if (r.installmentMin != null)
            parts.push(r.installmentMin === r.installmentMax ? `${r.installmentMin}×` : `${r.installmentMin}×–${r.installmentMax}×`)
        const fee = [fmtPercent(r.feePercent), fmtAmount(r.fixedFeeAmount)].filter(Boolean).join(' + ')
        return { label: parts.join(' · ') || 'Padrão', fee }
    }

    return (
        <div className='flex flex-col border border-gray-100 dark:border-gray-700/40 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow'>

            {/* ── Header ── */}
            <div className='flex items-center gap-3 px-4 py-3.5'>
                <div className={`w-9 h-9 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon className='w-4 h-4 text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-snug'>
                        {method.name}
                    </p>
                    {method.description && (
                        <p className='text-xs text-gray-400 truncate mt-0.5'>{method.description}</p>
                    )}
                </div>
                <div className='flex items-center gap-0.5 flex-shrink-0'>
                    <button
                        onClick={() => onEdit(method)}
                        className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-300 hover:text-amber-500 transition'
                        title='Editar'
                    >
                        <HiOutlinePencil className='w-3.5 h-3.5' />
                    </button>
                    <button
                        onClick={() => onDelete(method)}
                        className='p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition'
                        title='Excluir'
                    >
                        <HiOutlineTrash className='w-3.5 h-3.5' />
                    </button>
                </div>
            </div>

            {/* ── Rates ── */}
            <div className='flex-1 border-t border-gray-50 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-800/20 px-4 py-3 space-y-1.5'>
                {method.rates.length === 0 ? (
                    <p className='text-xs text-gray-400 italic py-1'>Nenhuma taxa configurada</p>
                ) : (
                    method.rates.map((r) => {
                        const { label, fee } = rateChip(r)
                        return (
                            <div key={r.publicId} className='flex items-center justify-between gap-2 group'>
                                <span className='text-xs text-gray-500 dark:text-gray-400 truncate'>{label}</span>
                                <div className='flex items-center gap-1.5 flex-shrink-0'>
                                    <span className='text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums'>
                                        {fee}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Footer ── */}
            <div className='px-4 py-2.5 border-t border-gray-50 dark:border-gray-700/40 flex items-center justify-between'>
                <span className='text-xs text-gray-400'>
                    {method.rates.length} taxa{method.rates.length !== 1 ? 's' : ''}
                </span>
                <RatesPanelTrigger method={method} cardBrands={cardBrands} onUpdated={onUpdated} />
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const PaymentMethodsIndex = () => {
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)
    const [items, setItems]             = useState([])
    const [cardBrands, setCardBrands]   = useState([])
    const [loading, setLoading]         = useState(false)
    const [search, setSearch]           = useState('')
    const [filterCat, setFilterCat]     = useState('')
    const [methodDialog, setMethodDialog] = useState(false)
    const [editing, setEditing]           = useState(null)
    const [deleting, setDeleting]         = useState(null)
    const [confirmOpen, setConfirmOpen]   = useState(false)

    useEffect(() => {
        paymentMethodsGetCardBrands()
            .then((data) => setCardBrands(Array.isArray(data) ? data : []))
            .catch(() => {})
    }, [])

    const load = () => {
        if (!companyPublicId) return
        setLoading(true)
        paymentMethodsGetByCompany(companyPublicId)
            .then((data) => (Array.isArray(data) ? data : []).map(normalize))
            .then(setItems)
            .catch(() => toast.push(<Notification type='danger' title='Erro ao carregar meios de pagamento' />, { placement: 'top-center' }))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [companyPublicId])

    const openNew    = () => { setEditing(null); setMethodDialog(true) }
    const openEdit   = (m) => { setEditing(m); setMethodDialog(true) }
    const openDelete = (m) => { setDeleting(m); setConfirmOpen(true) }

    const handleSuccess = (result, isEdit) => {
        setMethodDialog(false)
        if (isEdit) {
            setItems((prev) => prev.map((m) => m.publicId === result.publicId ? normalize({ ...result, rates: m.rates }) : m))
            toast.push(<Notification type='success' title='Meio de pagamento atualizado' />, { placement: 'top-center' })
        } else {
            setItems((prev) => [normalize(result), ...prev])
            toast.push(<Notification type='success' title='Meio de pagamento criado' />, { placement: 'top-center' })
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        const ok = await paymentMethodsDelete(pickId(deleting))
        if (ok !== null) {
            setItems((prev) => prev.filter((m) => m.publicId !== pickId(deleting)))
            toast.push(<Notification type='success' title='Meio de pagamento removido' />, { placement: 'top-center' })
        }
        setConfirmOpen(false)
        setDeleting(null)
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return items.filter((m) => {
            if (filterCat !== '' && m.category !== Number(filterCat)) return false
            return (
                m.name?.toLowerCase().includes(q) ||
                (m.description ?? '').toLowerCase().includes(q) ||
                categoryLabel(m.category).toLowerCase().includes(q)
            )
        })
    }, [items, search, filterCat])

    const groupedByCategory = useMemo(() => {
        const groups = {}
        for (const m of filtered) {
            const key = m.category
            if (!groups[key]) groups[key] = []
            groups[key].push(m)
        }
        return groups
    }, [filtered])

    const totalRates = items.reduce((acc, m) => acc + m.rates.length, 0)

    return (
        <div className='w-full p-4 space-y-4'>
            <MethodDialog
                isOpen={methodDialog}
                onClose={() => setMethodDialog(false)}
                onSuccess={handleSuccess}
                initial={editing}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                type='danger'
                title='Excluir Meio de Pagamento'
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            >
                <p>Deseja excluir <strong>{deleting?.name}</strong> e todas as suas taxas? Essa ação não poderá ser desfeita.</p>
            </ConfirmDialog>

            {/* ── Header ── */}
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineCreditCard className='w-6 h-6 text-violet-500' />
                        Meios de Pagamento
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>
                        Configure as taxas de recebimento por método de pagamento
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                >
                    <HiOutlinePlus className='w-4 h-4' />
                    Novo Método
                </button>
            </div>

            {/* ── Resumo ── */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {[
                    { label: 'Métodos', value: items.length, icon: <HiOutlineCreditCard className='w-4 h-4' />, color: 'text-violet-500' },
                    { label: 'Taxas config.', value: totalRates, icon: <HiOutlineChartBar className='w-4 h-4' />, color: 'text-emerald-500' },
                    { label: 'Bandeiras', value: cardBrands.filter((b) => b.isActive).length, icon: <HiOutlineTag className='w-4 h-4' />, color: 'text-sky-500' },
                    { label: 'Categorias', value: Object.keys(groupedByCategory).length, icon: <HiOutlineCash className='w-4 h-4' />, color: 'text-amber-500' },
                ].map((s) => (
                    <Card key={s.label} className='border border-gray-100 dark:border-gray-700/50'>
                        <div className='flex items-center gap-3'>
                            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className='text-xl font-bold text-gray-800 dark:text-gray-100'>{s.value}</p>
                                <p className='text-xs text-gray-400'>{s.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Filtros ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 flex-wrap'>
                    <div className='relative flex-1 min-w-[200px]'>
                        <HiOutlineCreditCard className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4' />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar por nome ou descrição…'
                            className='w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 placeholder-gray-400 transition-all'
                        />
                    </div>
                    <select
                        value={filterCat}
                        onChange={(e) => setFilterCat(e.target.value)}
                        className='py-2.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all'
                    >
                        <option value=''>Todas as categorias</option>
                        {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* ── Lista agrupada ── */}
            {loading ? (
                <Card className='border border-gray-100'>
                    <div className='py-12 flex items-center justify-center gap-2 text-gray-400'>
                        <div className='w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                        <span className='text-sm'>Carregando…</span>
                    </div>
                </Card>
            ) : filtered.length === 0 ? (
                <Card className='border border-gray-100'>
                    <div className='py-12 text-center text-gray-400 text-sm'>
                        Nenhum meio de pagamento encontrado. Configure os métodos que sua clínica aceita.
                    </div>
                </Card>
            ) : (
                <div className='space-y-7'>
                    {CATEGORIES.filter((c) => groupedByCategory[c.value]).map((cat) => {
                        const CatIcon = cat.icon
                        const count = groupedByCategory[cat.value].length
                        return (
                            <div key={cat.value}>
                                {/* ── Category separator ── */}
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className={`w-7 h-7 rounded-lg ${cat.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                        <CatIcon className='w-3.5 h-3.5 text-white' />
                                    </div>
                                    <span className='text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap'>
                                        {cat.label}
                                    </span>
                                    <div className={`flex-1 h-px bg-gradient-to-r ${cat.line} to-transparent`} />
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.badge} flex-shrink-0`}>
                                        {count} método{count !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3'>
                                    {groupedByCategory[cat.value].map((m) => (
                                        <MethodCard
                                            key={m.publicId}
                                            method={m}
                                            cardBrands={cardBrands}
                                            onEdit={openEdit}
                                            onDelete={openDelete}
                                            onUpdated={(updated) =>
                                                setItems((prev) => prev.map((x) => x.publicId === updated.publicId ? updated : x))
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default PaymentMethodsIndex
