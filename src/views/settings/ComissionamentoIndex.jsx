import { useMemo, useRef, useState } from 'react'
import { Card, Notification, toast } from '@/components/ui'
import { ConfirmDialog } from '@/components/shared'
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineCheck,
    HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineCash, HiOutlineChartBar,
    HiOutlineTrendingUp, HiOutlineAdjustments, HiOutlineLightningBolt,
    HiOutlineCalculator, HiOutlineInformationCircle, HiOutlineChevronRight,
    HiOutlineStar, HiOutlineRefresh, HiOutlineColorSwatch, HiOutlineTag,
    HiOutlineClipboardList, HiOutlineChartPie, HiOutlineTemplate,
    HiOutlineDotsVertical, HiOutlineExclamation, HiOutlineCheckCircle,
} from 'react-icons/hi'

// ─── Constants ────────────────────────────────────────────────────────────────

const PROF_TYPES = [
    { v: 'prestador',   l: 'Prestador de Serviço',  icon: HiOutlineBriefcase,  desc: 'Associado, autônomo ou PJ',         color: 'violet' },
    { v: 'funcionario', l: 'Funcionário Interno',    icon: HiOutlineUserGroup,  desc: 'CLT, horista ou estatutário',       color: 'blue' },
    { v: 'comercial',   l: 'Comercial / Captação',   icon: HiOutlineStar,       desc: 'Recepcionista, vendedor, gestor',   color: 'amber' },
]

const RULE_TYPES = [
    { v: 'geral',         l: 'Percentual Geral',      icon: HiOutlineChartPie,       desc: '% único sobre toda a base de cálculo' },
    { v: 'faixa',         l: 'Escalonado por Meta',   icon: HiOutlineTrendingUp,    desc: '% aumenta conforme a produção cresce' },
    { v: 'por_categoria', l: 'Por Especialidade',     icon: HiOutlineTag,           desc: '% diferente por categoria de serviço' },
    { v: 'valor_fixo',    l: 'Valor Fixo por Ato',    icon: HiOutlineCash,          desc: 'R$ fixo por procedimento realizado' },
]

const BASES = [
    { v: 'producao',    l: 'Produção',    desc: 'Valor dos procedimentos realizados, independente do pagamento' },
    { v: 'recebimento', l: 'Recebimento', desc: 'Valor efetivamente recebido pela clínica' },
]

const CATEGORIES = [
    'Clínica Geral', 'Ortodontia', 'Implantodontia', 'Endodontia',
    'Cirurgia', 'Estética Dental', 'Prótese', 'Periodontia', 'Preventivo', 'Radiologia', 'Outros',
]

const PROFILE_COLORS = [
    { v: 'violet',  bg: 'bg-violet-500',  light: 'bg-violet-50 dark:bg-violet-900/20',  text: 'text-violet-600 dark:text-violet-400',  border: 'border-violet-200 dark:border-violet-800' },
    { v: 'blue',    bg: 'bg-blue-500',    light: 'bg-blue-50 dark:bg-blue-900/20',       text: 'text-blue-600 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-800' },
    { v: 'emerald', bg: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    { v: 'amber',   bg: 'bg-amber-500',   light: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-800' },
    { v: 'rose',    bg: 'bg-rose-500',    light: 'bg-rose-50 dark:bg-rose-900/20',       text: 'text-rose-600 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-800' },
    { v: 'cyan',    bg: 'bg-cyan-500',    light: 'bg-cyan-50 dark:bg-cyan-900/20',       text: 'text-cyan-600 dark:text-cyan-400',       border: 'border-cyan-200 dark:border-cyan-800' },
    { v: 'teal',    bg: 'bg-teal-500',    light: 'bg-teal-50 dark:bg-teal-900/20',       text: 'text-teal-600 dark:text-teal-400',       border: 'border-teal-200 dark:border-teal-800' },
    { v: 'orange',  bg: 'bg-orange-500',  light: 'bg-orange-50 dark:bg-orange-900/20',   text: 'text-orange-600 dark:text-orange-400',   border: 'border-orange-200 dark:border-orange-800' },
]

const profColor = (v) => PROFILE_COLORS.find(c => c.v === v) ?? PROFILE_COLORS[0]
const profType  = (v) => PROF_TYPES.find(t => t.v === v) ?? PROF_TYPES[0]
const ruleType  = (v) => RULE_TYPES.find(r => r.v === v) ?? RULE_TYPES[0]
const baseLabel = (v) => BASES.find(b => b.v === v)?.l ?? v

// ─── Storage & Seed ───────────────────────────────────────────────────────────

const SK_P = 'fluxy_comm_profiles'
const SK_A = 'fluxy_comm_assignments'
const genId = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const SEED_PROFILES = [
    {
        id: 'p1', name: 'Dentista Associado', color: 'violet', tipo: 'prestador', base: 'producao', isActive: true,
        description: 'Profissional que trabalha como associado, dividindo a produção com a clínica.',
        rules: [{ id: 'r1', tipo: 'geral', percentual: 40, label: '' }],
    },
    {
        id: 'p2', name: 'Especialista Premium', color: 'emerald', tipo: 'prestador', base: 'recebimento', isActive: true,
        description: 'Taxas diferenciadas por especialidade. Maior repasse para procedimentos de alto valor.',
        rules: [
            { id: 'r2', tipo: 'por_categoria', categoria: 'Implantodontia',  percentual: 55 },
            { id: 'r3', tipo: 'por_categoria', categoria: 'Ortodontia',       percentual: 50 },
            { id: 'r4', tipo: 'por_categoria', categoria: 'Estética Dental',  percentual: 50 },
            { id: 'r5', tipo: 'geral',          percentual: 40, label: 'Demais procedimentos' },
        ],
    },
    {
        id: 'p3', name: 'Dentista CLT – Bonificação', color: 'blue', tipo: 'funcionario', base: 'producao', isActive: true,
        description: 'Funcionário com salário fixo. Recebe bônus percentual escalonado ao atingir metas de produção mensais.',
        rules: [{
            id: 'r6', tipo: 'faixa',
            faixas: [
                { id: 'f1', de: 0,     ate: 15000, percentual: 5  },
                { id: 'f2', de: 15000, ate: 30000, percentual: 8  },
                { id: 'f3', de: 30000, ate: null,  percentual: 12 },
            ],
        }],
    },
    {
        id: 'p4', name: 'Recepcionista Comercial', color: 'amber', tipo: 'comercial', base: 'producao', isActive: true,
        description: 'Bônus por conversão de novos pacientes e fechamento de planos de tratamento.',
        rules: [{ id: 'r7', tipo: 'valor_fixo', valor: 80, label: 'Por novo paciente convertido' }],
    },
]

const SEED_ASSIGNMENTS = [
    { id: 'a1', profileId: 'p1', profileName: 'Dentista Associado',          nome: 'Dr. Carlos Silva',   cargo: 'Clínico Geral',     tipo: 'prestador',   inicioVigencia: '01/01/2026', fimVigencia: '', isActive: true },
    { id: 'a2', profileId: 'p2', profileName: 'Especialista Premium',         nome: 'Dra. Ana Souza',     cargo: 'Ortodontista',      tipo: 'prestador',   inicioVigencia: '01/03/2026', fimVigencia: '', isActive: true },
    { id: 'a3', profileId: 'p2', profileName: 'Especialista Premium',         nome: 'Dr. Marcos Lima',    cargo: 'Implantodontista',  tipo: 'prestador',   inicioVigencia: '01/02/2026', fimVigencia: '', isActive: true },
    { id: 'a4', profileId: 'p3', profileName: 'Dentista CLT – Bonificação',   nome: 'Dra. Juliana Costa', cargo: 'Endodontista',      tipo: 'funcionario', inicioVigencia: '01/04/2026', fimVigencia: '', isActive: true },
    { id: 'a5', profileId: 'p4', profileName: 'Recepcionista Comercial',      nome: 'Renata Oliveira',    cargo: 'Recepcionista',     tipo: 'comercial',   inicioVigencia: '01/01/2026', fimVigencia: '', isActive: true },
]

const loadP = () => { try { const r = localStorage.getItem(SK_P); return r ? JSON.parse(r) : SEED_PROFILES } catch (_) { return SEED_PROFILES } }
const loadA = () => { try { const r = localStorage.getItem(SK_A); return r ? JSON.parse(r) : SEED_ASSIGNMENTS } catch (_) { return SEED_ASSIGNMENTS } }
const saveP = (d) => { try { localStorage.setItem(SK_P, JSON.stringify(d)) } catch (_) {} }
const saveA = (d) => { try { localStorage.setItem(SK_A, JSON.stringify(d)) } catch (_) {} }

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmtCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)
const fmtPct = (v) => `${v}%`

// ─── Shared UI ────────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 text-2xl'>{icon}</div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-2'>{action}</div>}
    </div>
)

const Field = ({ label, error, hint, children, required }) => (
    <div>
        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide'>
            {label}{required && <span className='text-rose-400 ml-0.5'>*</span>}
        </label>
        {children}
        {hint && !error && <p className='text-xs text-gray-400 mt-1'>{hint}</p>}
        {error && <p className='text-xs text-rose-500 mt-1 flex items-center gap-1'><HiOutlineExclamation className='w-3 h-3'/>{error}</p>}
    </div>
)

const inp = (accent = 'violet', err = false) =>
    ['w-full border rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none transition placeholder:text-gray-300 dark:placeholder:text-gray-600',
     err ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/30' : `border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-${accent}-400/40 focus:border-${accent}-400`].join(' ')

// ─── Rule Card (read-only display) ───────────────────────────────────────────

const RuleCard = ({ rule, base, onEdit, onDelete }) => {
    const rt = ruleType(rule.tipo)
    const Icon = rt.icon

    const renderContent = () => {
        if (rule.tipo === 'geral') return (
            <div className='flex items-center gap-2'>
                <span className='text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{rule.percentual}%</span>
                <span className='text-xs text-gray-400'>sobre {baseLabel(base).toLowerCase()}</span>
            </div>
        )
        if (rule.tipo === 'por_categoria') return (
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <span className='text-xs font-semibold px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'>{rule.categoria}</span>
                </div>
                <span className='text-xl font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{rule.percentual}%</span>
            </div>
        )
        if (rule.tipo === 'valor_fixo') return (
            <div className='flex items-center gap-2'>
                <span className='text-2xl font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{fmtCurrency(rule.valor)}</span>
                <span className='text-xs text-gray-400'>por ato{rule.label ? ` · ${rule.label}` : ''}</span>
            </div>
        )
        if (rule.tipo === 'faixa') return (
            <div className='space-y-1.5 w-full'>
                {(rule.faixas ?? []).map((f, i) => (
                    <div key={f.id ?? i} className='flex items-center gap-2 text-xs'>
                        <div className='flex-1 flex items-center gap-1.5'>
                            <div className={`h-2 rounded-full bg-violet-500 opacity-${40 + i * 20}`} style={{ width: `${30 + i * 20}px` }} />
                            <span className='text-gray-500 dark:text-gray-400 tabular-nums'>
                                {fmtCurrency(f.de)} {f.ate ? `até ${fmtCurrency(f.ate)}` : 'ou mais'}
                            </span>
                        </div>
                        <span className='font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{f.percentual}%</span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className='group flex items-start gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 hover:shadow-sm transition'>
            <div className='w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <Icon className='w-4 h-4 text-gray-400' />
            </div>
            <div className='flex-1 min-w-0'>
                <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5'>{rt.l}</p>
                {renderContent()}
                {rule.label && rule.tipo !== 'valor_fixo' && <p className='text-xs text-gray-400 mt-1 italic'>{rule.label}</p>}
            </div>
            <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
                <button onClick={() => onEdit(rule)} className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'>
                    <HiOutlinePencil className='w-3.5 h-3.5' />
                </button>
                <button onClick={() => onDelete(rule.id)} className='p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition'>
                    <HiOutlineTrash className='w-3.5 h-3.5' />
                </button>
            </div>
        </div>
    )
}

// ─── Rule Dialog ──────────────────────────────────────────────────────────────

const EMPTY_RULE = { tipo: 'geral', percentual: 40, categoria: 'Clínica Geral', valor: 50, label: '', faixas: [
    { id: genId(), de: 0, ate: 10000, percentual: 20 },
    { id: genId(), de: 10000, ate: 25000, percentual: 25 },
    { id: genId(), de: 25000, ate: null, percentual: 30 },
]}

const RuleDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm] = useState(EMPTY_RULE)
    useMemo(() => { if (isOpen) setForm(initial ? { ...EMPTY_RULE, ...initial } : EMPTY_RULE) }, [isOpen, initial])
    if (!isOpen) return null

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    const addFaixa = () => setForm(p => ({
        ...p,
        faixas: [...(p.faixas ?? []), { id: genId(), de: (p.faixas?.at(-1)?.ate ?? 0), ate: null, percentual: 0 }],
    }))
    const setFaixa = (id, k, v) => setForm(p => ({ ...p, faixas: p.faixas.map(f => f.id === id ? { ...f, [k]: v } : f) }))
    const removeFaixa = (id) => setForm(p => ({ ...p, faixas: p.faixas.filter(f => f.id !== id) }))

    const submit = () => {
        onSuccess({ id: initial?.id ?? genId(), ...form })
    }

    const accent = isEdit ? 'amber' : 'violet'
    const btnCls = isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineAdjustments className={`w-5 h-5 ${isEdit ? 'text-amber-600' : 'text-violet-600'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>{isEdit ? 'Editar Regra' : 'Nova Regra de Comissão'}</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Configure como o cálculo será feito</p>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'><HiOutlineX className='w-4 h-4' /></button>
                </div>

                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>
                    {/* Tipo */}
                    <Field label='Tipo de Regra'>
                        <div className='grid grid-cols-2 gap-2'>
                            {RULE_TYPES.map(rt => {
                                const Icon = rt.icon; const sel = form.tipo === rt.v
                                return (
                                    <button key={rt.v} type='button' onClick={() => set('tipo', rt.v)}
                                        className={['flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all',
                                            sel ? `border-${accent}-400 bg-${accent}-50 dark:bg-${accent}-900/20 dark:border-${accent}-600` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'].join(' ')}>
                                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sel ? `text-${accent}-600 dark:text-${accent}-400` : 'text-gray-400'}`} />
                                        <div>
                                            <p className={`text-xs font-semibold ${sel ? `text-${accent}-700 dark:text-${accent}-300` : 'text-gray-700 dark:text-gray-300'}`}>{rt.l}</p>
                                            <p className='text-xs text-gray-400 mt-0.5 leading-snug'>{rt.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    {/* Geral */}
                    {form.tipo === 'geral' && (
                        <>
                            <Field label='Percentual (%)'>
                                <div className='flex items-center gap-3'>
                                    <input type='range' min={1} max={100} value={form.percentual} onChange={e => set('percentual', Number(e.target.value))} className='flex-1 accent-violet-600' />
                                    <div className='w-20 relative'>
                                        <input type='number' min={1} max={100} value={form.percentual} onChange={e => set('percentual', Number(e.target.value))} className={`${inp(accent)} text-center pr-6`} />
                                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>%</span>
                                    </div>
                                </div>
                            </Field>
                            <Field label='Observação (opcional)'>
                                <input value={form.label} onChange={e => set('label', e.target.value)} placeholder='Ex: Demais procedimentos' className={inp(accent)} />
                            </Field>
                        </>
                    )}

                    {/* Por categoria */}
                    {form.tipo === 'por_categoria' && (
                        <div className='grid grid-cols-2 gap-3'>
                            <Field label='Especialidade'>
                                <select value={form.categoria} onChange={e => set('categoria', e.target.value)} className={inp(accent)}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label='Percentual (%)'>
                                <div className='relative'>
                                    <input type='number' min={1} max={100} value={form.percentual} onChange={e => set('percentual', Number(e.target.value))} className={`${inp(accent)} pr-6`} />
                                    <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400'>%</span>
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* Valor fixo */}
                    {form.tipo === 'valor_fixo' && (
                        <div className='grid grid-cols-2 gap-3'>
                            <Field label='Valor por Ato (R$)'>
                                <input type='number' min={0} step='0.01' value={form.valor} onChange={e => set('valor', Number(e.target.value))} className={inp(accent)} />
                            </Field>
                            <Field label='Descrição'>
                                <input value={form.label} onChange={e => set('label', e.target.value)} placeholder='Ex: por paciente convertido' className={inp(accent)} />
                            </Field>
                        </div>
                    )}

                    {/* Faixa */}
                    {form.tipo === 'faixa' && (
                        <Field label='Faixas de Meta'>
                            <div className='space-y-2'>
                                {(form.faixas ?? []).map((f, i) => (
                                    <div key={f.id} className='flex items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                                        <div className={`w-6 h-6 rounded-lg bg-violet-${400 + i * 100} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}
                                            style={{ backgroundColor: `hsl(${265 + i * 20}, 80%, ${60 - i * 8}%)` }}>
                                            {i + 1}
                                        </div>
                                        <div className='flex items-center gap-1.5 flex-1 text-xs'>
                                            <span className='text-gray-400 w-7'>De</span>
                                            <input type='number' value={f.de} onChange={e => setFaixa(f.id, 'de', Number(e.target.value))}
                                                className='w-20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-violet-400' />
                                            <span className='text-gray-400'>até</span>
                                            <input type='number' value={f.ate ?? ''} onChange={e => setFaixa(f.id, 'ate', e.target.value === '' ? null : Number(e.target.value))}
                                                placeholder='∞'
                                                className='w-20 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-violet-400' />
                                            <span className='text-gray-400'>=</span>
                                            <div className='relative w-16'>
                                                <input type='number' min={0} max={100} value={f.percentual} onChange={e => setFaixa(f.id, 'percentual', Number(e.target.value))}
                                                    className='w-full border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-1 focus:ring-violet-400 pr-5' />
                                                <span className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs'>%</span>
                                            </div>
                                        </div>
                                        {(form.faixas ?? []).length > 1 && (
                                            <button type='button' onClick={() => removeFaixa(f.id)} className='text-gray-300 hover:text-rose-400 transition flex-shrink-0'>
                                                <HiOutlineX className='w-3.5 h-3.5' />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type='button' onClick={addFaixa}
                                    className='w-full py-2 text-xs font-medium rounded-xl border border-dashed border-violet-300 dark:border-violet-700 text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition'>
                                    + Adicionar faixa
                                </button>
                            </div>
                        </Field>
                    )}
                </div>

                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition'>Cancelar</button>
                    <button onClick={submit} className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition shadow-sm ${btnCls}`}>
                        <HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Adicionar Regra'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Profile Dialog ───────────────────────────────────────────────────────────

const EMPTY_PROFILE = { name: '', description: '', color: 'violet', tipo: 'prestador', base: 'producao', isActive: true }

const ProfileDialog = ({ isOpen, onClose, onSuccess, initial }) => {
    const isEdit = !!initial
    const [form, setForm] = useState(EMPTY_PROFILE)
    const [errors, setErrors] = useState({})
    useMemo(() => { if (isOpen) { setErrors({}); setForm(initial ? { ...EMPTY_PROFILE, ...initial } : EMPTY_PROFILE) } }, [isOpen, initial])
    if (!isOpen) return null

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }
    const validate = () => { const e = {}; if (!form.name.trim()) e.name = 'Nome obrigatório'; return e }
    const submit = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        onSuccess({ id: initial?.id ?? genId(), rules: initial?.rules ?? [], ...form })
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineTemplate className={`w-5 h-5 ${isEdit ? 'text-amber-600' : 'text-violet-600'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>{isEdit ? 'Editar Perfil' : 'Novo Perfil de Comissionamento'}</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Defina as regras que serão aplicadas ao profissional</p>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'><HiOutlineX className='w-4 h-4' /></button>
                </div>
                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>
                    {/* Tipo profissional */}
                    <Field label='Tipo de Profissional'>
                        <div className='grid grid-cols-3 gap-2'>
                            {PROF_TYPES.map(pt => {
                                const Icon = pt.icon; const sel = form.tipo === pt.v
                                return (
                                    <button key={pt.v} type='button' onClick={() => set('tipo', pt.v)}
                                        className={['flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all',
                                            sel ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'].join(' ')}>
                                        <Icon className='w-4 h-4' />{pt.l}
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    <Field label='Nome do Perfil' error={errors.name} required>
                        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder='Ex: Dentista Associado' className={inp('violet', !!errors.name)} />
                    </Field>

                    <Field label='Descrição'>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder='Descreva quando usar este perfil…'
                            className='w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400 transition resize-none' />
                    </Field>

                    {/* Base de cálculo */}
                    <Field label='Base de Cálculo'>
                        <div className='grid grid-cols-2 gap-2'>
                            {BASES.map(b => {
                                const sel = form.base === b.v
                                return (
                                    <button key={b.v} type='button' onClick={() => set('base', b.v)}
                                        className={['flex flex-col gap-1 p-3 rounded-xl border text-left transition-all',
                                            sel ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'].join(' ')}>
                                        <span className={`text-sm font-semibold ${sel ? 'text-violet-700 dark:text-violet-300' : 'text-gray-700 dark:text-gray-200'}`}>{b.l}</span>
                                        <span className='text-xs text-gray-400 leading-snug'>{b.desc}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </Field>

                    {/* Cor */}
                    <Field label='Cor de identificação'>
                        <div className='flex flex-wrap gap-2'>
                            {PROFILE_COLORS.map(c => (
                                <button key={c.v} type='button' onClick={() => set('color', c.v)}
                                    className={[`w-8 h-8 rounded-xl ${c.bg} transition-all`,
                                        form.color === c.v ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'].join(' ')} />
                            ))}
                        </div>
                    </Field>

                    <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                        <div>
                            <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Perfil ativo</p>
                            <p className='text-xs text-gray-400'>Perfis inativos não podem ser atribuídos</p>
                        </div>
                        <button type='button' onClick={() => set('isActive', !form.isActive)}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${form.isActive ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 transition'>Cancelar</button>
                    <button onClick={submit} className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition shadow-sm ${isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'}`}>
                        <HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Criar Perfil'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Assignment Dialog ────────────────────────────────────────────────────────

const EMPTY_ASG = { profileId: '', profileName: '', nome: '', cargo: '', tipo: 'prestador', inicioVigencia: '', fimVigencia: '', isActive: true }

const maskDate = (v = '') => {
    const d = v.replace(/\D/g, '').slice(0, 8)
    return d.replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

const AssignmentDialog = ({ isOpen, onClose, onSuccess, initial, profiles }) => {
    const isEdit = !!initial
    const [form, setForm] = useState(EMPTY_ASG)
    const [errors, setErrors] = useState({})
    useMemo(() => {
        if (!isOpen) return
        setErrors({})
        setForm(initial ? { ...EMPTY_ASG, ...initial } : EMPTY_ASG)
    }, [isOpen, initial])
    if (!isOpen) return null

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })) }

    const selectProfile = (p) => {
        setForm(prev => ({ ...prev, profileId: p.id, profileName: p.name, tipo: p.tipo }))
        if (errors.profileId) setErrors(pr => ({ ...pr, profileId: '' }))
    }

    const validate = () => {
        const e = {}
        if (!form.profileId) e.profileId = 'Selecione um perfil'
        if (!form.nome.trim()) e.nome = 'Nome obrigatório'
        return e
    }

    const submit = () => {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return }
        onSuccess({ id: initial?.id ?? genId(), ...form })
    }

    const activeProfiles = profiles.filter(p => p.isActive)

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden'>
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineUserGroup className={`w-5 h-5 ${isEdit ? 'text-amber-600' : 'text-violet-600'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>{isEdit ? 'Editar Atribuição' : 'Atribuir Perfil'}</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Vincule um profissional a um perfil de comissionamento</p>
                    </div>
                    <button onClick={onClose} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'><HiOutlineX className='w-4 h-4' /></button>
                </div>
                <div className='px-6 py-5 space-y-4 overflow-y-auto max-h-[72vh]'>
                    {/* Seleção de perfil */}
                    <Field label='Perfil de Comissionamento' error={errors.profileId} required>
                        <div className='space-y-1.5'>
                            {activeProfiles.map(p => {
                                const col = profColor(p.color); const sel = form.profileId === p.id
                                return (
                                    <button key={p.id} type='button' onClick={() => selectProfile(p)}
                                        className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all',
                                            sel ? `${col.light} ${col.border}` : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'].join(' ')}>
                                        <div className={`w-8 h-8 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}>
                                            <HiOutlineTemplate className='w-4 h-4 text-white' />
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>{p.name}</p>
                                            <p className='text-xs text-gray-400 truncate'>{profType(p.tipo).l} · base: {baseLabel(p.base)}</p>
                                        </div>
                                        {sel && <HiOutlineCheckCircle className={`w-5 h-5 ${col.text} flex-shrink-0`} />}
                                    </button>
                                )
                            })}
                        </div>
                        {errors.profileId && <p className='text-xs text-rose-500 mt-1'>{errors.profileId}</p>}
                    </Field>

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Nome do Profissional' error={errors.nome} required>
                            <input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder='Nome completo' className={inp('violet', !!errors.nome)} />
                        </Field>
                        <Field label='Cargo / Especialidade'>
                            <input value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder='Ex: Ortodontista' className={inp()} />
                        </Field>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <Field label='Início de Vigência'>
                            <input value={form.inicioVigencia} onChange={e => set('inicioVigencia', maskDate(e.target.value))} placeholder='DD/MM/AAAA' className={inp()} />
                        </Field>
                        <Field label='Fim de Vigência' hint='Deixe em branco se não houver prazo'>
                            <input value={form.fimVigencia} onChange={e => set('fimVigencia', maskDate(e.target.value))} placeholder='DD/MM/AAAA' className={inp()} />
                        </Field>
                    </div>

                    <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                        <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>Atribuição ativa</p>
                        <button type='button' onClick={() => set('isActive', !form.isActive)}
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${form.isActive ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
                <div className='flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800'>
                    <button onClick={onClose} className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-50 transition'>Cancelar</button>
                    <button onClick={submit} className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition shadow-sm ${isEdit ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'}`}>
                        <HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar' : 'Atribuir'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Tab: Perfis ──────────────────────────────────────────────────────────────

const TabPerfis = ({ profiles, setProfiles }) => {
    const [selected, setSelected]       = useState(null)
    const [profileDlg, setProfileDlg]   = useState(false)
    const [editingP, setEditingP]       = useState(null)
    const [deletingP, setDeletingP]     = useState(null)
    const [confirmP, setConfirmP]       = useState(false)
    const [ruleDlg, setRuleDlg]         = useState(false)
    const [editingR, setEditingR]       = useState(null)

    const selProfile = useMemo(() => profiles.find(p => p.id === selected) ?? profiles[0] ?? null, [profiles, selected])

    const persist = (d) => { setProfiles(d); saveP(d) }

    const handleProfileSuccess = (p, isEdit) => {
        setProfileDlg(false)
        persist(isEdit ? profiles.map(x => x.id === p.id ? p : x) : [...profiles, p])
        toast.push(<Notification type='success' title={isEdit ? 'Perfil atualizado' : 'Perfil criado'} />, { placement: 'top-center' })
    }
    const handleDeleteProfile = () => {
        if (!deletingP) return
        persist(profiles.filter(p => p.id !== deletingP.id))
        if (selected === deletingP.id) setSelected(null)
        toast.push(<Notification type='success' title='Perfil removido' />, { placement: 'top-center' })
        setConfirmP(false); setDeletingP(null)
    }
    const handleRuleSuccess = (rule, isEdit) => {
        setRuleDlg(false)
        const updated = profiles.map(p => p.id !== selProfile.id ? p : {
            ...p, rules: isEdit ? p.rules.map(r => r.id === rule.id ? rule : r) : [...p.rules, rule],
        })
        persist(updated)
        toast.push(<Notification type='success' title={isEdit ? 'Regra atualizada' : 'Regra adicionada'} />, { placement: 'top-center' })
    }
    const handleDeleteRule = (ruleId) => {
        const updated = profiles.map(p => p.id !== selProfile.id ? p : { ...p, rules: p.rules.filter(r => r.id !== ruleId) })
        persist(updated)
        toast.push(<Notification type='success' title='Regra removida' />, { placement: 'top-center' })
    }

    return (
        <>
            <ProfileDialog isOpen={profileDlg} onClose={() => setProfileDlg(false)} onSuccess={handleProfileSuccess} initial={editingP} />
            <RuleDialog isOpen={ruleDlg} onClose={() => setRuleDlg(false)} onSuccess={(r) => handleRuleSuccess(r, !!editingR)} initial={editingR} />
            <ConfirmDialog isOpen={confirmP} type='danger' title='Excluir Perfil' onClose={() => setConfirmP(false)} onConfirm={handleDeleteProfile}>
                <p>Excluir <strong>{deletingP?.name}</strong> não remove atribuições existentes, mas elas ficarão sem perfil ativo.</p>
            </ConfirmDialog>

            <div className='flex gap-4 items-start'>
                {/* Sidebar */}
                <div className='w-64 flex-shrink-0'>
                    <Card className='border border-gray-100 dark:border-gray-700/50 p-2'>
                        <div className='flex items-center justify-between px-2 pb-2'>
                            <p className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Perfis · {profiles.length}</p>
                            <button onClick={() => { setEditingP(null); setProfileDlg(true) }}
                                className='flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition'>
                                <HiOutlinePlus className='w-3.5 h-3.5' />Novo
                            </button>
                        </div>
                        {profiles.length === 0
                            ? <EmptyState icon={<HiOutlineTemplate />} message='Nenhum perfil criado' sub='Crie o primeiro perfil de comissão' />
                            : (
                                <div className='space-y-0.5'>
                                    {profiles.map(p => {
                                        const col = profColor(p.color); const pt = profType(p.tipo)
                                        const Icon = pt.icon; const sel = selProfile?.id === p.id
                                        return (
                                            <div key={p.id} className='group relative'>
                                                <button onClick={() => setSelected(p.id)}
                                                    className={['w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all',
                                                        sel ? 'bg-gray-100 dark:bg-gray-800 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'].join(' ')}>
                                                    <div className={`w-8 h-8 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className='w-4 h-4 text-white' />
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>{p.name}</p>
                                                        <p className='text-xs text-gray-400 truncate'>{p.rules.length} regra{p.rules.length !== 1 ? 's' : ''}</p>
                                                    </div>
                                                    {!p.isActive && <span className='text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded'>inativo</span>}
                                                    {sel && <HiOutlineChevronRight className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />}
                                                </button>
                                                <div className='absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto'>
                                                    <button onClick={e => { e.stopPropagation(); setEditingP(p); setProfileDlg(true) }} className='p-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'><HiOutlinePencil className='w-3 h-3' /></button>
                                                    <button onClick={e => { e.stopPropagation(); setDeletingP(p); setConfirmP(true) }} className='p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition'><HiOutlineTrash className='w-3 h-3' /></button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        }
                    </Card>
                </div>

                {/* Detail */}
                <div className='flex-1 min-w-0'>
                    {selProfile ? (() => {
                        const col = profColor(selProfile.color)
                        const pt  = profType(selProfile.tipo)
                        const PIcon = pt.icon
                        return (
                            <Card className='border border-gray-100 dark:border-gray-700/50'>
                                {/* Profile header */}
                                <div className={`rounded-2xl p-4 mb-5 ${col.light} border ${col.border}`}>
                                    <div className='flex items-start justify-between gap-3'>
                                        <div className='flex items-center gap-3'>
                                            <div className={`w-10 h-10 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                                <PIcon className='w-5 h-5 text-white' />
                                            </div>
                                            <div>
                                                <div className='flex items-center gap-2'>
                                                    <h3 className='font-bold text-gray-800 dark:text-gray-100'>{selProfile.name}</h3>
                                                    {!selProfile.isActive && <span className='text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full'>inativo</span>}
                                                </div>
                                                <div className='flex items-center gap-2 mt-0.5'>
                                                    <span className={`text-xs font-medium ${col.text}`}>{pt.l}</span>
                                                    <span className='text-gray-300 dark:text-gray-600 text-xs'>·</span>
                                                    <span className='text-xs text-gray-400'>Base: {baseLabel(selProfile.base)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => { setEditingP(selProfile); setProfileDlg(true) }}
                                            className='p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:text-amber-500 transition text-xs'>
                                            <HiOutlinePencil className='w-4 h-4' />
                                        </button>
                                    </div>
                                    {selProfile.description && <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed'>{selProfile.description}</p>}
                                </div>

                                {/* Rules */}
                                <div className='flex items-center justify-between mb-3'>
                                    <h4 className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                                        Regras de Cálculo · {selProfile.rules.length}
                                    </h4>
                                    <button onClick={() => { setEditingR(null); setRuleDlg(true) }}
                                        className='flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition'>
                                        <HiOutlinePlus className='w-3.5 h-3.5' /> Adicionar Regra
                                    </button>
                                </div>

                                <div className='p-3 mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30'>
                                    <div className='flex items-start gap-2'>
                                        <HiOutlineInformationCircle className='w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5' />
                                        <p className='text-xs text-blue-700 dark:text-blue-300 leading-relaxed'>
                                            Regras de <strong>por especialidade</strong> têm prioridade sobre a regra <strong>geral</strong>. Em caso de múltiplas regras gerais, apenas a primeira é usada.
                                        </p>
                                    </div>
                                </div>

                                {selProfile.rules.length === 0
                                    ? <EmptyState icon={<HiOutlineAdjustments />} message='Nenhuma regra configurada' sub='Adicione pelo menos uma regra de cálculo'
                                        action={<button onClick={() => { setEditingR(null); setRuleDlg(true) }} className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition'><HiOutlinePlus className='w-4 h-4' />Adicionar regra</button>} />
                                    : (
                                        <div className='space-y-2'>
                                            {selProfile.rules.map(r => (
                                                <RuleCard key={r.id} rule={r} base={selProfile.base}
                                                    onEdit={(r) => { setEditingR(r); setRuleDlg(true) }}
                                                    onDelete={handleDeleteRule} />
                                            ))}
                                        </div>
                                    )
                                }
                            </Card>
                        )
                    })() : (
                        <Card className='border border-gray-100 dark:border-gray-700/50'>
                            <EmptyState icon={<HiOutlineTemplate />} message='Selecione um perfil' sub='Clique em um perfil ao lado para ver e editar suas regras' />
                        </Card>
                    )}
                </div>
            </div>
        </>
    )
}

// ─── Tab: Profissionais ───────────────────────────────────────────────────────

const TabProfissionais = ({ assignments, setAssignments, profiles }) => {
    const [dlg, setDlg]         = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleting, setDeleting] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const persist = (d) => { setAssignments(d); saveA(d) }

    const handleSuccess = (asg, isEdit) => {
        setDlg(false)
        persist(isEdit ? assignments.map(a => a.id === asg.id ? asg : a) : [...assignments, asg])
        toast.push(<Notification type='success' title={isEdit ? 'Atribuição atualizada' : 'Perfil atribuído'} />, { placement: 'top-center' })
    }
    const handleDelete = () => {
        if (!deleting) return
        persist(assignments.filter(a => a.id !== deleting.id))
        toast.push(<Notification type='success' title='Atribuição removida' />, { placement: 'top-center' })
        setConfirmOpen(false); setDeleting(null)
    }

    const byType = useMemo(() => {
        const g = { prestador: [], funcionario: [], comercial: [] }
        assignments.forEach(a => { const t = a.tipo ?? 'prestador'; if (!g[t]) g[t] = []; g[t].push(a) })
        return g
    }, [assignments])

    const AsgCard = ({ asg }) => {
        const col = profColor(profiles.find(p => p.id === asg.profileId)?.color ?? 'gray')
        const pt  = profType(asg.tipo)
        return (
            <div className='group flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-900 hover:shadow-sm transition'>
                <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className='text-xs font-bold text-white'>{asg.nome.split(' ').map(w => w[0]).slice(0,2).join('')}</span>
                </div>
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>{asg.nome}</p>
                        {!asg.isActive && <span className='text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full'>inativo</span>}
                    </div>
                    <p className='text-xs text-gray-400 truncate'>{asg.cargo || pt.l}</p>
                </div>
                <div className='hidden sm:flex items-center gap-1.5'>
                    <div className={`w-2 h-2 rounded-full ${col.bg}`} />
                    <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>{asg.profileName}</span>
                </div>
                {asg.inicioVigencia && (
                    <span className='hidden md:block text-xs text-gray-400 tabular-nums whitespace-nowrap'>desde {asg.inicioVigencia}</span>
                )}
                <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button onClick={() => { setEditing(asg); setDlg(true) }} className='p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-400 hover:text-amber-500 transition'><HiOutlinePencil className='w-3.5 h-3.5' /></button>
                    <button onClick={() => { setDeleting(asg); setConfirmOpen(true) }} className='p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition'><HiOutlineTrash className='w-3.5 h-3.5' /></button>
                </div>
            </div>
        )
    }

    return (
        <>
            <AssignmentDialog isOpen={dlg} onClose={() => setDlg(false)} onSuccess={(a) => handleSuccess(a, !!editing)} initial={editing} profiles={profiles} />
            <ConfirmDialog isOpen={confirmOpen} type='danger' title='Remover Atribuição' onClose={() => setConfirmOpen(false)} onConfirm={handleDelete}>
                <p>Remover a atribuição de <strong>{deleting?.nome}</strong>?</p>
            </ConfirmDialog>

            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center justify-between mb-5'>
                    <div>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Profissionais Comissionados</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{assignments.length} profissional{assignments.length !== 1 ? 'is' : ''} com perfil atribuído</p>
                    </div>
                    <button onClick={() => { setEditing(null); setDlg(true) }}
                        className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm'>
                        <HiOutlinePlus className='w-4 h-4' /> Atribuir Perfil
                    </button>
                </div>

                {assignments.length === 0
                    ? <EmptyState icon={<HiOutlineUserGroup />} message='Nenhum profissional atribuído' sub='Atribua perfis de comissão aos seus profissionais'
                        action={<button onClick={() => { setEditing(null); setDlg(true) }} className='flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition'><HiOutlinePlus className='w-4 h-4' />Atribuir</button>} />
                    : (
                        <div className='space-y-5'>
                            {PROF_TYPES.filter(pt => byType[pt.v]?.length > 0).map(pt => (
                                <div key={pt.v}>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <pt.icon className='w-4 h-4 text-gray-400' />
                                        <p className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>{pt.l} · {byType[pt.v].length}</p>
                                    </div>
                                    <div className='space-y-1.5'>
                                        {byType[pt.v].map(a => <AsgCard key={a.id} asg={a} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </Card>
        </>
    )
}

// ─── Tab: Simulador ───────────────────────────────────────────────────────────

const calcCommission = (profile, input) => {
    if (!profile || !input) return { total: 0, breakdown: [] }
    const breakdown = []
    let total = 0

    const byCategory = input.byCat ?? {}
    const globalAmount = input.total ?? 0

    if (profile.rules.some(r => r.tipo === 'por_categoria') && Object.keys(byCategory).length > 0) {
        const catRules = profile.rules.filter(r => r.tipo === 'por_categoria')
        const generalRule = profile.rules.find(r => r.tipo === 'geral')
        const usedCats = new Set()

        for (const [cat, amount] of Object.entries(byCategory)) {
            if (!amount || isNaN(Number(amount))) continue
            const amt = Number(amount)
            const rule = catRules.find(r => r.categoria === cat) ?? generalRule
            if (!rule) continue
            const commission = (amt * (rule.percentual ?? 0)) / 100
            total += commission
            usedCats.add(cat)
            breakdown.push({ label: cat, amount: amt, pct: rule.percentual, commission })
        }
    } else if (profile.rules.some(r => r.tipo === 'faixa')) {
        const rule = profile.rules.find(r => r.tipo === 'faixa')
        const faixas = rule?.faixas ?? []
        const match = faixas.filter(f => globalAmount >= f.de && (f.ate === null || globalAmount < f.ate))
        const faixa = match.at(-1)
        if (faixa) {
            const commission = (globalAmount * faixa.percentual) / 100
            total = commission
            breakdown.push({ label: `Faixa ${fmtCurrency(faixa.de)}${faixa.ate ? ` – ${fmtCurrency(faixa.ate)}` : '+'}`, amount: globalAmount, pct: faixa.percentual, commission })
        }
    } else if (profile.rules.some(r => r.tipo === 'geral')) {
        const rule = profile.rules.find(r => r.tipo === 'geral')
        const commission = (globalAmount * (rule.percentual ?? 0)) / 100
        total = commission
        breakdown.push({ label: 'Geral', amount: globalAmount, pct: rule.percentual, commission })
    } else if (profile.rules.some(r => r.tipo === 'valor_fixo')) {
        const rule = profile.rules.find(r => r.tipo === 'valor_fixo')
        const qty = input.qty ?? 1
        total = (rule.valor ?? 0) * qty
        breakdown.push({ label: rule.label || 'Por ato', amount: qty, pct: null, commission: total, isFixed: true, valor: rule.valor })
    }

    return { total, breakdown }
}

const TabSimulador = ({ profiles }) => {
    const [selectedId, setSelectedId] = useState(profiles[0]?.id ?? '')
    const [mode, setMode] = useState('global')
    const [globalVal, setGlobalVal] = useState('')
    const [catVals, setCatVals] = useState({})
    const [qty, setQty] = useState(1)

    const profile = useMemo(() => profiles.find(p => p.id === selectedId), [profiles, selectedId])
    const hasCatRules = profile?.rules.some(r => r.tipo === 'por_categoria')
    const hasFaixas   = profile?.rules.some(r => r.tipo === 'faixa')
    const hasFixed    = profile?.rules.some(r => r.tipo === 'valor_fixo')

    const result = useMemo(() => {
        if (!profile) return { total: 0, breakdown: [] }
        return calcCommission(profile, mode === 'category' ? { byCat: catVals } : { total: Number(globalVal) || 0, qty })
    }, [profile, mode, globalVal, catVals, qty])

    const clinicAmount = (Number(globalVal) || Object.values(catVals).reduce((s, v) => s + (Number(v) || 0), 0)) - result.total
    const totalProd = Number(globalVal) || Object.values(catVals).reduce((s, v) => s + (Number(v) || 0), 0)
    const commPct = totalProd > 0 ? Math.round((result.total / totalProd) * 100) : 0

    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Input panel */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                        <HiOutlineCalculator className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Simulador de Comissão</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Calcule quanto um profissional receberia em um cenário</p>
                    </div>
                </div>

                {/* Perfil */}
                <div className='space-y-4'>
                    <Field label='Perfil'>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                            className='w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-400/40'>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </Field>

                    {/* Mode toggle */}
                    {hasCatRules && (
                        <div className='flex gap-2'>
                            {[{ v: 'global', l: 'Total geral' }, { v: 'category', l: 'Por especialidade' }].map(({ v, l }) => (
                                <button key={v} type='button' onClick={() => setMode(v)}
                                    className={['flex-1 py-2 rounded-xl border text-xs font-medium transition-all', mode === v
                                        ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'].join(' ')}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Inputs */}
                    {hasFixed ? (
                        <Field label='Quantidade de atos realizados'>
                            <input type='number' min={1} value={qty} onChange={e => setQty(Number(e.target.value))} placeholder='0' className='w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400' />
                        </Field>
                    ) : mode === 'category' && hasCatRules ? (
                        <div className='space-y-2.5'>
                            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Produção por Especialidade (R$)</p>
                            {CATEGORIES.map(cat => (
                                <div key={cat} className='flex items-center gap-3'>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 w-32 flex-shrink-0 truncate'>{cat}</span>
                                    <input type='number' min={0} step='100' value={catVals[cat] ?? ''} onChange={e => setCatVals(p => ({ ...p, [cat]: e.target.value }))}
                                        placeholder='0' className='flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400' />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Field label={`Total de ${profile?.base === 'recebimento' ? 'Recebimento' : 'Produção'} (R$)`}>
                            <div className='relative'>
                                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400'>R$</span>
                                <input type='number' min={0} step='100' value={globalVal} onChange={e => setGlobalVal(e.target.value)}
                                    placeholder='0,00' className='w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 pl-9 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400' />
                            </div>
                        </Field>
                    )}
                </div>
            </Card>

            {/* Result panel */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                <div className='flex items-center gap-3 mb-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                        <HiOutlineChartBar className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <div>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100'>Resultado</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>{profile?.name ?? '—'}</p>
                    </div>
                </div>

                {totalProd === 0 ? (
                    <EmptyState icon={<HiOutlineCalculator />} message='Informe a produção para simular' sub='Preencha os valores ao lado para ver o cálculo' />
                ) : (
                    <div className='space-y-5'>
                        {/* Summary cards */}
                        <div className='grid grid-cols-3 gap-3'>
                            <div className='p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-center'>
                                <p className='text-xs text-gray-400 mb-1'>Produção</p>
                                <p className='text-base font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{fmtCurrency(totalProd)}</p>
                            </div>
                            <div className='p-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-center'>
                                <p className='text-xs text-violet-500 mb-1'>Comissão</p>
                                <p className='text-base font-bold text-violet-700 dark:text-violet-300 tabular-nums'>{fmtCurrency(result.total)}</p>
                            </div>
                            <div className='p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-center'>
                                <p className='text-xs text-emerald-500 mb-1'>Clínica</p>
                                <p className='text-base font-bold text-emerald-700 dark:text-emerald-300 tabular-nums'>{fmtCurrency(clinicAmount)}</p>
                            </div>
                        </div>

                        {/* Visual split bar */}
                        <div>
                            <div className='flex items-center justify-between text-xs text-gray-400 mb-1.5'>
                                <span>Profissional {commPct}%</span>
                                <span>Clínica {100 - commPct}%</span>
                            </div>
                            <div className='h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 overflow-hidden flex'>
                                <div className='h-full bg-violet-500 rounded-full transition-all duration-500' style={{ width: `${commPct}%` }} />
                            </div>
                        </div>

                        {/* Breakdown */}
                        {result.breakdown.length > 0 && (
                            <div>
                                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>Detalhamento</p>
                                <div className='space-y-2'>
                                    {result.breakdown.map((b, i) => (
                                        <div key={i} className='flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800'>
                                            <div className='flex items-center gap-2 min-w-0'>
                                                <div className='w-1.5 h-5 rounded-full bg-violet-400 flex-shrink-0' />
                                                <div className='min-w-0'>
                                                    <p className='text-xs font-medium text-gray-700 dark:text-gray-200 truncate'>{b.label}</p>
                                                    {!b.isFixed && <p className='text-xs text-gray-400'>{fmtCurrency(b.amount)} × {b.pct}%</p>}
                                                    {b.isFixed && <p className='text-xs text-gray-400'>{b.amount} ato{b.amount !== 1 ? 's' : ''} × {fmtCurrency(b.valor)}</p>}
                                                </div>
                                            </div>
                                            <span className='text-sm font-bold text-violet-600 dark:text-violet-400 tabular-nums flex-shrink-0'>{fmtCurrency(b.commission)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Faixa hint */}
                        {hasFaixas && (
                            <div className='p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30'>
                                <p className='text-xs text-blue-600 dark:text-blue-400 font-medium mb-1.5'>Todas as faixas deste perfil</p>
                                {profile.rules.find(r => r.tipo === 'faixa')?.faixas.map((f, i) => {
                                    const active = totalProd >= f.de && (f.ate === null || totalProd < f.ate)
                                    return (
                                        <div key={i} className={`flex justify-between text-xs px-2 py-1 rounded-lg mb-0.5 ${active ? 'bg-blue-100 dark:bg-blue-900/30 font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                            <span>{fmtCurrency(f.de)}{f.ate ? ` – ${fmtCurrency(f.ate)}` : '+'}</span>
                                            <span>{f.percentual}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const TABS = [
    { k: 'perfis',        l: 'Perfis',              icon: HiOutlineTemplate,    sub: 'Templates de regras' },
    { k: 'profissionais', l: 'Profissionais',        icon: HiOutlineUserGroup,   sub: 'Atribuições' },
    { k: 'simulador',     l: 'Simulador',            icon: HiOutlineCalculator,  sub: 'Calcule comissões' },
]

const ComissionamentoIndex = () => {
    const [profiles,    setProfiles]    = useState(loadP)
    const [assignments, setAssignments] = useState(loadA)
    const [tab, setTab] = useState('perfis')

    const stats = useMemo(() => ({
        profiles:    profiles.filter(p => p.isActive).length,
        prestadores: assignments.filter(a => a.tipo === 'prestador' && a.isActive).length,
        funcionarios: assignments.filter(a => a.tipo === 'funcionario' && a.isActive).length,
        comerciais:  assignments.filter(a => a.tipo === 'comercial' && a.isActive).length,
    }), [profiles, assignments])

    return (
        <div className='w-full p-4 space-y-4'>
            {/* Header */}
            <div className='flex items-start justify-between gap-3 flex-wrap'>
                <div>
                    <h2 className='text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2'>
                        <HiOutlineChartPie className='w-6 h-6 text-violet-500' />
                        Comissionamento
                    </h2>
                    <p className='text-sm text-gray-400 mt-0.5'>Configure perfis de comissão e atribua-os a seus profissionais</p>
                </div>
            </div>

            {/* Stats strip */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {[
                    { l: 'Perfis ativos',     v: stats.profiles,     color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    { l: 'Prestadores',       v: stats.prestadores,  color: 'text-blue-600 dark:text-blue-400',      bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { l: 'Funcionários',      v: stats.funcionarios, color: 'text-emerald-600 dark:text-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                    { l: 'Comercial/Capt.',   v: stats.comerciais,   color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(s => (
                    <Card key={s.l} className='border border-gray-100 dark:border-gray-700/50'>
                        <div className={`inline-flex px-2 py-1 rounded-lg ${s.bg} mb-1`}>
                            <span className={`text-xl font-bold tabular-nums ${s.color}`}>{s.v}</span>
                        </div>
                        <p className='text-xs text-gray-400'>{s.l}</p>
                    </Card>
                ))}
            </div>

            {/* Tab nav */}
            <Card className='border border-gray-100 dark:border-gray-700/50 p-1.5'>
                <div className='flex gap-1'>
                    {TABS.map(t => {
                        const Icon = t.icon; const sel = tab === t.k
                        return (
                            <button key={t.k} onClick={() => setTab(t.k)}
                                className={['flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center sm:flex-none', sel
                                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900/30'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'].join(' ')}>
                                <Icon className='w-4 h-4' />
                                <span className='hidden sm:block'>{t.l}</span>
                            </button>
                        )
                    })}
                </div>
            </Card>

            {/* Content */}
            {tab === 'perfis'        && <TabPerfis        profiles={profiles}    setProfiles={setProfiles} />}
            {tab === 'profissionais' && <TabProfissionais  assignments={assignments} setAssignments={setAssignments} profiles={profiles} />}
            {tab === 'simulador'     && <TabSimulador      profiles={profiles} />}
        </div>
    )
}

export default ComissionamentoIndex
