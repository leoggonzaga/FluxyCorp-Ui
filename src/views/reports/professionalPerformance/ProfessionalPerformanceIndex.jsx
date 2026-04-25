import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
    HiOutlineChartBar,
    HiOutlineRefresh,
    HiOutlineUser,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineClipboardCheck,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineExclamation,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineInformationCircle,
    HiOutlineStar,
    HiOutlineClock,
    HiOutlineReceiptRefund,
    HiOutlineViewGrid,
    HiOutlineChartPie,
    HiOutlineDocumentReport,
    HiOutlineCheckCircle,
    HiOutlineX,
    HiOutlineSparkles,
    HiOutlineDatabase,
} from 'react-icons/hi'
import { enterpriseApiGetEmployees } from '@/api/enterprise/EnterpriseService'
import { reportsCreate, reportsGetById } from '@/api/reports/reportsService'

// ─── formatters ───────────────────────────────────────────────────────────────

const fmtBRL = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v ?? 0)
const fmtPct = (v) => `${(v ?? 0).toFixed(1)}%`
const fmtNum = (v) => new Intl.NumberFormat('pt-BR').format(v ?? 0)

// ─── mock data ────────────────────────────────────────────────────────────────

const PROCEDURES = [
    'Restauração', 'Canal Radicular', 'Extração', 'Implante', 'Profilaxia',
    'Coroa Cerâmica', 'Clareamento', 'Aparelho Ortodôntico', 'Prótese Total', 'Cirurgia',
]

const AVATAR_COLORS = [
    'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500',
]
const CHART_COLORS = [
    '#8b5cf6', '#0ea5e9', '#10b981', '#f43f5e',
    '#f59e0b', '#4f39f6', '#14b8a6', '#ec4899',
]

function avatarBg(idx) { return AVATAR_COLORS[idx % AVATAR_COLORS.length] }
function chartColor(idx) { return CHART_COLORS[idx % CHART_COLORS.length] }

function seededRandom(seed) {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff
        return (s >>> 0) / 0xffffffff
    }
}

// period → numeric multiplier for mock scale
function periodMultiplier(periodType, sub) {
    if (periodType === 'mes')       return 1
    if (periodType === 'trimestre') return 3
    if (periodType === 'semestre')  return 6
    return 12 // anual
}

function buildMockForPro(pro, idx, periodType, periodSub) {
    const rng = seededRandom(idx * 7919 + 12345 + (periodSub ?? 0) * 31)
    const mul = periodMultiplier(periodType, periodSub)

    const appointments   = Math.round((20 + rng() * 40) * mul)
    const production     = Math.round((8000 + rng() * 22000) * mul)
    const occupation     = 50 + rng() * 45
    const ticketMedio    = Math.round(production / appointments)
    const inadimplencia  = 2 + rng() * 18
    const meta           = Math.round(production * (0.65 + rng() * 0.65))
    const metaPct        = Math.min((production / meta) * 100, 150)
    const cancelRate     = 3 + rng() * 15
    const completionRate = 75 + rng() * 23

    const topProcedures = Array.from({ length: 3 }, (_, i) => {
        const pIdx = (idx * 3 + i) % PROCEDURES.length
        const qty  = Math.round((3 + rng() * 15) * mul)
        const rev  = Math.round(qty * (200 + rng() * 800))
        return { name: PROCEDURES[pIdx], qty, rev }
    }).sort((a, b) => b.rev - a.rev)

    const barCount = Math.min(Math.max(4 * mul, 4), 12)
    const weeks = Array.from({ length: barCount }, (_, w) => ({
        label: mul <= 1 ? `S${w + 1}` : mul <= 3 ? `S${w + 1}` : mul <= 6 ? `M${w + 1}` : `M${w + 1}`,
        value: Math.round((production / barCount) * (0.6 + rng() * 0.8)),
    }))

    return {
        publicId: pro.publicId, name: pro.fullName,
        appointments, production, occupation, ticketMedio,
        inadimplencia, meta, metaPct, cancelRate, completionRate,
        topProcedures, weeks,
    }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function MetricBadge({ value, good }) {
    if (good === null || good === undefined) return null
    return good
        ? <span className='flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'><HiOutlineTrendingUp className='w-3 h-3' />{value}</span>
        : <span className='flex items-center gap-0.5 text-[10px] font-semibold text-red-500 dark:text-red-400'><HiOutlineTrendingDown className='w-3 h-3' />{value}</span>
}

function MiniBar({ pct, color = 'bg-indigo-400' }) {
    return (
        <div className='w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden'>
            <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
    )
}

function RankBadge({ rank }) {
    if (rank === 1) return (
        <span className='flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white text-[10px] font-bold shadow-sm'>
            <HiOutlineStar className='w-3.5 h-3.5' />
        </span>
    )
    return (
        <span className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold'>
            {rank}
        </span>
    )
}

function WeeklyChart({ weeks }) {
    const max = Math.max(...weeks.map(w => w.value), 1)
    return (
        <div className='flex items-end gap-1 h-16'>
            {weeks.map((w, i) => (
                <div key={i} className='flex-1 flex flex-col items-center gap-1 min-w-0'>
                    <div
                        className='w-full rounded-t-md bg-indigo-200 dark:bg-indigo-800/60 transition-all duration-500 relative group'
                        style={{ height: `${Math.round((w.value / max) * 48)}px`, minHeight: 3 }}
                    >
                        <div className='absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10'>
                            {fmtBRL(w.value)}
                        </div>
                    </div>
                    <span className='text-[9px] text-gray-400 dark:text-gray-500 truncate w-full text-center'>{w.label}</span>
                </div>
            ))}
        </div>
    )
}

function DetailKpi({ icon, label, value, sub, accent }) {
    const colors = {
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        amber:   'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        red:     'text-red-500 bg-red-50 dark:bg-red-900/20',
        indigo:  'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        sky:     'text-sky-500 bg-sky-50 dark:bg-sky-900/20',
        violet:  'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
    }
    return (
        <div className='bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-3 flex flex-col gap-1.5'>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[accent] ?? colors.indigo}`}>{icon}</div>
            <p className='text-[10px] text-gray-400 dark:text-gray-500 leading-tight'>{label}</p>
            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums leading-tight'>{value}</p>
            <div>{sub}</div>
        </div>
    )
}

// ─── ProfessionalRow ─────────────────────────────────────────────────────────

function ProfessionalRow({ data, rank, idx, teamAvgProduction, maxProduction }) {
    const [expanded, setExpanded] = useState(false)

    const prodPct     = maxProduction > 0 ? (data.production / maxProduction) * 100 : 0
    const metaColor   = data.metaPct >= 100 ? 'bg-emerald-400' : data.metaPct >= 70 ? 'bg-amber-400' : 'bg-red-400'
    const occupColor  = data.occupation >= 80 ? 'bg-emerald-400' : data.occupation >= 60 ? 'bg-amber-400' : 'bg-red-400'
    const inadimColor = data.inadimplencia <= 5 ? 'text-emerald-600 dark:text-emerald-400' : data.inadimplencia <= 12 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'
    const vsTeam      = data.production - teamAvgProduction

    return (
        <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
            <button type='button' onClick={() => setExpanded(e => !e)}
                className='w-full text-left hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors'>
                <div className='flex items-center gap-3 px-4 py-4'>
                    <div className='flex items-center gap-2.5 flex-shrink-0 w-[140px] sm:w-[180px]'>
                        <RankBadge rank={rank} />
                        <div className={`w-9 h-9 rounded-full ${avatarBg(idx)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                            {initials(data.name)}
                        </div>
                        <span className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate'>
                            {data.name.split(' ')[0]}
                        </span>
                    </div>
                    <div className='flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 min-w-0'>
                        <div className='min-w-0'>
                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-0.5'>Produção</p>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{fmtBRL(data.production)}</p>
                            <MiniBar pct={prodPct} color='bg-indigo-400' />
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-0.5'>Atend.</p>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{data.appointments}</p>
                            <MiniBar pct={(data.appointments / 120) * 100} color='bg-sky-400' />
                        </div>
                        <div className='min-w-0 hidden sm:block'>
                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-0.5'>Ocupação</p>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{fmtPct(data.occupation)}</p>
                            <MiniBar pct={data.occupation} color={occupColor} />
                        </div>
                        <div className='min-w-0 hidden md:block'>
                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-0.5'>Ticket Médio</p>
                            <p className='text-sm font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{fmtBRL(data.ticketMedio)}</p>
                            <MiniBar pct={(data.ticketMedio / 2000) * 100} color='bg-violet-400' />
                        </div>
                        <div className='min-w-0 hidden md:block'>
                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-0.5'>Inadimpl.</p>
                            <p className={`text-sm font-bold tabular-nums ${inadimColor}`}>{fmtPct(data.inadimplencia)}</p>
                            <MiniBar pct={data.inadimplencia} color={data.inadimplencia <= 5 ? 'bg-emerald-400' : data.inadimplencia <= 12 ? 'bg-amber-400' : 'bg-red-400'} />
                        </div>
                    </div>
                    <div className='flex-shrink-0 ml-2'>
                        {expanded ? <HiOutlineChevronUp className='w-4 h-4 text-gray-400' /> : <HiOutlineChevronDown className='w-4 h-4 text-gray-400' />}
                    </div>
                </div>
            </button>

            {expanded && (
                <div className='border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/40 dark:bg-gray-800/20 px-4 py-4 space-y-4'>
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3'>
                        <DetailKpi icon={<HiOutlineCurrencyDollar className='w-4 h-4' />} label='Meta' value={fmtBRL(data.meta)}
                            sub={<MetricBadge value={`${fmtPct(data.metaPct)} da meta`} good={data.metaPct >= 100} />}
                            accent={data.metaPct >= 100 ? 'emerald' : data.metaPct >= 70 ? 'amber' : 'red'} />
                        <DetailKpi icon={<HiOutlineCalendar className='w-4 h-4' />} label='Ocupação' value={fmtPct(data.occupation)}
                            sub={<MetricBadge value={data.occupation >= 80 ? 'Ótimo' : data.occupation >= 60 ? 'Regular' : 'Baixo'} good={data.occupation >= 70} />}
                            accent={data.occupation >= 80 ? 'emerald' : data.occupation >= 60 ? 'amber' : 'red'} />
                        <DetailKpi icon={<HiOutlineStar className='w-4 h-4' />} label='Ticket Médio' value={fmtBRL(data.ticketMedio)}
                            sub={<MetricBadge value={vsTeam >= 0 ? `+${fmtBRL(vsTeam)} vs média` : `${fmtBRL(vsTeam)} vs média`} good={vsTeam >= 0} />}
                            accent='indigo' />
                        <DetailKpi icon={<HiOutlineReceiptRefund className='w-4 h-4' />} label='Inadimplência' value={fmtPct(data.inadimplencia)}
                            sub={<MetricBadge value={data.inadimplencia <= 5 ? 'Saudável' : data.inadimplencia <= 12 ? 'Atenção' : 'Crítico'} good={data.inadimplencia <= 8} />}
                            accent={data.inadimplencia <= 5 ? 'emerald' : data.inadimplencia <= 12 ? 'amber' : 'red'} />
                        <DetailKpi icon={<HiOutlineExclamation className='w-4 h-4' />} label='Cancelamentos' value={fmtPct(data.cancelRate)}
                            sub={<MetricBadge value={data.cancelRate <= 8 ? 'Normal' : 'Alto'} good={data.cancelRate <= 8} />}
                            accent={data.cancelRate <= 8 ? 'emerald' : 'amber'} />
                        <DetailKpi icon={<HiOutlineClipboardCheck className='w-4 h-4' />} label='Conclusão trat.' value={fmtPct(data.completionRate)}
                            sub={<MetricBadge value={data.completionRate >= 85 ? 'Excelente' : 'Melhorar'} good={data.completionRate >= 85} />}
                            accent={data.completionRate >= 85 ? 'emerald' : 'amber'} />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3'>Produção por período</p>
                            <WeeklyChart weeks={data.weeks} />
                        </div>
                        <div className='bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3'>Top procedimentos</p>
                            <div className='space-y-2.5'>
                                {data.topProcedures.map((p, i) => {
                                    const pct = (p.rev / data.topProcedures[0].rev) * 100
                                    const colors = ['bg-indigo-400', 'bg-sky-400', 'bg-violet-400']
                                    return (
                                        <div key={i}>
                                            <div className='flex items-center justify-between mb-1'>
                                                <span className='text-xs text-gray-600 dark:text-gray-300 font-medium truncate'>{p.name}</span>
                                                <div className='flex items-center gap-2 flex-shrink-0 ml-2'>
                                                    <span className='text-[10px] text-gray-400'>{p.qty}×</span>
                                                    <span className='text-xs font-semibold text-gray-700 dark:text-gray-200 tabular-nums'>{fmtBRL(p.rev)}</span>
                                                </div>
                                            </div>
                                            <MiniBar pct={pct} color={colors[i]} />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    <div className='bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 p-4'>
                        <div className='flex items-center justify-between mb-2'>
                            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400'>Atingimento de Meta</p>
                            <span className={`text-xs font-bold tabular-nums ${data.metaPct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : data.metaPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}`}>
                                {fmtBRL(data.production)} de {fmtBRL(data.meta)} ({fmtPct(data.metaPct)})
                            </span>
                        </div>
                        <div className='w-full h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden'>
                            <div className={`h-full rounded-full ${data.metaPct >= 100 ? 'bg-emerald-400' : data.metaPct >= 70 ? 'bg-amber-400' : 'bg-red-400'} transition-all duration-700`}
                                style={{ width: `${Math.min(data.metaPct, 100)}%` }} />
                        </div>
                        {data.metaPct < 100
                            ? <p className='text-[11px] text-gray-400 mt-1.5'>Faltam {fmtBRL(data.meta - data.production)} para atingir a meta</p>
                            : <p className='text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5'>Meta superada em {fmtBRL(data.production - data.meta)} 🎉</p>
                        }
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── TeamSummary ──────────────────────────────────────────────────────────────

function TeamSummary({ professionals }) {
    if (!professionals.length) return null
    const totalProd     = professionals.reduce((s, p) => s + p.production, 0)
    const totalAppts    = professionals.reduce((s, p) => s + p.appointments, 0)
    const avgOccupation = professionals.reduce((s, p) => s + p.occupation, 0) / professionals.length
    const avgTicket     = Math.round(totalProd / totalAppts)
    const avgInadim     = professionals.reduce((s, p) => s + p.inadimplencia, 0) / professionals.length

    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
            {[
                { label: 'Produção Total',      value: fmtBRL(totalProd),    icon: <HiOutlineCurrencyDollar className='w-5 h-5'/>, accent: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' },
                { label: 'Total Atendimentos',  value: fmtNum(totalAppts),   icon: <HiOutlineClipboardCheck className='w-5 h-5'/>, accent: 'bg-sky-50 dark:bg-sky-900/20 text-sky-500' },
                { label: 'Ocupação Média',      value: fmtPct(avgOccupation),icon: <HiOutlineCalendar className='w-5 h-5'/>,       accent: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' },
                { label: 'Ticket Médio Equipe', value: fmtBRL(avgTicket),    icon: <HiOutlineStar className='w-5 h-5'/>,           accent: 'bg-violet-50 dark:bg-violet-900/20 text-violet-500' },
                { label: 'Inadimpl. Média',     value: fmtPct(avgInadim),    icon: <HiOutlineReceiptRefund className='w-5 h-5'/>,   accent: avgInadim <= 8 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500' },
            ].map((k, i) => (
                <div key={i} className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 flex items-center gap-3'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${k.accent}`}>{k.icon}</div>
                    <div className='min-w-0'>
                        <p className='text-xs text-gray-400 dark:text-gray-500 leading-tight'>{k.label}</p>
                        <p className='text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums'>{k.value}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── PeriodSelector ───────────────────────────────────────────────────────────

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR]

function PeriodSelector({ periodType, periodSub, onTypeChange, onSubChange }) {
    const subOptions = useMemo(() => {
        if (periodType === 'mes')
            return MONTHS_PT.map((m, i) => ({ label: m, value: i }))
        if (periodType === 'trimestre')
            return [{ label: 'Q1', value: 0 }, { label: 'Q2', value: 1 }, { label: 'Q3', value: 2 }, { label: 'Q4', value: 3 }]
        if (periodType === 'semestre')
            return [{ label: '1º Sem', value: 0 }, { label: '2º Sem', value: 1 }]
        return [] // anual — só escolhe o ano
    }, [periodType])

    return (
        <div className='flex flex-col gap-2'>
            {/* tipo de período */}
            <div className='flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit'>
                {[
                    { key: 'mes',       label: 'Mês' },
                    { key: 'trimestre', label: 'Trimestre' },
                    { key: 'semestre',  label: 'Semestre' },
                    { key: 'anual',     label: 'Anual' },
                ].map(p => (
                    <button key={p.key} type='button' onClick={() => onTypeChange(p.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            periodType === p.key
                                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* sub-seletor + ano */}
            <div className='flex items-center gap-2 flex-wrap'>
                {subOptions.length > 0 && (
                    <div className='flex gap-1 flex-wrap'>
                        {subOptions.map(opt => (
                            <button key={opt.value} type='button' onClick={() => onSubChange(opt.value)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                                    periodSub === opt.value
                                        ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40'
                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
                <select
                    className='text-xs font-semibold px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 focus:outline-none focus:border-indigo-400'
                    defaultValue={CURRENT_YEAR}
                >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
        </div>
    )
}

// ─── ComparisonChart ──────────────────────────────────────────────────────────

function ComparisonChart({ title, icon, items, format, lowerIsBetter = false, accent = '#4f39f6' }) {
    const sorted = useMemo(() =>
        [...items].sort((a, b) => lowerIsBetter ? a.value - b.value : b.value - a.value),
        [items, lowerIsBetter]
    )
    const max = Math.max(...sorted.map(i => i.value), 1)
    const best = sorted[0]

    return (
        <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
            <div className='flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50'>
                <div className='w-7 h-7 rounded-lg flex items-center justify-center' style={{ backgroundColor: `${accent}18` }}>
                    <span style={{ color: accent }}>{icon}</span>
                </div>
                <h3 className='text-sm font-bold text-gray-700 dark:text-gray-200'>{title}</h3>
                {best && (
                    <span className='ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40 flex items-center gap-1'>
                        <HiOutlineStar className='w-3 h-3' /> {best.name.split(' ')[0]}
                    </span>
                )}
            </div>
            <div className='px-5 py-4 space-y-3'>
                {sorted.map((item, i) => {
                    const pct = (item.value / max) * 100
                    const isFirst = i === 0
                    return (
                        <div key={item.publicId} className='flex items-center gap-3'>
                            {/* avatar */}
                            <div className={`w-7 h-7 rounded-full ${avatarBg(item.idx)} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                                {initials(item.name)}
                            </div>
                            {/* name */}
                            <span className='text-xs font-medium text-gray-600 dark:text-gray-300 w-20 flex-shrink-0 truncate'>
                                {item.name.split(' ')[0]}
                            </span>
                            {/* bar */}
                            <div className='flex-1 h-5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden relative'>
                                <div
                                    className='h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2'
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: isFirst ? accent : item.color,
                                        opacity: isFirst ? 1 : 0.65 + (i / sorted.length) * 0.35,
                                        minWidth: 32,
                                    }}
                                >
                                    <span className='text-[9px] font-bold text-white/90 whitespace-nowrap'>{format(item.value)}</span>
                                </div>
                            </div>
                            {/* rank badge */}
                            <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 w-5 text-right flex-shrink-0'>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─── ComparativoTab ───────────────────────────────────────────────────────────

function ComparativoTab({ professionals, employees }) {
    const items = useMemo(() =>
        professionals.map((p, i) => {
            const empIdx = employees.findIndex(e => e.publicId === p.publicId)
            return {
                publicId: p.publicId,
                name:     p.name,
                idx:      empIdx >= 0 ? empIdx : i,
                color:    chartColor(empIdx >= 0 ? empIdx : i),
                production:   p.production,
                appointments: p.appointments,
                occupation:   p.occupation,
                ticketMedio:  p.ticketMedio,
                inadimplencia:p.inadimplencia,
                cancelRate:   p.cancelRate,
                completionRate: p.completionRate,
                metaPct:      p.metaPct,
            }
        }),
        [professionals, employees]
    )

    if (!items.length) return (
        <div className='py-12 flex flex-col items-center gap-3'>
            <HiOutlineUser className='w-10 h-10 text-gray-200 dark:text-gray-700' />
            <p className='text-sm text-gray-400'>Nenhum profissional para comparar</p>
        </div>
    )

    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <ComparisonChart
                    title='Produção Financeira'
                    icon={<HiOutlineCurrencyDollar className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.production }))}
                    format={fmtBRL}
                    accent='#4f39f6'
                />
                <ComparisonChart
                    title='Volume de Atendimentos'
                    icon={<HiOutlineClipboardCheck className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.appointments }))}
                    format={(v) => `${fmtNum(v)} atend.`}
                    accent='#0ea5e9'
                />
                <ComparisonChart
                    title='Taxa de Ocupação da Agenda'
                    icon={<HiOutlineCalendar className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.occupation }))}
                    format={fmtPct}
                    accent='#10b981'
                />
                <ComparisonChart
                    title='Ticket Médio por Atendimento'
                    icon={<HiOutlineStar className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.ticketMedio }))}
                    format={fmtBRL}
                    accent='#8b5cf6'
                />
                <ComparisonChart
                    title='Inadimplência'
                    icon={<HiOutlineReceiptRefund className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.inadimplencia }))}
                    format={fmtPct}
                    lowerIsBetter
                    accent='#f43f5e'
                />
                <ComparisonChart
                    title='Atingimento de Meta (%)'
                    icon={<HiOutlineTrendingUp className='w-4 h-4' />}
                    items={items.map(i => ({ ...i, value: i.metaPct }))}
                    format={fmtPct}
                    accent='#f59e0b'
                />
            </div>

            {/* radar-style summary grid */}
            <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
                <div className='px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50'>
                    <h3 className='text-sm font-bold text-gray-700 dark:text-gray-200'>Resumo Comparativo</h3>
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Todos os indicadores por profissional em uma visão</p>
                </div>
                <div className='overflow-x-auto'>
                    <table className='w-full text-xs'>
                        <thead>
                            <tr className='text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/40'>
                                <th className='text-left py-2.5 px-5 font-semibold'>Profissional</th>
                                <th className='text-right py-2.5 pr-4 font-semibold'>Produção</th>
                                <th className='text-right py-2.5 pr-4 font-semibold hidden sm:table-cell'>Atend.</th>
                                <th className='text-right py-2.5 pr-4 font-semibold hidden md:table-cell'>Ocupação</th>
                                <th className='text-right py-2.5 pr-4 font-semibold hidden md:table-cell'>Ticket Médio</th>
                                <th className='text-right py-2.5 pr-4 font-semibold hidden lg:table-cell'>Inadimpl.</th>
                                <th className='text-right py-2.5 pr-4 font-semibold hidden lg:table-cell'>Meta</th>
                                <th className='text-right py-2.5 pr-5 font-semibold'>Score</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-50 dark:divide-gray-700/40'>
                            {[...items]
                                .sort((a, b) => b.production - a.production)
                                .map((item, i) => {
                                    // simple score: avg of normalized metrics (0–100)
                                    const score = Math.round(
                                        (Math.min(item.metaPct, 100) * 0.30) +
                                        (item.occupation * 0.25) +
                                        ((1 - item.inadimplencia / 20) * 100 * 0.20) +
                                        (item.completionRate * 0.15) +
                                        ((1 - item.cancelRate / 20) * 100 * 0.10)
                                    )
                                    const scoreColor = score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
                                    return (
                                        <tr key={item.publicId} className='hover:bg-gray-50/50 dark:hover:bg-gray-700/20'>
                                            <td className='py-3 px-5'>
                                                <div className='flex items-center gap-2'>
                                                    <div className={`w-6 h-6 rounded-full ${avatarBg(item.idx)} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                                                        {initials(item.name)}
                                                    </div>
                                                    <span className='font-medium text-gray-700 dark:text-gray-200'>{item.name.split(' ').slice(0, 2).join(' ')}</span>
                                                    {i === 0 && <span className='text-[10px]'>🥇</span>}
                                                </div>
                                            </td>
                                            <td className='py-3 pr-4 text-right font-semibold text-gray-700 dark:text-gray-200 tabular-nums'>{fmtBRL(item.production)}</td>
                                            <td className='py-3 pr-4 text-right text-gray-500 dark:text-gray-400 tabular-nums hidden sm:table-cell'>{item.appointments}</td>
                                            <td className='py-3 pr-4 text-right text-gray-500 dark:text-gray-400 tabular-nums hidden md:table-cell'>{fmtPct(item.occupation)}</td>
                                            <td className='py-3 pr-4 text-right text-gray-500 dark:text-gray-400 tabular-nums hidden md:table-cell'>{fmtBRL(item.ticketMedio)}</td>
                                            <td className='py-3 pr-4 text-right hidden lg:table-cell'>
                                                <span className={item.inadimplencia <= 5 ? 'text-emerald-600 dark:text-emerald-400' : item.inadimplencia <= 12 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}>
                                                    {fmtPct(item.inadimplencia)}
                                                </span>
                                            </td>
                                            <td className='py-3 pr-4 text-right hidden lg:table-cell'>
                                                <span className={item.metaPct >= 100 ? 'text-emerald-600 dark:text-emerald-400' : item.metaPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}>
                                                    {fmtPct(item.metaPct)}
                                                </span>
                                            </td>
                                            <td className='py-3 pr-5 text-right'>
                                                <span className={`text-sm font-bold tabular-nums ${scoreColor}`}>{score}</span>
                                                <span className='text-[10px] text-gray-400 dark:text-gray-500'>/100</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

// ─── Real data mapper ────────────────────────────────────────────────────────

function mapRealToPro(item) {
    return {
        publicId: item.professional_public_id,
        name:     item.professional_name,
        appointments:   item.appointments_total   ?? 0,
        production:     item.production_value     ?? 0,
        occupation:     item.occupation_rate      ?? 0,
        ticketMedio:    item.avg_ticket           ?? 0,
        inadimplencia:  item.default_rate         ?? 0,
        meta:           item.meta_value           ?? 0,
        metaPct:        item.meta_achievement_pct ?? 0,
        cancelRate:     item.cancel_rate          ?? 0,
        completionRate: 0,
        topProcedures: (item.top_procedures ?? []).map(p => ({
            name: p.name, qty: p.qty, rev: p.revenue ?? 0,
        })),
        weeks: (item.period_breakdown ?? []).map(b => ({
            label: b.label, value: b.appointments ?? 0,
        })),
    }
}

// ─── GenerateReportModal ──────────────────────────────────────────────────────

const MONTHS_FULL = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const _CY = new Date().getFullYear()
const YEAR_OPTS = [_CY - 2, _CY - 1, _CY]

function GenerateReportModal({ open, onClose, onDataReady }) {
    const [month,  setMonth]  = useState(new Date().getMonth() + 1)
    const [year,   setYear]   = useState(_CY)
    const [phase,  setPhase]  = useState('idle')   // idle | generating | polling | done | error
    const [reportId, setReportId] = useState(null)
    const [errMsg,   setErrMsg]   = useState('')
    const pollRef = useRef(null)

    const stopPolling = useCallback(() => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }, [])

    // cleanup on unmount
    useEffect(() => () => stopPolling(), [stopPolling])

    const handleClose = useCallback(() => {
        stopPolling()
        setPhase('idle')
        setReportId(null)
        setErrMsg('')
        onClose()
    }, [onClose, stopPolling])

    const handleGenerate = async () => {
        setPhase('generating')
        setErrMsg('')
        try {
            const res = await reportsCreate({
                report_type:  'professional_performance',
                period_month: month,
                period_year:  year,
            })
            if (!res?.report_id) throw new Error('Resposta inválida da API de relatórios.')
            setReportId(res.report_id)
            setPhase('polling')
            pollRef.current = setInterval(async () => {
                const poll = await reportsGetById(res.report_id)
                if (!poll) return
                if (poll.status === 'ready') {
                    stopPolling()
                    setPhase('done')
                    onDataReady(poll.data ?? [])
                    setTimeout(handleClose, 1800)
                } else if (poll.status === 'failed') {
                    stopPolling()
                    setPhase('error')
                    setErrMsg(poll.error_message || 'O processamento falhou.')
                }
            }, 2000)
        } catch (e) {
            setPhase('error')
            setErrMsg(e?.message || 'Erro ao solicitar relatório.')
        }
    }

    if (!open) return null

    const isProcessing = phase === 'generating' || phase === 'polling'

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            {/* backdrop */}
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={!isProcessing ? handleClose : undefined} />

            <div className='relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden'>
                {/* header */}
                <div className='flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className='w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineDocumentReport className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <h2 className='text-sm font-bold text-gray-800 dark:text-gray-100'>Gerar Relatório Real</h2>
                        <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Consulta as APIs e consolida os dados no banco</p>
                    </div>
                    {!isProcessing && (
                        <button onClick={handleClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'>
                            <HiOutlineX className='w-5 h-5' />
                        </button>
                    )}
                </div>

                <div className='px-5 py-5 space-y-5'>
                    {/* ── idle / done ── */}
                    {(phase === 'idle' || phase === 'done') && (
                        <>
                            {phase === 'done' && (
                                <div className='flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30'>
                                    <HiOutlineCheckCircle className='w-5 h-5 text-emerald-500 flex-shrink-0' />
                                    <p className='text-sm font-medium text-emerald-700 dark:text-emerald-400'>Relatório pronto! Carregando dados reais…</p>
                                </div>
                            )}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Mês</label>
                                    <select
                                        value={month}
                                        onChange={e => setMonth(Number(e.target.value))}
                                        className='w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-violet-400'
                                    >
                                        {MONTHS_FULL.map((m, i) => (
                                            <option key={i} value={i + 1}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Ano</label>
                                    <select
                                        value={year}
                                        onChange={e => setYear(Number(e.target.value))}
                                        className='w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-violet-400'
                                    >
                                        {YEAR_OPTS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className='flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50'>
                                <HiOutlineDatabase className='w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5' />
                                <p className='text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed'>
                                    O serviço irá consultar a API de <strong>profissionais</strong> e <strong>agendamentos</strong> do período selecionado, consolidar os dados e armazenar no banco de relatórios.
                                </p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={phase === 'done'}
                                className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold transition-colors disabled:opacity-50'
                            >
                                <HiOutlineSparkles className='w-4 h-4' />
                                Gerar Relatório
                            </button>
                        </>
                    )}

                    {/* ── processing ── */}
                    {isProcessing && (
                        <div className='py-4 flex flex-col items-center gap-5'>
                            <div className='relative'>
                                <div className='w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center'>
                                    <HiOutlineDocumentReport className='w-8 h-8 text-violet-500' />
                                </div>
                                <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center'>
                                    <div className='w-3.5 h-3.5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin' />
                                </div>
                            </div>
                            <div className='text-center space-y-1'>
                                <p className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
                                    {phase === 'generating' ? 'Solicitando relatório…' : 'Consolidando dados das APIs…'}
                                </p>
                                <p className='text-[11px] text-gray-400 dark:text-gray-500'>
                                    {phase === 'generating' ? 'Aguarde um momento' : 'Verificando status a cada 2 segundos'}
                                </p>
                            </div>
                            {reportId && (
                                <div className='w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700'>
                                    <p className='text-[10px] text-gray-400 dark:text-gray-500 mb-1'>ID do Pedido</p>
                                    <p className='text-[11px] font-mono text-gray-600 dark:text-gray-300 break-all'>{reportId}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── error ── */}
                    {phase === 'error' && (
                        <div className='space-y-4'>
                            <div className='flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30'>
                                <HiOutlineExclamation className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-sm font-medium text-red-700 dark:text-red-400'>Falha ao gerar relatório</p>
                                    <p className='text-[11px] text-red-500 dark:text-red-500 mt-0.5'>{errMsg}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPhase('idle')}
                                className='w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { key: 'production',    label: 'Produção' },
    { key: 'appointments',  label: 'Atendimentos' },
    { key: 'occupation',    label: 'Ocupação' },
    { key: 'ticketMedio',   label: 'Ticket Médio' },
    { key: 'inadimplencia', label: 'Inadimplência ↑' },
]

export default function ProfessionalPerformanceIndex() {
    const [employees,  setEmployees]  = useState([])
    const [loading,    setLoading]    = useState(true)
    const [activeTab,  setActiveTab]  = useState('profissionais')
    const [showModal,  setShowModal]  = useState(false)
    const [realData,   setRealData]   = useState(null)   // null = mock, array = API data

    // period state (used by both tabs via shared state)
    const [periodType, setPeriodType] = useState('mes')
    const [periodSub,  setPeriodSub]  = useState(new Date().getMonth()) // default = current month

    const [sortBy, setSortBy] = useState('production')

    const loadEmployees = async () => {
        setLoading(true)
        try {
            const res = await enterpriseApiGetEmployees()
            const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
            setEmployees(list)
        } catch {
            setEmployees([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadEmployees() }, [])

    // when period type changes, reset sub
    const handleTypeChange = (type) => {
        setPeriodType(type)
        if (type === 'mes')       setPeriodSub(new Date().getMonth())
        if (type === 'trimestre') setPeriodSub(Math.floor(new Date().getMonth() / 3))
        if (type === 'semestre')  setPeriodSub(new Date().getMonth() < 6 ? 0 : 1)
        if (type === 'anual')     setPeriodSub(0)
    }

    const professionals = useMemo(() =>
        realData
            ? realData.map(mapRealToPro)
            : employees.map((emp, i) => buildMockForPro(emp, i, periodType, periodSub)),
        [realData, employees, periodType, periodSub]
    )

    const sorted = useMemo(() => {
        const s = [...professionals]
        if (sortBy === 'inadimplencia') return s.sort((a, b) => b.inadimplencia - a.inadimplencia)
        return s.sort((a, b) => b[sortBy] - a[sortBy])
    }, [professionals, sortBy])

    const teamAvgProduction = useMemo(() =>
        professionals.length ? professionals.reduce((s, p) => s + p.production, 0) / professionals.length : 0,
        [professionals]
    )
    const maxProduction = useMemo(() =>
        professionals.length ? Math.max(...professionals.map(p => p.production)) : 1,
        [professionals]
    )

    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    const TABS = [
        { key: 'profissionais', label: 'Profissionais',  icon: <HiOutlineViewGrid className='w-4 h-4' /> },
        { key: 'comparativo',   label: 'Comparativo',    icon: <HiOutlineChartBar className='w-4 h-4' /> },
    ]

    return (
        <>
        <div className='p-4 md:p-6 space-y-5'>

            {/* ── Header ── */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                <div className='flex items-start gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center flex-shrink-0'>
                        <HiOutlineChartPie className='w-5 h-5 text-indigo-500' />
                    </div>
                    <div>
                        <h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>Performance Profissional</h1>
                        <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>
                            Produção, ocupação, ticket médio e inadimplência por dentista
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                    <span className='hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
                        <HiOutlineClock className='w-3.5 h-3.5' />{now}
                    </span>
                    <button onClick={loadEmployees} disabled={loading}
                        className='flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40'>
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className='hidden sm:inline'>Atualizar</span>
                    </button>
                    <button onClick={() => setShowModal(true)}
                        className='flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors shadow-sm'>
                        <HiOutlineDocumentReport className='w-4 h-4' />
                        <span className='hidden sm:inline'>Gerar Relatório</span>
                    </button>
                </div>
            </div>

            {/* ── Banner ── */}
            {realData ? (
                <div className='flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30'>
                    <HiOutlineCheckCircle className='w-4 h-4 text-emerald-500 flex-shrink-0' />
                    <p className='text-xs text-emerald-700 dark:text-emerald-400 flex-1'>
                        <strong>Dados reais carregados</strong> — relatório consolidado pelo serviço de relatórios.
                    </p>
                    <button onClick={() => setRealData(null)}
                        className='text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0'>
                        Voltar ao demo
                    </button>
                </div>
            ) : (
                <div className='flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30'>
                    <HiOutlineInformationCircle className='w-4 h-4 text-amber-500 flex-shrink-0' />
                    <p className='text-xs text-amber-700 dark:text-amber-400'>
                        <strong>Modo demonstração</strong> — profissionais carregados da API. Métricas financeiras são simuladas. Clique em <strong>Gerar Relatório</strong> para carregar dados reais.
                    </p>
                </div>
            )}

            {/* ── Tabs + Period Selector ── */}
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 flex-wrap'>
                <div className='flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit self-start'>
                    {TABS.map(t => (
                        <button key={t.key} type='button' onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === t.key
                                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}>
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>
                <PeriodSelector
                    periodType={periodType}
                    periodSub={periodSub}
                    onTypeChange={handleTypeChange}
                    onSubChange={setPeriodSub}
                />
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className='space-y-3'>
                    {[1, 2, 3].map(i => (
                        <div key={i} className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 animate-pulse'>
                            <div className='flex items-center gap-3'>
                                <div className='w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700' />
                                <div className='flex-1 grid grid-cols-4 gap-4'>
                                    {[1, 2, 3, 4].map(j => (
                                        <div key={j}>
                                            <div className='h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700 mb-1.5' />
                                            <div className='h-4 w-20 rounded bg-gray-200 dark:bg-gray-700' />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── No employees ── */}
            {!loading && professionals.length === 0 && (
                <div className='bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 py-12 flex flex-col items-center gap-3'>
                    <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                        <HiOutlineUser className='w-7 h-7 text-gray-300 dark:text-gray-600' />
                    </div>
                    <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Nenhum profissional encontrado</p>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>Cadastre profissionais em Equipe → Funcionários</p>
                </div>
            )}

            {/* ── Tab: Profissionais ── */}
            {!loading && professionals.length > 0 && activeTab === 'profissionais' && (
                <div className='space-y-5'>
                    {/* sort options */}
                    <div className='flex items-center gap-2 flex-wrap'>
                        <span className='text-xs text-gray-400 dark:text-gray-500 flex-shrink-0'>Ordenar por</span>
                        <div className='flex gap-1 flex-wrap'>
                            {SORT_OPTIONS.map(s => (
                                <button key={s.key} type='button' onClick={() => setSortBy(s.key)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                                        sortBy === s.key
                                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/40'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* team summary */}
                    <TeamSummary professionals={professionals} />

                    {/* column headers */}
                    <div className='hidden md:flex items-center gap-3 px-4 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold'>
                        <div className='w-[180px]'>Profissional</div>
                        <div className='flex-1 grid grid-cols-5 gap-3'>
                            <span>Produção</span><span>Atendimentos</span><span>Ocupação</span><span>Ticket Médio</span><span>Inadimpl.</span>
                        </div>
                        <div className='w-4' />
                    </div>

                    <div className='space-y-3'>
                        {sorted.map((pro, i) => (
                            <ProfessionalRow
                                key={`${pro.publicId}-${periodType}-${periodSub}-${sortBy}`}
                                data={pro}
                                rank={i + 1}
                                idx={employees.findIndex(e => e.publicId === pro.publicId)}
                                teamAvgProduction={teamAvgProduction}
                                maxProduction={maxProduction}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tab: Comparativo ── */}
            {!loading && professionals.length > 0 && activeTab === 'comparativo' && (
                <ComparativoTab professionals={professionals} employees={employees} />
            )}

        </div>

        <GenerateReportModal
            open={showModal}
            onClose={() => setShowModal(false)}
            onDataReady={(data) => { setRealData(data); setShowModal(false) }}
        />
        </>
    )
}
