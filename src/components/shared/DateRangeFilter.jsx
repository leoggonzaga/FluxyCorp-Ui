import { useState, useMemo, useEffect } from 'react'
import {
    HiOutlineCalendar,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineLightningBolt,
    HiOutlineAdjustments,
} from 'react-icons/hi'

// ─── helpers ─────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split('T')[0]

const addDays = (dateStr, n) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + n)
    return d.toISOString().split('T')[0]
}

const shiftMonth = (yyyymm, delta) => {
    const [y, m] = yyyymm.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const fmtMonth = (yyyymm) => {
    const [y, m] = yyyymm.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

const lastDayOf = (yyyymm) => {
    const [y, m] = yyyymm.split('-').map(Number)
    return new Date(y, m, 0).toISOString().split('T')[0]
}

const PRESETS = [
    { key: 'atrasadas', label: 'Atrasadas', icon: '🔴', tip: 'Vencimento no passado' },
    { key: 'hoje',      label: 'Hoje',      icon: '📅', tip: 'Vence hoje' },
    { key: '7dias',     label: '7 dias',    icon: '⚡', tip: 'Próximos 7 dias' },
    { key: 'mes',       label: 'Este mês',  icon: '📆', tip: 'Mês corrente completo' },
    { key: '30dias',    label: '30 dias',   icon: '🗓', tip: 'Próximos 30 dias' },
    { key: '90dias',    label: '90 dias',   icon: '📊', tip: 'Próximos 90 dias' },
    { key: 'todos',     label: 'Todos',     icon: '∞',  tip: 'Sem filtro de data' },
]

const computeRange = (mode, preset, mes, from, to) => {
    const today = todayISO()
    if (mode === 'atalhos') {
        switch (preset) {
            case 'atrasadas': return { from: '0000-01-01',              to: addDays(today, -1) }
            case 'hoje':      return { from: today,                     to: today }
            case '7dias':     return { from: today,                     to: addDays(today, 7) }
            case 'mes':       return { from: today.slice(0, 7) + '-01', to: lastDayOf(today.slice(0, 7)) }
            case '30dias':    return { from: today,                     to: addDays(today, 30) }
            case '90dias':    return { from: today,                     to: addDays(today, 90) }
            default:          return null
        }
    }
    if (mode === 'mes')     return { from: mes + '-01', to: lastDayOf(mes) }
    if (mode === 'periodo') return { from, to }
    return null
}

// ─── DateRangeFilter ─────────────────────────────────────────────────────────

/**
 * Filtro de data tri-modo reutilizável.
 *
 * Props:
 *   data          — array de itens para calcular contadores nos atalhos
 *   dateField     — campo de data nos itens (string yyyy-mm-dd, default: 'venc')
 *   label         — título exibido no cabeçalho
 *   defaultMode   — 'atalhos' | 'mes' | 'periodo'
 *   defaultPreset — preset inicial (key de PRESETS)
 *   onChange      — callback({ from, to } | null) — chamado sempre que o range muda
 *   onPageReset   — chamado em toda mudança de filtro (para resetar paginação)
 */
export default function DateRangeFilter({
    data = [],
    dateField = 'venc',
    label = 'Período de vencimento',
    defaultMode = 'atalhos',
    defaultPreset = 'mes',
    onChange,
    onPageReset,
}) {
    const today = todayISO()
    const currentMonth = today.slice(0, 7)

    const [mode, setMode]     = useState(defaultMode)
    const [preset, setPreset] = useState(defaultPreset)
    const [mes, setMes]       = useState(currentMonth)
    const [from, setFrom]     = useState(currentMonth + '-01')
    const [to, setTo]         = useState(lastDayOf(currentMonth))

    const range = useMemo(
        () => computeRange(mode, preset, mes, from, to),
        [mode, preset, mes, from, to],
    )

    useEffect(() => {
        onChange?.(range)
    }, [range]) // eslint-disable-line react-hooks/exhaustive-deps

    const notify = (fn) => {
        fn()
        onPageReset?.()
    }

    // contadores por preset
    const counts = useMemo(() => {
        const inRange = (v, a, b) => v && v >= a && v <= b
        return {
            atrasadas: data.filter(i => i[dateField] && i[dateField] < today).length,
            hoje:      data.filter(i => i[dateField] === today).length,
            '7dias':   data.filter(i => inRange(i[dateField], today, addDays(today, 7))).length,
            mes:       data.filter(i => i[dateField]?.slice(0, 7) === today.slice(0, 7)).length,
            '30dias':  data.filter(i => inRange(i[dateField], today, addDays(today, 30))).length,
            '90dias':  data.filter(i => inRange(i[dateField], today, addDays(today, 90))).length,
            todos:     data.length,
        }
    }, [data, dateField]) // eslint-disable-line react-hooks/exhaustive-deps

    const MODES = [
        { k: 'atalhos', l: 'Atalhos',  Icon: HiOutlineLightningBolt },
        { k: 'mes',     l: 'Por mês',  Icon: HiOutlineCalendar },
        { k: 'periodo', l: 'Período',  Icon: HiOutlineAdjustments },
    ]

    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    {label}
                </div>

                {/* Mode segmented control */}
                <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-xl">
                    {MODES.map(({ k, l, Icon }) => (
                        <button
                            key={k}
                            onClick={() => notify(() => setMode(k))}
                            className={[
                                'flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap',
                                mode === k
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                            ].join(' ')}
                        >
                            <Icon className="w-3 h-3" />
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Atalhos ── */}
            {mode === 'atalhos' && (
                <div className="px-4 py-3 flex flex-wrap gap-2">
                    {PRESETS.map(p => {
                        const count   = counts[p.key] ?? 0
                        const isSel   = preset === p.key
                        const isAlert = p.key === 'atrasadas' && count > 0

                        return (
                            <button
                                key={p.key}
                                title={p.tip}
                                onClick={() => notify(() => setPreset(p.key))}
                                className={[
                                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all select-none',
                                    isSel
                                        ? isAlert
                                            ? 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-200 dark:shadow-rose-900/30'
                                            : 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                        : isAlert
                                            ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:border-rose-400'
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-600 dark:hover:text-indigo-400',
                                ].join(' ')}
                            >
                                <span className="text-sm leading-none">{p.icon}</span>
                                <span>{p.label}</span>
                                <span className={[
                                    'ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none',
                                    isSel
                                        ? 'bg-white/25 text-white'
                                        : isAlert
                                            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                                ].join(' ')}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ── Por mês ── */}
            {mode === 'mes' && (
                <div className="px-4 py-3 flex items-center justify-between gap-3">
                    <button
                        onClick={() => notify(() => setMes(m => shiftMonth(m, -1)))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all font-medium"
                    >
                        <HiOutlineChevronLeft className="w-4 h-4" />
                        <span className="capitalize">{fmtMonth(shiftMonth(mes, -1))}</span>
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight capitalize">
                            {fmtMonth(mes)}
                        </span>
                        {mes !== currentMonth && (
                            <button
                                onClick={() => notify(() => setMes(currentMonth))}
                                className="text-[10px] text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition mt-0.5 font-medium"
                            >
                                voltar ao mês atual
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => notify(() => setMes(m => shiftMonth(m, +1)))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-all font-medium"
                    >
                        <span className="capitalize">{fmtMonth(shiftMonth(mes, +1))}</span>
                        <HiOutlineChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Período personalizado ── */}
            {mode === 'periodo' && (
                <div className="px-4 py-3 flex flex-wrap items-end gap-3">
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">De</p>
                        <input
                            type="date"
                            value={from}
                            onChange={e => notify(() => setFrom(e.target.value))}
                            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Até</p>
                        <input
                            type="date"
                            value={to}
                            onChange={e => notify(() => setTo(e.target.value))}
                            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                        />
                    </div>
                    {/* Atalhos rápidos de período */}
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {[
                            { l: 'Hoje',   fn: () => { setFrom(today); setTo(today) } },
                            { l: 'Semana', fn: () => { setFrom(today); setTo(addDays(today, 6)) } },
                            { l: 'Mês',    fn: () => { setFrom(today.slice(0, 7) + '-01'); setTo(lastDayOf(today.slice(0, 7))) } },
                        ].map(s => (
                            <button
                                key={s.l}
                                onClick={() => notify(s.fn)}
                                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                            >
                                {s.l}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
