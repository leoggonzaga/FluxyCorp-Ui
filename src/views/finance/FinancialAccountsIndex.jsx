import { useMemo, useState, useEffect } from 'react'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCheck,
    HiOutlineCash,
    HiOutlineCreditCard,
    HiOutlineTrendingUp,
    HiOutlineStar,
    HiOutlineLibrary,
    HiOutlineLightningBolt,
    HiOutlineGlobe,
    HiOutlineOfficeBuilding,
    HiOutlineChip,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineDotsVertical,
    HiOutlineArrowsExpand,
    HiOutlineSearch,
    HiOutlineBadgeCheck,
    HiOutlineExclamationCircle,
    HiStar,
} from 'react-icons/hi'

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCOUNT_TYPES = [
    {
        value: 'caixa',
        label: 'Caixa',
        icon: HiOutlineCash,
        description: 'Dinheiro em espécie no consultório',
        showBank: false,
        showAgency: false,
    },
    {
        value: 'corrente',
        label: 'Conta Corrente',
        icon: HiOutlineLibrary,
        description: 'Conta bancária para movimentação diária',
        showBank: true,
        showAgency: true,
    },
    {
        value: 'poupanca',
        label: 'Conta Poupança',
        icon: HiOutlineTrendingUp,
        description: 'Conta de reserva com rendimento',
        showBank: true,
        showAgency: true,
    },
    {
        value: 'digital',
        label: 'Carteira Digital',
        icon: HiOutlineLightningBolt,
        description: 'PicPay, Mercado Pago, PagSeguro…',
        showBank: true,
        showAgency: false,
    },
    {
        value: 'investimento',
        label: 'Investimento',
        icon: HiOutlineTrendingUp,
        description: 'CDB, LCI, Tesouro Direto…',
        showBank: true,
        showAgency: false,
    },
    {
        value: 'outro',
        label: 'Outro',
        icon: HiOutlineGlobe,
        description: 'Outro tipo de conta ou fundo',
        showBank: true,
        showAgency: false,
    },
]

// each color must use complete class strings (Tailwind purge)
const PALETTE = [
    { value: 'slate',   label: 'Grafite',  card: 'from-slate-700 via-slate-800 to-slate-950',   text: 'text-slate-100',  pill: 'bg-slate-600/60' },
    { value: 'violet',  label: 'Violeta',  card: 'from-violet-600 via-violet-700 to-violet-900', text: 'text-violet-50',  pill: 'bg-violet-500/50' },
    { value: 'blue',    label: 'Azul',     card: 'from-blue-600 via-blue-700 to-blue-900',       text: 'text-blue-50',    pill: 'bg-blue-500/50' },
    { value: 'cyan',    label: 'Ciano',    card: 'from-cyan-600 via-cyan-700 to-cyan-900',       text: 'text-cyan-50',    pill: 'bg-cyan-500/50' },
    { value: 'emerald', label: 'Esmeralda',card: 'from-emerald-600 via-emerald-700 to-emerald-900', text: 'text-emerald-50', pill: 'bg-emerald-500/50' },
    { value: 'teal',    label: 'Petróleo', card: 'from-teal-600 via-teal-700 to-teal-900',       text: 'text-teal-50',    pill: 'bg-teal-500/50' },
    { value: 'rose',    label: 'Rosa',     card: 'from-rose-500 via-rose-600 to-rose-800',       text: 'text-rose-50',    pill: 'bg-rose-400/50' },
    { value: 'amber',   label: 'Âmbar',    card: 'from-amber-500 via-amber-600 to-amber-800',    text: 'text-amber-50',   pill: 'bg-amber-400/50' },
    { value: 'orange',  label: 'Laranja',  card: 'from-orange-500 via-orange-600 to-orange-800', text: 'text-orange-50',  pill: 'bg-orange-400/50' },
    { value: 'zinc',    label: 'Preta',    card: 'from-zinc-800 via-zinc-900 to-black',          text: 'text-zinc-100',   pill: 'bg-zinc-600/60' },
]

const paletteMeta  = (v) => PALETTE.find((p) => p.value === v) ?? PALETTE[0]
const accountType  = (v) => ACCOUNT_TYPES.find((t) => t.value === v) ?? ACCOUNT_TYPES[0]

const STORAGE_KEY  = 'fluxy_financial_accounts'

const SEED = [
    {
        id: 'seed_1', name: 'Caixa Geral', type: 'caixa', bank: '',
        agency: '', accountNumber: '', digit: '',
        balance: 3200.00, color: 'emerald', isActive: true, isMain: false,
        description: 'Dinheiro físico no consultório',
    },
    {
        id: 'seed_2', name: 'Itaú Principal', type: 'corrente', bank: 'Banco Itaú Unibanco',
        agency: '0245', accountNumber: '12345', digit: '6',
        balance: 28540.75, color: 'blue', isActive: true, isMain: true,
        description: 'Conta principal de recebimentos',
    },
    {
        id: 'seed_3', name: 'Nubank', type: 'digital', bank: 'Nu Pagamentos',
        agency: '', accountNumber: '7890', digit: '1',
        balance: 4120.30, color: 'violet', isActive: true, isMain: false,
        description: 'Recebimento via Pix e digital',
    },
    {
        id: 'seed_4', name: 'Reserva / Poupança', type: 'poupanca', bank: 'Caixa Econômica Federal',
        agency: '1234', accountNumber: '00056789', digit: '0',
        balance: 50000.00, color: 'teal', isActive: true, isMain: false,
        description: 'Reserva de emergência da clínica',
    },
]

// ─── Storage ──────────────────────────────────────────────────────────────────

const load = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw)
    } catch (_) {}
    return SEED
}

const save = (data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (_) {}
}

const genId = () => `acc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-12 gap-3 select-none'>
        <div className='w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 text-3xl'>
            {icon}
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>{sub}</p>}
        </div>
        {action && <div className='mt-1'>{action}</div>}
    </div>
)

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({ label, error, hint, children }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}
        </label>
        {children}
        {hint && !error && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
    </div>
)

// ─── Chip SVG ─────────────────────────────────────────────────────────────────

const CardChip = () => (
    <div className='w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300/80 to-yellow-500/60 border border-yellow-200/40 flex items-center justify-center overflow-hidden'>
        <div className='w-full h-full grid grid-cols-2 grid-rows-3 gap-px p-1'>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-sm ${i === 2 || i === 3 ? 'bg-yellow-600/50' : 'bg-yellow-400/70'}`} />
            ))}
        </div>
    </div>
)

// ─── Bank Card ────────────────────────────────────────────────────────────────

const BankCard = ({ account, masked, onEdit, onDelete, onToggleMain, onToggleMask }) => {
    const palette  = paletteMeta(account.color)
    const type     = accountType(account.type)
    const TypeIcon = type.icon
    const isNeg    = account.balance < 0

    const maskedAccount = account.accountNumber
        ? `${'•'.repeat(Math.max(0, account.accountNumber.length - 2))}${account.accountNumber.slice(-2)}${account.digit ? `-${account.digit}` : ''}`
        : null

    return (
        <div className='group relative'>
            {/* Card face */}
            <div className={`relative bg-gradient-to-br ${palette.card} rounded-2xl p-5 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-default select-none aspect-[1.6/1]`}>

                {/* Background decoration */}
                <div className='absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5' />
                <div className='absolute -bottom-10 -left-6 w-44 h-44 rounded-full bg-white/5' />
                <div className='absolute top-0 right-0 w-24 h-24 rounded-full bg-white/3' style={{ transform: 'translate(30%, -30%)' }} />

                {/* Main indicator */}
                {account.isMain && (
                    <div className='absolute top-3 right-3'>
                        <HiStar className='w-4 h-4 text-yellow-300 drop-shadow' />
                    </div>
                )}

                {/* Inactive badge */}
                {!account.isActive && (
                    <div className='absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm'>
                        <span className='text-xs font-medium text-white/70'>Inativa</span>
                    </div>
                )}

                {/* Row 1: chip + type */}
                <div className='flex items-start justify-between mb-4'>
                    <CardChip />
                    <div className={`w-8 h-8 rounded-xl ${palette.pill} backdrop-blur-sm flex items-center justify-center`}>
                        <TypeIcon className='w-4 h-4 text-white' />
                    </div>
                </div>

                {/* Name + bank */}
                <div className='mb-3'>
                    <p className='text-sm font-bold text-white leading-tight truncate'>{account.name}</p>
                    {account.bank && (
                        <p className='text-xs text-white/60 mt-0.5 truncate'>{account.bank}</p>
                    )}
                </div>

                {/* Account numbers */}
                <div className='flex items-end justify-between'>
                    <div className='space-y-0.5'>
                        {account.agency && (
                            <p className='text-xs text-white/50 font-mono'>
                                Ag {masked ? account.agency.replace(/\d/g, '•') : account.agency}
                            </p>
                        )}
                        {maskedAccount && (
                            <p className='text-xs text-white/50 font-mono'>
                                CC {masked ? maskedAccount : `${account.accountNumber}-${account.digit ?? ''}`}
                            </p>
                        )}
                        {!account.agency && !maskedAccount && (
                            <p className='text-xs text-white/40 italic'>{type.label}</p>
                        )}
                    </div>

                    {/* Balance */}
                    <div className='text-right'>
                        {masked ? (
                            <p className='text-lg font-bold text-white tracking-widest'>••••</p>
                        ) : (
                            <p className={`text-lg font-bold leading-none ${isNeg ? 'text-rose-300' : 'text-white'}`}>
                                {fmt(account.balance)}
                            </p>
                        )}
                        <p className='text-xs text-white/40 mt-0.5'>saldo atual</p>
                    </div>
                </div>
            </div>

            {/* Hover overlay — actions */}
            <div className='absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none' />
            <div className='absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto'>
                <button
                    onClick={onToggleMask}
                    className='p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white transition'
                    title={masked ? 'Mostrar valores' : 'Ocultar valores'}
                >
                    {masked ? <HiOutlineEyeOff className='w-3.5 h-3.5' /> : <HiOutlineEye className='w-3.5 h-3.5' />}
                </button>
                <button
                    onClick={onToggleMain}
                    className='p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-yellow-300 transition'
                    title={account.isMain ? 'Remover como principal' : 'Marcar como principal'}
                >
                    <HiOutlineStar className='w-3.5 h-3.5' />
                </button>
                <button
                    onClick={onEdit}
                    className='p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-amber-300 transition'
                    title='Editar'
                >
                    <HiOutlinePencil className='w-3.5 h-3.5' />
                </button>
                <button
                    onClick={onDelete}
                    className='p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-rose-300 transition'
                    title='Excluir'
                >
                    <HiOutlineTrash className='w-3.5 h-3.5' />
                </button>
            </div>

            {/* Type label below card */}
            <div className='mt-2 flex items-center justify-between px-1'>
                <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>{type.label}</span>
                {account.isMain && (
                    <span className='text-xs font-semibold text-amber-500 flex items-center gap-1'>
                        <HiStar className='w-3 h-3' /> Principal
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Account Dialog ───────────────────────────────────────────────────────────

const EMPTY = {
    name: '', type: 'corrente', bank: '', agency: '', accountNumber: '',
    digit: '', balance: '', color: 'blue', isActive: true, isMain: false, description: '',
}

const AccountDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm]     = useState(EMPTY)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setErrors({})
        setForm(initial
            ? { ...EMPTY, ...initial, balance: String(initial.balance ?? '') }
            : EMPTY)
    }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => {
        setForm((p) => ({ ...p, [k]: v }))
        if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        if (form.balance !== '' && isNaN(Number(form.balance))) e.balance = 'Valor inválido'
        return e
    }

    const handleSubmit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        setTimeout(() => {
            const account = {
                id:            initial?.id ?? genId(),
                name:          form.name.trim(),
                type:          form.type,
                bank:          form.bank.trim(),
                agency:        form.agency.trim(),
                accountNumber: form.accountNumber.trim(),
                digit:         form.digit.trim(),
                balance:       form.balance !== '' ? Number(form.balance) : 0,
                color:         form.color,
                isActive:      form.isActive,
                isMain:        form.isMain,
                description:   form.description.trim(),
            }
            setSaving(false)
            onSuccess(account, isEdit)
        }, 280)
    }

    const accent = isEdit
        ? 'focus:ring-amber-400/30 focus:border-amber-400'
        : 'focus:ring-violet-400/30 focus:border-violet-400'

    const inp = (err) => [
        'w-full py-2.5 px-3 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all',
        err ? 'border-rose-400 focus:ring-rose-400/30' : `border-gray-200 dark:border-gray-700 ${accent}`,
    ].join(' ')

    const typeInfo = accountType(form.type)

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>

                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineCreditCard className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Conta' : 'Nova Conta'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {isEdit ? `Editando: ${initial.name}` : 'Adicione uma conta bancária ou caixa'}
                        </p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>

                    {/* Tipo */}
                    <Field label='Tipo de Conta *'>
                        <div className='grid grid-cols-3 gap-2'>
                            {ACCOUNT_TYPES.map((t) => {
                                const Icon = t.icon
                                const sel  = form.type === t.value
                                return (
                                    <button
                                        key={t.value}
                                        type='button'
                                        onClick={() => set('type', t.value)}
                                        className={[
                                            'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all',
                                            sel
                                                ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                                        ].join(' ')}
                                    >
                                        <Icon className='w-4 h-4' />
                                        {t.label}
                                    </button>
                                )
                            })}
                        </div>
                        <p className='text-xs text-gray-400 mt-1.5'>{typeInfo.description}</p>
                    </Field>

                    {/* Nome */}
                    <Field label='Nome da Conta *' error={errors.name}>
                        <input
                            placeholder='Ex: Itaú Principal, Caixa Recepção…'
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            className={inp(errors.name)}
                        />
                    </Field>

                    {/* Banco */}
                    {typeInfo.showBank && (
                        <Field label='Nome do Banco / Instituição'>
                            <input
                                placeholder='Ex: Banco Itaú Unibanco, Nubank…'
                                value={form.bank}
                                onChange={(e) => set('bank', e.target.value)}
                                className={inp(false)}
                            />
                        </Field>
                    )}

                    {/* Agência + Conta */}
                    {(typeInfo.showAgency || form.type !== 'caixa') && (
                        <div className='grid grid-cols-5 gap-3'>
                            {typeInfo.showAgency && (
                                <div className='col-span-2'>
                                    <Field label='Agência'>
                                        <input
                                            placeholder='0001'
                                            value={form.agency}
                                            onChange={(e) => set('agency', e.target.value)}
                                            className={inp(false)}
                                        />
                                    </Field>
                                </div>
                            )}
                            <div className={typeInfo.showAgency ? 'col-span-2' : 'col-span-4'}>
                                <Field label='Nº da Conta'>
                                    <input
                                        placeholder='12345'
                                        value={form.accountNumber}
                                        onChange={(e) => set('accountNumber', e.target.value)}
                                        className={inp(false)}
                                    />
                                </Field>
                            </div>
                            <div className='col-span-1'>
                                <Field label='Dígito'>
                                    <input
                                        placeholder='0'
                                        value={form.digit}
                                        maxLength={2}
                                        onChange={(e) => set('digit', e.target.value)}
                                        className={inp(false)}
                                    />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* Saldo Inicial */}
                    <Field label='Saldo Atual (R$)' error={errors.balance} hint='Informe o saldo atual nesta conta'>
                        <input
                            type='number'
                            step='0.01'
                            placeholder='0,00'
                            value={form.balance}
                            onChange={(e) => set('balance', e.target.value)}
                            className={inp(errors.balance)}
                        />
                    </Field>

                    {/* Cor do cartão */}
                    <Field label='Cor do Cartão'>
                        <div className='flex flex-wrap gap-2'>
                            {PALETTE.map((p) => (
                                <button
                                    key={p.value}
                                    type='button'
                                    onClick={() => set('color', p.value)}
                                    title={p.label}
                                    className={[
                                        `w-8 h-8 rounded-lg bg-gradient-to-br ${p.card} transition-all`,
                                        form.color === p.value
                                            ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                                            : 'opacity-70 hover:opacity-100 hover:scale-105',
                                    ].join(' ')}
                                />
                            ))}
                        </div>
                    </Field>

                    {/* Descrição */}
                    <Field label='Observação'>
                        <textarea
                            placeholder='Finalidade desta conta, observações…'
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none'
                        />
                    </Field>

                    {/* Flags */}
                    <div className='space-y-2'>
                        {[
                            { key: 'isMain',   label: 'Conta principal',  sub: 'Destacada no topo do painel financeiro' },
                            { key: 'isActive', label: 'Conta ativa',      sub: 'Contas inativas não aparecem em seletores' },
                        ].map(({ key, label, sub }) => (
                            <div key={key} className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                                <div>
                                    <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>{label}</p>
                                    <p className='text-xs text-gray-400'>{sub}</p>
                                </div>
                                <button
                                    type='button'
                                    onClick={() => set(key, !form[key])}
                                    className={`relative inline-flex w-10 h-6 rounded-full transition-colors duration-200 ${form[key] ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
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
                            isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'
                        }`}
                    >
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                            : <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Criar Conta'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Consolidated Balance Bar ─────────────────────────────────────────────────

const ConsolidatedBar = ({ accounts, masked }) => {
    const active = accounts.filter((a) => a.isActive)
    const total  = active.reduce((s, a) => s + (a.balance ?? 0), 0)

    const byType = ACCOUNT_TYPES.map((t) => ({
        ...t,
        sum: active.filter((a) => a.type === t.value).reduce((s, a) => s + (a.balance ?? 0), 0),
        count: active.filter((a) => a.type === t.value).length,
    })).filter((t) => t.count > 0)

    return (
        <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-6 shadow-xl'>
            {/* Decoration */}
            <div className='absolute -top-8 -right-8 w-48 h-48 rounded-full bg-violet-500/10' />
            <div className='absolute -bottom-10 -left-6 w-56 h-56 rounded-full bg-blue-500/10' />

            <div className='relative flex flex-col sm:flex-row sm:items-center gap-4'>
                <div className='flex-1'>
                    <p className='text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1'>
                        Saldo Consolidado
                    </p>
                    <p className={`text-4xl font-bold tracking-tight leading-none ${total < 0 ? 'text-rose-400' : 'text-white'}`}>
                        {masked ? 'R$ •••••••' : fmt(total)}
                    </p>
                    <p className='text-xs text-gray-500 mt-2'>
                        {active.length} conta{active.length !== 1 ? 's' : ''} ativa{active.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Breakdown pills */}
                <div className='flex flex-wrap gap-2'>
                    {byType.map((t) => {
                        const Icon = t.icon
                        return (
                            <div key={t.value} className='flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm'>
                                <Icon className='w-3.5 h-3.5 text-gray-300' />
                                <div>
                                    <p className='text-xs text-gray-400 leading-none'>{t.label}</p>
                                    <p className='text-sm font-semibold text-white leading-snug tabular-nums'>
                                        {masked ? '••••' : fmt(t.sum)}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const FinancialAccountsIndex = () => {
    const [accounts, setAccounts] = useState(load)
    const [dialog, setDialog]     = useState(false)
    const [editing, setEditing]   = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [search, setSearch]     = useState('')
    const [filterType, setFilterType] = useState('')
    const [masked, setMasked]     = useState(false)

    const persist = (data) => {
        setAccounts(data)
        save(data)
    }

    const openNew    = () => { setEditing(null); setDialog(true) }
    const openEdit   = (a) => { setEditing(a);   setDialog(true) }
    const openDelete = (a) => { setDeleting(a); setConfirmOpen(true) }

    const handleSuccess = (account, isEdit) => {
        setDialog(false)
        let next
        if (account.isMain) {
            // remove isMain from others
            next = accounts.map((a) => ({ ...a, isMain: false }))
            next = isEdit
                ? next.map((a) => a.id === account.id ? account : a)
                : [...next, account]
        } else {
            next = isEdit
                ? accounts.map((a) => a.id === account.id ? account : a)
                : [...accounts, account]
        }
        persist(next)
        toast.push(
            <Notification type='success' title={isEdit ? 'Conta atualizada' : 'Conta criada'} />,
            { placement: 'top-center' }
        )
    }

    const handleDelete = () => {
        if (!deleting) return
        persist(accounts.filter((a) => a.id !== deleting.id))
        toast.push(<Notification type='success' title='Conta removida' />, { placement: 'top-center' })
        setConfirmOpen(false)
        setDeleting(null)
    }

    const toggleMain = (account) => {
        const isAlready = account.isMain
        persist(accounts.map((a) => ({
            ...a,
            isMain: isAlready ? false : a.id === account.id,
        })))
    }

    const filtered = useMemo(() => {
        const q = search.toLowerCase()
        return accounts
            .filter((a) => {
                if (filterType && a.type !== filterType) return false
                if (!q) return true
                return (
                    a.name.toLowerCase().includes(q) ||
                    (a.bank ?? '').toLowerCase().includes(q) ||
                    (a.description ?? '').toLowerCase().includes(q)
                )
            })
            .sort((a, b) => {
                if (a.isMain !== b.isMain) return a.isMain ? -1 : 1
                if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
                return a.name.localeCompare(b.name)
            })
    }, [accounts, search, filterType])

    const stats = useMemo(() => {
        const active = accounts.filter((a) => a.isActive)
        return {
            total:    accounts.length,
            active:   active.length,
            inactive: accounts.length - active.length,
            positive: active.filter((a) => a.balance >= 0).length,
            negative: active.filter((a) => a.balance < 0).length,
        }
    }, [accounts])

    return (
        <div className='w-full p-4 space-y-5'>
            <AccountDialog
                isOpen={dialog}
                onClose={() => setDialog(false)}
                onSuccess={handleSuccess}
                initial={editing}
            />

            <ConfirmDialog
                isOpen={confirmOpen}
                type='danger'
                title='Excluir Conta'
                onClose={() => { setConfirmOpen(false); setDeleting(null) }}
                onConfirm={handleDelete}
            >
                <p>Deseja excluir <strong>{deleting?.name}</strong>? Esta ação não pode ser desfeita.</p>
            </ConfirmDialog>

            {/* ── Header ── */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineCreditCard className='w-6 h-6 text-violet-500' />
                        Contas
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>
                        Caixas, contas bancárias e carteiras digitais da clínica
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => setMasked((p) => !p)}
                        className='flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                        title={masked ? 'Mostrar saldos' : 'Ocultar saldos'}
                    >
                        {masked ? <HiOutlineEye className='w-3.5 h-3.5' /> : <HiOutlineEyeOff className='w-3.5 h-3.5' />}
                        {masked ? 'Mostrar' : 'Ocultar'}
                    </button>
                    <button
                        onClick={openNew}
                        className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                    >
                        <HiOutlinePlus className='w-4 h-4' />
                        Nova Conta
                    </button>
                </div>
            </div>

            {/* ── Consolidated balance ── */}
            {accounts.some((a) => a.isActive) && (
                <ConsolidatedBar accounts={accounts} masked={masked} />
            )}

            {/* ── Stats chips ── */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {[
                    { label: 'Total de contas', value: stats.total,    color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    { label: 'Ativas',           value: stats.active,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Inativas',         value: stats.inactive,color: 'text-gray-400',    bg: 'bg-gray-50 dark:bg-gray-800' },
                    { label: 'Com saldo negativo',value: stats.negative,color: 'text-rose-500',   bg: 'bg-rose-50 dark:bg-rose-900/20' },
                ].map((s) => (
                    <Card key={s.label} className='border border-gray-100 dark:border-gray-700/50'>
                        <div className={`inline-flex px-2 py-1 rounded-lg ${s.bg} mb-1`}>
                            <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
                        </div>
                        <p className='text-xs text-gray-400'>{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* ── Filtros ── */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 flex-wrap'>
                    <div className='relative flex-1 min-w-[180px]'>
                        <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4' />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar por nome ou banco…'
                            className='w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 placeholder-gray-400 transition-all'
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className='py-2.5 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition-all'
                    >
                        <option value=''>Todos os tipos</option>
                        {ACCOUNT_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                    {(search || filterType) && (
                        <button
                            onClick={() => { setSearch(''); setFilterType('') }}
                            className='text-xs font-medium text-violet-600 hover:text-violet-700 transition'
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </Card>

            {/* ── Cards grid ── */}
            {filtered.length === 0 ? (
                <Card className='border border-gray-100 dark:border-gray-700/50'>
                    <EmptyState
                        icon={<HiOutlineCreditCard />}
                        message='Nenhuma conta encontrada'
                        sub='Crie a primeira conta bancária ou caixa da clínica'
                        action={
                            <button
                                onClick={openNew}
                                className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition'
                            >
                                <HiOutlinePlus className='w-4 h-4' /> Nova Conta
                            </button>
                        }
                    />
                </Card>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                    {filtered.map((account) => (
                        <BankCard
                            key={account.id}
                            account={account}
                            masked={masked}
                            onEdit={() => openEdit(account)}
                            onDelete={() => openDelete(account)}
                            onToggleMain={() => toggleMain(account)}
                            onToggleMask={() => setMasked((p) => !p)}
                        />
                    ))}

                    {/* Add card placeholder */}
                    <button
                        onClick={openNew}
                        className='aspect-[1.6/1] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-500 transition-all group'
                    >
                        <div className='w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center transition-colors'>
                            <HiOutlinePlus className='w-5 h-5' />
                        </div>
                        <span className='text-xs font-semibold'>Nova Conta</span>
                    </button>
                </div>
            )}

            {/* ── Legend ── */}
            {filtered.length > 0 && (
                <Card className='border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30'>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-1.5'>
                        <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Dica</span>
                        <span className='text-xs text-gray-400 flex items-center gap-1.5'><HiStar className='w-3 h-3 text-yellow-400' /> Passe o mouse no cartão para editar ou marcar como principal</span>
                        <span className='text-xs text-gray-400 flex items-center gap-1.5'><HiOutlineEyeOff className='w-3 h-3' /> Botão "Ocultar" mascara todos os saldos</span>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default FinancialAccountsIndex
