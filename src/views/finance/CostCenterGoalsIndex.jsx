import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import { getCostCenters, createCostCenter, updateCostCenter } from '@/api/billing/billingService'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineX,
    HiOutlineCheck,
    HiOutlineChartBar,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineOfficeBuilding,
    HiOutlineUserGroup,
    HiOutlineLightningBolt,
    HiOutlineClipboardCheck,
    HiOutlineFlag,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineExclamation,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineClock,
    HiOutlineChevronRight,
    HiOutlineDotsVertical,
    HiOutlineAdjustments,
    HiOutlineSparkles,
} from 'react-icons/hi'

// ─── Constants ────────────────────────────────────────────────────────────────

const CC_TYPES = [
    { value: 'operacional',    label: 'Operacional',    icon: HiOutlineLightningBolt,  desc: 'Áreas que geram receita diretamente' },
    { value: 'administrativo', label: 'Administrativo',  icon: HiOutlineOfficeBuilding, desc: 'Gestão, RH, financeiro, TI' },
    { value: 'estrategico',    label: 'Estratégico',     icon: HiOutlineChartBar,       desc: 'Marketing, expansão, P&D' },
    { value: 'apoio',          label: 'Apoio',           icon: HiOutlineUserGroup,      desc: 'Recepção, limpeza, segurança' },
]

const GOAL_TYPES = [
    { value: 'receita',          label: 'Receita',            unit: 'R$',  higherBetter: true,  icon: HiOutlineTrendingUp,    color: 'emerald' },
    { value: 'despesa',          label: 'Despesa (limite)',    unit: 'R$',  higherBetter: false, icon: HiOutlineTrendingDown,   color: 'rose' },
    { value: 'lucro',            label: 'Lucro / Margem',      unit: 'R$',  higherBetter: true,  icon: HiOutlineChartBar,       color: 'blue' },
    { value: 'atendimentos',     label: 'Atendimentos',        unit: 'un',  higherBetter: true,  icon: HiOutlineClipboardCheck, color: 'violet' },
    { value: 'novos_pacientes',  label: 'Novos Pacientes',     unit: 'un',  higherBetter: true,  icon: HiOutlineUserGroup,      color: 'cyan' },
    { value: 'ticket_medio',     label: 'Ticket Médio',        unit: 'R$',  higherBetter: true,  icon: HiOutlineCash,           color: 'amber' },
]

const PERIOD_TYPES = [
    { value: 'mensal',      label: 'Mensal' },
    { value: 'trimestral',  label: 'Trimestral' },
    { value: 'anual',       label: 'Anual' },
]

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const CC_COLORS = [
    { value: 'violet',  bg: 'bg-violet-500',  light: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-600 dark:text-violet-400',  border: 'border-violet-300 dark:border-violet-700',  bar: 'bg-violet-500' },
    { value: 'blue',    bg: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-900/20',      text: 'text-blue-600 dark:text-blue-400',      border: 'border-blue-300 dark:border-blue-700',      bar: 'bg-blue-500' },
    { value: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20',text: 'text-emerald-600 dark:text-emerald-400',border: 'border-emerald-300 dark:border-emerald-700',bar: 'bg-emerald-500' },
    { value: 'rose',    bg: 'bg-rose-500',    light: 'bg-rose-50 dark:bg-rose-900/20',      text: 'text-rose-600 dark:text-rose-400',      border: 'border-rose-300 dark:border-rose-700',      bar: 'bg-rose-500' },
    { value: 'amber',   bg: 'bg-amber-500',   light: 'bg-amber-50 dark:bg-amber-900/20',    text: 'text-amber-600 dark:text-amber-400',    border: 'border-amber-300 dark:border-amber-700',    bar: 'bg-amber-500' },
    { value: 'cyan',    bg: 'bg-cyan-500',    light: 'bg-cyan-50 dark:bg-cyan-900/20',      text: 'text-cyan-600 dark:text-cyan-400',      border: 'border-cyan-300 dark:border-cyan-700',      bar: 'bg-cyan-500' },
    { value: 'teal',    bg: 'bg-teal-500',    light: 'bg-teal-50 dark:bg-teal-900/20',      text: 'text-teal-600 dark:text-teal-400',      border: 'border-teal-300 dark:border-teal-700',      bar: 'bg-teal-500' },
    { value: 'orange',  bg: 'bg-orange-500',  light: 'bg-orange-50 dark:bg-orange-900/20',  text: 'text-orange-600 dark:text-orange-400',  border: 'border-orange-300 dark:border-orange-700',  bar: 'bg-orange-500' },
    { value: 'slate',   bg: 'bg-slate-500',   light: 'bg-slate-50 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-400',    border: 'border-slate-300 dark:border-slate-600',    bar: 'bg-slate-500' },
    { value: 'pink',    bg: 'bg-pink-500',    light: 'bg-pink-50 dark:bg-pink-900/20',      text: 'text-pink-600 dark:text-pink-400',      border: 'border-pink-300 dark:border-pink-700',      bar: 'bg-pink-500' },
]

const ccColor  = (v) => CC_COLORS.find((c) => c.value === v) ?? CC_COLORS[0]
const ccType   = (v) => CC_TYPES.find((t) => t.value === v) ?? CC_TYPES[0]
const goalType = (v) => GOAL_TYPES.find((t) => t.value === v) ?? GOAL_TYPES[0]

// ─── Storage (apenas goals e metadata visual dos CCs) ────────────────────────

const SK_GOALS   = 'fluxy_cc_goals'
const SK_CC_META = 'fluxy_cc_meta'   // { [publicId]: { type, color, responsible } }

const SEED_GOALS = []

const loadGoals  = () => { try { const r = localStorage.getItem(SK_GOALS);   return r ? JSON.parse(r) : SEED_GOALS } catch(_){return SEED_GOALS} }
const loadMeta   = () => { try { const r = localStorage.getItem(SK_CC_META); return r ? JSON.parse(r) : {} }         catch(_){return {}} }
const saveGoals  = (d) => { try { localStorage.setItem(SK_GOALS,   JSON.stringify(d)) } catch(_){} }
const saveMeta   = (d) => { try { localStorage.setItem(SK_CC_META, JSON.stringify(d)) } catch(_){} }

// Mescla dados da API com metadata visual local
const mergeCC = (apiCC, meta) => ({
    id:          apiCC.publicId,
    publicId:    apiCC.publicId,
    code:        apiCC.code,
    name:        apiCC.name,
    description: apiCC.description ?? '',
    isActive:    apiCC.isActive,
    type:        meta?.type        ?? 'operacional',
    color:       meta?.color       ?? 'violet',
    responsible: meta?.responsible ?? '',
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v, unit='R$') => {
    if (unit === 'R$') return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v??0)
    return `${Math.round(v??0)} ${unit}`
}

const pct = (current, target) => {
    if (!target) return 0
    return Math.min(Math.round((current/target)*100), 999)
}

const goalStatus = (g) => {
    const p = pct(g.currentValue, g.targetValue)
    if (g.goalType === 'despesa') {
        if (p <= 85)  return 'atingida'
        if (p <= 100) return 'em_risco'
        return 'nao_atingida'
    }
    if (p >= 100) return 'atingida'
    if (p >= 70)  return 'em_risco'
    return 'nao_atingida'
}

const STATUS_META = {
    atingida:     { label:'Atingida',      icon: HiOutlineCheckCircle,  cls:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-900/20',  bar:'bg-emerald-500' },
    em_risco:     { label:'Em risco',       icon: HiOutlineExclamation,  cls:'text-amber-600 dark:text-amber-400',    bg:'bg-amber-50 dark:bg-amber-900/20',      bar:'bg-amber-400' },
    nao_atingida: { label:'Não atingida',   icon: HiOutlineXCircle,      cls:'text-rose-600 dark:text-rose-400',      bg:'bg-rose-50 dark:bg-rose-900/20',        bar:'bg-rose-500' },
    em_andamento: { label:'Em andamento',   icon: HiOutlineClock,        cls:'text-gray-500 dark:text-gray-400',      bg:'bg-gray-50 dark:bg-gray-800',           bar:'bg-gray-400' },
}

const periodLabel = (g) => {
    if (g.periodType === 'anual')       return `${g.year}`
    if (g.periodType === 'trimestral')  return `T${g.period}/${g.year}`
    return `${MONTHS[g.period-1]}/${g.year}`
}

const currentPeriodKey = (periodType, month, year) => {
    if (periodType === 'anual')       return { period: null, year }
    if (periodType === 'trimestral')  return { period: Math.ceil(month/3), year }
    return { period: month, year }
}

const matchesPeriod = (goal, month, year) => {
    if (goal.year !== year) return false
    if (goal.periodType === 'anual')       return true
    if (goal.periodType === 'trimestral')  return goal.period === Math.ceil(month/3)
    return goal.period === month
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 text-2xl'>
            {icon}
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-2'>{action}</div>}
    </div>
)

// ─── Field ────────────────────────────────────────────────────────────────────

const Field = ({ label, error, hint, children }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>{label}</label>
        {children}
        {hint && !error && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        {error && <p className='text-xs text-rose-500 mt-1'>{error}</p>}
    </div>
)

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ goal }) => {
    const p      = pct(goal.currentValue, goal.targetValue)
    const status = goalStatus(goal)
    const smeta  = STATUS_META[status]
    const gt     = goalType(goal.goalType)
    const clamp  = Math.min(p, 100)

    return (
        <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                    <gt.icon className={`w-3.5 h-3.5 text-${gt.color}-500`} />
                    <span className='text-xs font-semibold text-gray-700 dark:text-gray-200'>{gt.label}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400 tabular-nums'>
                        {fmt(goal.currentValue, gt.unit)} <span className='text-gray-300 dark:text-gray-600'>/</span> {fmt(goal.targetValue, gt.unit)}
                    </span>
                    <span className={`text-xs font-bold tabular-nums ${smeta.cls}`}>{p}%</span>
                </div>
            </div>
            <div className='h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden'>
                <div
                    className={`h-full rounded-full transition-all duration-700 ${smeta.bar}`}
                    style={{ width: `${clamp}%` }}
                />
            </div>
            <div className='flex items-center justify-between'>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${smeta.bg} ${smeta.cls}`}>
                    <smeta.icon className='w-3 h-3' />
                    {smeta.label}
                </span>
                {goal.notes && (
                    <span className='text-xs text-gray-400 italic truncate max-w-[200px]'>{goal.notes}</span>
                )}
            </div>
        </div>
    )
}

// ─── CC Dialog ────────────────────────────────────────────────────────────────

const EMPTY_CC = { code:'', name:'', type:'operacional', responsible:'', color:'violet', description:'', isActive:true }

const CCDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm]     = useState(EMPTY_CC)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useState(() => { if(isOpen) { setErrors({}); setForm(initial ? {...EMPTY_CC,...initial} : EMPTY_CC) } }, [isOpen])

    // useEffect replacement using key prop on parent — we reset via explicit effect
    const [key, setKey] = useState(0)

    const resetForm = () => {
        setErrors({})
        setForm(initial ? { ...EMPTY_CC, ...initial } : EMPTY_CC)
        setKey(k => k+1)
    }

    // sync when dialog opens
    useMemo(() => { if (isOpen) resetForm() }, [isOpen, initial])

    if (!isOpen) return null

    const set = (k, v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:''})) }

    const validate = () => {
        const e = {}
        if (!form.code.trim()) e.code = 'Código é obrigatório'
        if (!form.name.trim()) e.name = 'Nome é obrigatório'
        return e
    }

    const submit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        try {
            await onSuccess({ ...form, name: form.name.trim(), code: form.code.trim(), description: form.description.trim() }, isEdit)
        } finally {
            setSaving(false)
        }
    }

    const inp = (err) => ['w-full py-2.5 px-3 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all',
        err ? 'border-rose-400 focus:ring-rose-400/30' : `border-gray-200 dark:border-gray-700 ${isEdit ? 'focus:ring-amber-400/30 focus:border-amber-400' : 'focus:ring-violet-400/30 focus:border-violet-400'}`].join(' ')

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={()=>!saving&&onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit?'bg-amber-100 dark:bg-amber-900/30':'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineOfficeBuilding className={`w-5 h-5 ${isEdit?'text-amber-600 dark:text-amber-400':'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>{isEdit?'Editar Centro de Custo':'Novo Centro de Custo'}</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{isEdit?`Editando: ${initial.name}`:'Defina uma área de responsabilidade financeira'}</p>
                    </div>
                    <button onClick={()=>!saving&&onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'><HiOutlineX className='w-4 h-4'/></button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>
                    {/* Tipo */}
                    <Field label='Tipo *'>
                        <div className='grid grid-cols-2 gap-2'>
                            {CC_TYPES.map(t => {
                                const Icon = t.icon; const sel = form.type === t.value
                                return (
                                    <button key={t.value} type='button' onClick={()=>set('type',t.value)}
                                        className={['flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all',
                                            sel ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-600' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'].join(' ')}>
                                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sel?'text-violet-600 dark:text-violet-400':'text-gray-400'}`} />
                                        <div>
                                            <p className={`text-xs font-semibold ${sel?'text-violet-700 dark:text-violet-300':'text-gray-700 dark:text-gray-300'}`}>{t.label}</p>
                                            <p className='text-xs text-gray-400 mt-0.5 leading-snug'>{t.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    <div className='grid grid-cols-3 gap-3'>
                        <Field label='Código *' error={errors.code}>
                            <input placeholder='CC-001' value={form.code} onChange={e=>set('code',e.target.value)} className={inp(errors.code)} />
                        </Field>
                        <div className='col-span-2'>
                            <Field label='Nome *' error={errors.name}>
                                <input placeholder='Ex: Ortodontia, Administração…' value={form.name} onChange={e=>set('name',e.target.value)} className={inp(errors.name)} />
                            </Field>
                        </div>
                    </div>

                    <Field label='Responsável'>
                        <input placeholder='Nome do responsável' value={form.responsible} onChange={e=>set('responsible',e.target.value)} className={inp(false)} />
                    </Field>

                    <Field label='Cor de identificação'>
                        <div className='flex flex-wrap gap-2'>
                            {CC_COLORS.map(c => (
                                <button key={c.value} type='button' onClick={()=>set('color',c.value)} title={c.value}
                                    className={[`w-8 h-8 rounded-xl ${c.bg} transition-all`,
                                        form.color===c.value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'].join(' ')} />
                            ))}
                        </div>
                    </Field>

                    <Field label='Descrição / Finalidade'>
                        <textarea placeholder='Descreva as responsabilidades e escopo deste centro de custo…' value={form.description} onChange={e=>set('description',e.target.value)} rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none' />
                    </Field>

                    <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                        <div>
                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Centro ativo</p>
                            <p className='text-xs text-gray-400'>Centros inativos não aparecem em novos lançamentos</p>
                        </div>
                        <button type='button' onClick={()=>set('isActive',!form.isActive)}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${form.isActive?'bg-violet-500':'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive?'translate-x-4':'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={()=>!saving&&onClose()} disabled={saving} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'>Cancelar</button>
                    <button onClick={submit} disabled={saving} className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${isEdit?'bg-amber-500 hover:bg-amber-600':'bg-violet-600 hover:bg-violet-700'}`}>
                        {saving ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin'/>Salvando…</> : <><HiOutlineCheck className='w-4 h-4'/>{isEdit?'Salvar':'Criar'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Goal Dialog ──────────────────────────────────────────────────────────────

const EMPTY_GOAL = { costCenterId:'', periodType:'mensal', period:4, year:2026, goalType:'receita', targetValue:'', currentValue:'', notes:'' }

const GoalDialog = ({ isOpen, onClose, onSuccess, initial, costCenters, defaultCC }) => {
    const isEdit = !!initial
    const [form, setForm]     = useState(EMPTY_GOAL)
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)

    useMemo(() => {
        if (!isOpen) return
        setErrors({})
        const now = new Date()
        setForm(initial
            ? { ...EMPTY_GOAL, ...initial, targetValue: String(initial.targetValue), currentValue: String(initial.currentValue) }
            : { ...EMPTY_GOAL, costCenterId: defaultCC?.id ?? '', period: now.getMonth()+1, year: now.getFullYear() })
    }, [isOpen, initial, defaultCC])

    if (!isOpen) return null

    const set = (k,v) => { setForm(p=>({...p,[k]:v})); if(errors[k]) setErrors(p=>({...p,[k]:''})) }

    const validate = () => {
        const e = {}
        if (!form.costCenterId) e.costCenterId = 'Selecione o centro de custo'
        if (!form.targetValue || isNaN(Number(form.targetValue))) e.targetValue = 'Meta inválida'
        return e
    }

    const submit = () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        setTimeout(() => {
            const g = {
                id: initial?.id ?? `id_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
                costCenterId: form.costCenterId,
                periodType:   form.periodType,
                period:       form.periodType === 'anual' ? null : Number(form.period),
                year:         Number(form.year),
                goalType:     form.goalType,
                targetValue:  Number(form.targetValue),
                currentValue: form.currentValue !== '' ? Number(form.currentValue) : 0,
                notes:        form.notes.trim(),
                status:       'em_andamento',
            }
            onSuccess(g, isEdit)
            setSaving(false)
        }, 280)
    }

    const inp = (err) => ['w-full py-2.5 px-3 text-sm rounded-xl border bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all',
        err ? 'border-rose-400 focus:ring-rose-400/30' : `border-gray-200 dark:border-gray-700 ${isEdit?'focus:ring-amber-400/30 focus:border-amber-400':'focus:ring-violet-400/30 focus:border-violet-400'}`].join(' ')

    const gt = goalType(form.goalType)

    const years = [2025,2026,2027]

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={()=>!saving&&onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit?'bg-amber-100 dark:bg-amber-900/30':'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineFlag className={`w-5 h-5 ${isEdit?'text-amber-600 dark:text-amber-400':'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>{isEdit?'Editar Meta':'Nova Meta'}</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{isEdit?'Atualize os valores e parâmetros':'Defina uma meta para o período'}</p>
                    </div>
                    <button onClick={()=>!saving&&onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'><HiOutlineX className='w-4 h-4'/></button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>
                    {/* Centro */}
                    <Field label='Centro de Custo *' error={errors.costCenterId}>
                        <select value={form.costCenterId} onChange={e=>set('costCenterId',e.target.value)} className={inp(errors.costCenterId)}>
                            <option value=''>Selecione…</option>
                            {costCenters.filter(c=>c.isActive).map(c=>(
                                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                            ))}
                        </select>
                    </Field>

                    {/* Tipo da meta */}
                    <Field label='Tipo de Meta *'>
                        <div className='grid grid-cols-3 gap-2'>
                            {GOAL_TYPES.map(t => {
                                const Icon = t.icon; const sel = form.goalType===t.value
                                return (
                                    <button key={t.value} type='button' onClick={()=>set('goalType',t.value)}
                                        className={['flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all',
                                            sel ? `border-${t.color}-400 bg-${t.color}-50 text-${t.color}-700 dark:bg-${t.color}-900/20 dark:border-${t.color}-600 dark:text-${t.color}-300`
                                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'].join(' ')}>
                                        <Icon className='w-4 h-4' />{t.label}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    {/* Período */}
                    <Field label='Tipo de Período'>
                        <div className='flex gap-2'>
                            {PERIOD_TYPES.map(pt=>(
                                <button key={pt.value} type='button' onClick={()=>set('periodType',pt.value)}
                                    className={['flex-1 py-2 rounded-xl border text-xs font-medium transition-all',
                                        form.periodType===pt.value ? 'border-violet-400 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:border-violet-600 dark:text-violet-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'].join(' ')}>
                                    {pt.label}
                                </button>
                            ))}
                        </div>
                    </Field>

                    <div className='grid grid-cols-2 gap-3'>
                        {form.periodType === 'mensal' && (
                            <Field label='Mês'>
                                <select value={form.period} onChange={e=>set('period',e.target.value)} className={inp(false)}>
                                    {MONTHS_FULL.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                                </select>
                            </Field>
                        )}
                        {form.periodType === 'trimestral' && (
                            <Field label='Trimestre'>
                                <select value={form.period} onChange={e=>set('period',e.target.value)} className={inp(false)}>
                                    {[1,2,3,4].map(q=><option key={q} value={q}>T{q}</option>)}
                                </select>
                            </Field>
                        )}
                        <Field label='Ano'>
                            <select value={form.year} onChange={e=>set('year',e.target.value)} className={inp(false)}>
                                {years.map(y=><option key={y} value={y}>{y}</option>)}
                            </select>
                        </Field>
                    </div>

                    {/* Valores */}
                    <div className='grid grid-cols-2 gap-3'>
                        <Field label={`Meta (${gt.unit}) *`} error={errors.targetValue}>
                            <input type='number' step='0.01' placeholder='0' value={form.targetValue} onChange={e=>set('targetValue',e.target.value)} className={inp(errors.targetValue)} />
                        </Field>
                        <Field label={`Realizado (${gt.unit})`} hint='Pode atualizar depois'>
                            <input type='number' step='0.01' placeholder='0' value={form.currentValue} onChange={e=>set('currentValue',e.target.value)} className={inp(false)} />
                        </Field>
                    </div>

                    <Field label='Observação'>
                        <textarea placeholder='Contexto ou condições desta meta…' value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2}
                            className='w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 transition-all resize-none' />
                    </Field>
                </div>

                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={()=>!saving&&onClose()} disabled={saving} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'>Cancelar</button>
                    <button onClick={submit} disabled={saving} className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50 text-white transition shadow-sm ${isEdit?'bg-amber-500 hover:bg-amber-600':'bg-violet-600 hover:bg-violet-700'}`}>
                        {saving?<><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin'/>Salvando…</>:<><HiOutlineCheck className='w-4 h-4'/>{isEdit?'Salvar':'Criar Meta'}</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Update Realized Dialog (quick input) ─────────────────────────────────────

const UpdateRealizedDialog = ({ isOpen, onClose, onSuccess, goal }) => {
    const [value, setValue] = useState('')
    const [saving, setSaving] = useState(false)

    useMemo(() => { if (isOpen && goal) setValue(String(goal.currentValue ?? '')) }, [isOpen, goal])

    if (!isOpen || !goal) return null
    const gt = goalType(goal.goalType)

    const submit = () => {
        if (isNaN(Number(value))) return
        setSaving(true)
        setTimeout(() => { onSuccess({ ...goal, currentValue: Number(value) }); setSaving(false) }, 200)
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={()=>!saving&&onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
                        <HiOutlineAdjustments className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-sm'>Atualizar Realizado</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{gt.label} · {periodLabel(goal)}</p>
                    </div>
                    <button onClick={()=>!saving&&onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'><HiOutlineX className='w-4 h-4'/></button>
                </div>
                <div className='px-5 py-4 space-y-3'>
                    <div className='text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800'>
                        <p className='text-xs text-gray-400'>Meta</p>
                        <p className='text-lg font-bold text-gray-800 dark:text-gray-100'>{fmt(goal.targetValue, gt.unit)}</p>
                    </div>
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'>Valor Realizado ({gt.unit})</label>
                        <input type='number' step='0.01' value={value} onChange={e=>setValue(e.target.value)} autoFocus
                            className='w-full py-2.5 px-3 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all' />
                    </div>
                </div>
                <div className='flex gap-3 px-5 pb-5'>
                    <button onClick={()=>!saving&&onClose()} className='flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>Cancelar</button>
                    <button onClick={submit} disabled={saving} className='flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50'>
                        {saving?<div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin'/>:<><HiOutlineCheck className='w-4 h-4'/>Atualizar</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── CC Sidebar Item ──────────────────────────────────────────────────────────

const SidebarItem = ({ cc, goals, selected, month, year, onClick }) => {
    const col   = ccColor(cc.color)
    const ccGoals = goals.filter(g => g.costCenterId === cc.id && matchesPeriod(g, month, year))
    const statuses = ccGoals.map(goalStatus)
    const hasNot  = statuses.includes('nao_atingida')
    const hasRisk = statuses.includes('em_risco')
    const allOk   = ccGoals.length > 0 && statuses.every(s => s === 'atingida')
    const noGoals = ccGoals.length === 0

    const dot = noGoals ? 'bg-gray-300 dark:bg-gray-600'
        : hasNot  ? 'bg-rose-500'
        : hasRisk ? 'bg-amber-400'
        : allOk   ? 'bg-emerald-500'
        : 'bg-gray-300'

    return (
        <button onClick={onClick} className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left',
            selected ? 'bg-gray-100 dark:bg-gray-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'].join(' ')}>
            <div className={`w-8 h-8 rounded-xl ${col.bg} flex-shrink-0 flex items-center justify-center`}>
                <span className='text-xs font-bold text-white'>{cc.code.replace('CC-','')}</span>
            </div>
            <div className='flex-1 min-w-0'>
                <p className={`text-sm font-semibold truncate ${selected?'text-gray-900 dark:text-gray-100':'text-gray-700 dark:text-gray-200'}`}>{cc.name}</p>
                <p className='text-xs text-gray-400 truncate'>{ccGoals.length} meta{ccGoals.length!==1?'s':''}</p>
            </div>
            <div className='flex items-center gap-2 flex-shrink-0'>
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                {selected && <HiOutlineChevronRight className='w-3.5 h-3.5 text-gray-400' />}
            </div>
        </button>
    )
}

// ─── Goal Detail Panel ────────────────────────────────────────────────────────

const GoalPanel = ({ cc, goals, month, year, onAddGoal, onEditGoal, onUpdateRealized, onDeleteGoal }) => {
    const col     = ccColor(cc.color)
    const type    = ccType(cc.type)
    const TypeIcon = type.icon
    const ccGoals  = goals.filter(g => g.costCenterId === cc.id && matchesPeriod(g, month, year))
    const allGoals = goals.filter(g => g.costCenterId === cc.id)

    // overall score
    const scored = ccGoals.filter(g => g.targetValue > 0)
    const avgPct = scored.length
        ? Math.round(scored.reduce((s,g) => {
            const p = pct(g.currentValue, g.targetValue)
            return s + (g.goalType==='despesa' ? (100-Math.max(0,p-100)) : Math.min(p,100))
          }, 0) / scored.length)
        : null

    const scoreColor = avgPct === null ? 'text-gray-400'
        : avgPct >= 90 ? 'text-emerald-600 dark:text-emerald-400'
        : avgPct >= 70 ? 'text-amber-600 dark:text-amber-400'
        : 'text-rose-600 dark:text-rose-400'

    return (
        <div className='flex flex-col h-full'>
            {/* CC header */}
            <div className={`rounded-2xl p-4 mb-4 ${col.light} border ${col.border}`}>
                <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className={`w-10 h-10 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <TypeIcon className='w-5 h-5 text-white' />
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h3 className='font-bold text-gray-800 dark:text-gray-100'>{cc.name}</h3>
                                <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-lg ${col.light} ${col.text} border ${col.border}`}>{cc.code}</span>
                            </div>
                            <div className='flex items-center gap-2 mt-0.5'>
                                <span className={`text-xs font-medium ${col.text}`}>{type.label}</span>
                                {cc.responsible && <><span className='text-gray-300 dark:text-gray-600 text-xs'>·</span><span className='text-xs text-gray-400'>{cc.responsible}</span></>}
                            </div>
                        </div>
                    </div>
                    {avgPct !== null && (
                        <div className='text-right flex-shrink-0'>
                            <p className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{avgPct}%</p>
                            <p className='text-xs text-gray-400'>score geral</p>
                        </div>
                    )}
                </div>
                {cc.description && <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed'>{cc.description}</p>}
            </div>

            {/* Goals list */}
            <div className='flex items-center justify-between mb-3'>
                <h4 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                    Metas do período · {ccGoals.length}
                </h4>
                <button onClick={onAddGoal}
                    className='flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition'>
                    <HiOutlinePlus className='w-3.5 h-3.5' /> Nova Meta
                </button>
            </div>

            {ccGoals.length === 0 ? (
                <EmptyState
                    icon={<HiOutlineFlag />}
                    message='Nenhuma meta para este período'
                    sub='Defina metas de receita, despesa ou outros indicadores'
                    action={
                        <button onClick={onAddGoal} className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition'>
                            <HiOutlinePlus className='w-4 h-4'/> Criar primeira meta
                        </button>
                    }
                />
            ) : (
                <div className='space-y-3 flex-1 overflow-y-auto pr-0.5'>
                    {ccGoals.map(g => (
                        <div key={g.id} className='group p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 hover:shadow-sm transition-shadow'>
                            <ProgressBar goal={g} />
                            <div className='flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button onClick={()=>onUpdateRealized(g)} className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition'>
                                    <HiOutlineAdjustments className='w-3 h-3'/> Atualizar realizado
                                </button>
                                <button onClick={()=>onEditGoal(g)} className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition'>
                                    <HiOutlinePencil className='w-3 h-3'/> Editar
                                </button>
                                <button onClick={()=>onDeleteGoal(g)} className='flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition'>
                                    <HiOutlineTrash className='w-3 h-3'/> Remover
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Other periods hint */}
            {allGoals.length > ccGoals.length && (
                <p className='text-xs text-gray-400 text-center mt-3'>
                    + {allGoals.length - ccGoals.length} meta{allGoals.length - ccGoals.length!==1?'s':''} em outros períodos
                </p>
            )}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const CostCenterGoalsIndex = () => {
    const now             = new Date()
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)

    const [costCenters, setCCs]       = useState([])
    const [ccMeta, setCCMeta]         = useState(loadMeta)
    const [loading, setLoading]       = useState(false)
    const [goals, setGoals]           = useState(loadGoals)
    const [selectedCC, setSelectedCC] = useState(null)
    const [month, setMonth]           = useState(now.getMonth()+1)
    const [year, setYear]             = useState(now.getFullYear())

    // dialogs
    const [ccDialog, setCCDialog]         = useState(false)
    const [editingCC, setEditingCC]       = useState(null)
    const [deletingCC, setDeletingCC]     = useState(null)
    const [confirmCCOpen, setConfirmCCOpen] = useState(false)

    const [goalDialog, setGoalDialog]       = useState(false)
    const [editingGoal, setEditingGoal]     = useState(null)
    const [deletingGoal, setDeletingGoal]   = useState(null)
    const [confirmGoalOpen, setConfirmGoalOpen] = useState(false)
    const [updateDialog, setUpdateDialog]   = useState(false)
    const [updatingGoal, setUpdatingGoal]   = useState(null)

    // ── Carregar CCs da API ─────────────────────────────────────────────────
    const loadFromApi = async () => {
        if (!companyPublicId) return
        setLoading(true)
        try {
            const data = await getCostCenters(companyPublicId)
            const meta = loadMeta()
            setCCs((data ?? []).map(cc => mergeCC(cc, meta[cc.publicId])))
        } catch {
            toast.push(<Notification type='danger' title='Erro ao carregar centros de custo'/>, {placement:'top-center'})
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadFromApi() }, [companyPublicId])

    const persistGoals = (d) => { setGoals(d); saveGoals(d) }

    const activeCCs = useMemo(() => costCenters.filter(c=>c.isActive), [costCenters])
    const selCC     = useMemo(() => costCenters.find(c=>c.id===selectedCC) ?? activeCCs[0] ?? null, [costCenters, selectedCC, activeCCs])

    // Summary stats for current period
    const periodGoals = useMemo(() => goals.filter(g => matchesPeriod(g, month, year)), [goals, month, year])
    const stats = useMemo(() => {
        const statuses = periodGoals.map(goalStatus)
        return {
            totalCCs:    activeCCs.length,
            totalGoals:  periodGoals.length,
            atingidas:   statuses.filter(s=>s==='atingida').length,
            emRisco:     statuses.filter(s=>s==='em_risco').length,
            naoAtingidas:statuses.filter(s=>s==='nao_atingida').length,
            semMeta:     activeCCs.filter(cc=>!periodGoals.some(g=>g.costCenterId===cc.id)).length,
        }
    }, [activeCCs, periodGoals])

    // ── CC handlers ──────────────────────────────────────────────────────────
    const openNewCC  = () => { setEditingCC(null); setCCDialog(true) }
    const openEditCC = (cc) => { setEditingCC(cc); setCCDialog(true) }

    const handleCCSuccess = async (form, isEdit) => {
        const payload = {
            companyPublicId,
            code:        form.code,
            name:        form.name,
            description: form.description,
            isActive:    form.isActive ?? true,
        }
        try {
            const visualMeta = { type: form.type, color: form.color, responsible: form.responsible }
            if (isEdit) {
                await updateCostCenter(editingCC.publicId, { ...payload, publicId: editingCC.publicId })
                const meta = loadMeta()
                meta[editingCC.publicId] = visualMeta
                saveMeta(meta)
            } else {
                const created = await createCostCenter(payload)
                if (created?.publicId) {
                    const meta = loadMeta()
                    meta[created.publicId] = visualMeta
                    saveMeta(meta)
                }
            }
            await loadFromApi()
            setCCDialog(false)
            toast.push(<Notification type='success' title={isEdit?'Centro atualizado':'Centro criado'}/>, {placement:'top-center'})
        } catch (err) {
            const msg = err?.response?.data ?? (isEdit ? 'Erro ao atualizar' : 'Erro ao criar')
            toast.push(<Notification type='danger' title={typeof msg === 'string' ? msg : 'Erro ao salvar'}/>, {placement:'top-center'})
            throw err
        }
    }

    const handleDeleteCC = () => {
        if (!deletingCC) return
        // soft: marcar inativo via update
        updateCostCenter(deletingCC.publicId, {
            companyPublicId,
            code: deletingCC.code, name: deletingCC.name,
            description: deletingCC.description, isActive: false,
        }).then(() => {
            loadFromApi()
            persistGoals(goals.filter(g=>g.costCenterId!==deletingCC.id))
            if (selectedCC===deletingCC.id) setSelectedCC(null)
            toast.push(<Notification type='success' title='Centro desativado'/>, {placement:'top-center'})
        }).catch(() => {
            toast.push(<Notification type='danger' title='Erro ao desativar'/>, {placement:'top-center'})
        })
        setConfirmCCOpen(false); setDeletingCC(null)
    }

    // Goal handlers
    const openNewGoal  = () => { setEditingGoal(null); setGoalDialog(true) }
    const openEditGoal = (g)  => { setEditingGoal(g);  setGoalDialog(true) }
    const handleGoalSuccess = (goal, isEdit) => {
        setGoalDialog(false)
        persistGoals(isEdit ? goals.map(g=>g.id===goal.id?goal:g) : [...goals, goal])
        toast.push(<Notification type='success' title={isEdit?'Meta atualizada':'Meta criada'}/>, {placement:'top-center'})
    }
    const handleUpdateRealized = (goal) => { setUpdatingGoal(goal); setUpdateDialog(true) }
    const handleUpdateSuccess  = (updated) => {
        setUpdateDialog(false)
        persistGoals(goals.map(g=>g.id===updated.id?updated:g))
        toast.push(<Notification type='success' title='Realizado atualizado'/>, {placement:'top-center'})
    }
    const handleDeleteGoal = () => {
        if (!deletingGoal) return
        persistGoals(goals.filter(g=>g.id!==deletingGoal.id))
        toast.push(<Notification type='success' title='Meta removida'/>, {placement:'top-center'})
        setConfirmGoalOpen(false); setDeletingGoal(null)
    }

    const years = [2025,2026,2027]

    return (
        <div className='w-full p-4 space-y-4'>
            {/* Dialogs */}
            <CCDialog isOpen={ccDialog} onClose={()=>setCCDialog(false)} onSuccess={handleCCSuccess} initial={editingCC} />
            <GoalDialog isOpen={goalDialog} onClose={()=>setGoalDialog(false)} onSuccess={handleGoalSuccess} initial={editingGoal} costCenters={costCenters} defaultCC={selCC} />
            <UpdateRealizedDialog isOpen={updateDialog} onClose={()=>setUpdateDialog(false)} onSuccess={handleUpdateSuccess} goal={updatingGoal} />
            <ConfirmDialog isOpen={confirmCCOpen} type='danger' title='Excluir Centro de Custo' onClose={()=>setConfirmCCOpen(false)} onConfirm={handleDeleteCC}>
                <p>Excluir <strong>{deletingCC?.name}</strong> removerá também todas as suas metas. Continuar?</p>
            </ConfirmDialog>
            <ConfirmDialog isOpen={confirmGoalOpen} type='danger' title='Remover Meta' onClose={()=>setConfirmGoalOpen(false)} onConfirm={handleDeleteGoal}>
                <p>Deseja remover esta meta? A ação não pode ser desfeita.</p>
            </ConfirmDialog>

            {/* ── Header ── */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineFlag className='w-6 h-6 text-violet-500' />
                        Metas por Centro de Custo
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>Defina e acompanhe metas financeiras e operacionais por área</p>
                </div>
                <div className='flex items-center gap-2 flex-wrap'>
                    {/* Period picker */}
                    <div className='flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
                        <HiOutlineCalendar className='w-4 h-4 text-gray-400' />
                        <select value={month} onChange={e=>setMonth(Number(e.target.value))} className='text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none pr-1'>
                            {MONTHS_FULL.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
                        </select>
                        <select value={year} onChange={e=>setYear(Number(e.target.value))} className='text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none'>
                            {years.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <button onClick={openNewGoal} className='flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition whitespace-nowrap'>
                        <HiOutlinePlus className='w-4 h-4'/> Nova Meta
                    </button>
                    <button onClick={openNewCC} className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'>
                        <HiOutlinePlus className='w-4 h-4'/> Novo Centro
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
                {[
                    { label:'Centros ativos',    value: stats.totalCCs,     color:'text-violet-600 dark:text-violet-400',  bg:'bg-violet-50 dark:bg-violet-900/20' },
                    { label:'Metas no período',  value: stats.totalGoals,   color:'text-blue-600 dark:text-blue-400',      bg:'bg-blue-50 dark:bg-blue-900/20' },
                    { label:'Atingidas',         value: stats.atingidas,    color:'text-emerald-600 dark:text-emerald-400',bg:'bg-emerald-50 dark:bg-emerald-900/20' },
                    { label:'Em risco',          value: stats.emRisco,      color:'text-amber-600 dark:text-amber-400',    bg:'bg-amber-50 dark:bg-amber-900/20' },
                    { label:'Não atingidas',     value: stats.naoAtingidas, color:'text-rose-600 dark:text-rose-400',      bg:'bg-rose-50 dark:bg-rose-900/20' },
                ].map(s=>(
                    <Card key={s.label} className='border border-gray-100 dark:border-gray-700/50'>
                        <div className={`inline-flex px-2 py-1 rounded-lg ${s.bg} mb-1`}>
                            <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</span>
                        </div>
                        <p className='text-xs text-gray-400'>{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* ── Two-panel layout ── */}
            {loading ? (
                <Card className='border border-gray-100 dark:border-gray-700/50'>
                    <div className='flex items-center justify-center py-12 gap-3 text-gray-400'>
                        <div className='w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin'/>
                        <span className='text-sm'>Carregando centros de custo…</span>
                    </div>
                </Card>
            ) : activeCCs.length === 0 ? (
                <Card className='border border-gray-100 dark:border-gray-700/50'>
                    <EmptyState
                        icon={<HiOutlineOfficeBuilding />}
                        message='Nenhum centro de custo cadastrado'
                        sub='Crie centros para organizar metas por área da clínica'
                        action={<button onClick={openNewCC} className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition'><HiOutlinePlus className='w-4 h-4'/>Criar primeiro centro</button>}
                    />
                </Card>
            ) : (
                <div className='flex gap-4 items-start'>
                    {/* Sidebar */}
                    <div className='w-64 flex-shrink-0'>
                        <Card className='border border-gray-100 dark:border-gray-700/50 p-2'>
                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pb-2'>
                                Centros · {MONTHS[month-1]} {year}
                            </p>
                            <div className='space-y-0.5'>
                                {activeCCs.map(cc=>(
                                    <div key={cc.id} className='group relative'>
                                        <SidebarItem
                                            cc={cc} goals={goals} selected={selCC?.id===cc.id}
                                            month={month} year={year}
                                            onClick={()=>setSelectedCC(cc.id)}
                                        />
                                        {/* Hover actions */}
                                        <div className='absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto'>
                                            <button onClick={e=>{e.stopPropagation();openEditCC(cc)}} className='p-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'>
                                                <HiOutlinePencil className='w-3 h-3'/>
                                            </button>
                                            <button onClick={e=>{e.stopPropagation();setDeletingCC(cc);setConfirmCCOpen(true)}} className='p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition'>
                                                <HiOutlineTrash className='w-3 h-3'/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Detail panel */}
                    <div className='flex-1 min-w-0'>
                        {selCC ? (
                            <Card className='border border-gray-100 dark:border-gray-700/50 min-h-[400px]'>
                                <GoalPanel
                                    cc={selCC}
                                    goals={goals}
                                    month={month}
                                    year={year}
                                    onAddGoal={()=>{setEditingGoal(null);setGoalDialog(true)}}
                                    onEditGoal={openEditGoal}
                                    onUpdateRealized={handleUpdateRealized}
                                    onDeleteGoal={(g)=>{setDeletingGoal(g);setConfirmGoalOpen(true)}}
                                />
                            </Card>
                        ) : (
                            <Card className='border border-gray-100 dark:border-gray-700/50'>
                                <EmptyState icon={<HiOutlineChartBar/>} message='Selecione um centro de custo' sub='Clique em um centro ao lado para ver e gerenciar suas metas'/>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CostCenterGoalsIndex
