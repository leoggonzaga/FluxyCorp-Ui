import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
    HiOutlineChartBar,
    HiOutlineCash,
    HiOutlineTrendingUp,
    HiOutlineTrendingDown,
    HiOutlineDocumentText,
    HiOutlineExclamation,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineRefresh,
    HiOutlineCurrencyDollar,
    HiOutlineReceiptRefund,
} from 'react-icons/hi'
import { getFinancialDashboard } from '@/api/billing/billingService'

// ─── helpers ───────────────────────────────────────────────────────────────
const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtDate = (iso) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

const diffDays = (iso) => {
    if (!iso) return 0
    const today  = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(iso + 'T00:00:00')
    return Math.ceil((target - today) / 86400000)
}

const pctChange = (current, prev) => {
    if (!prev) return null
    return ((current - prev) / prev) * 100
}

// ─── KpiCard ───────────────────────────────────────────────────────────────
const KPI_COLORS = {
    emerald: {
        icon:  'text-emerald-500 dark:text-emerald-400',
        bar:   'from-emerald-400 via-emerald-200 to-transparent',
        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        value: 'text-emerald-700 dark:text-emerald-300',
    },
    rose: {
        icon:  'text-rose-500 dark:text-rose-400',
        bar:   'from-rose-400 via-rose-200 to-transparent',
        badge: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
        value: 'text-rose-700 dark:text-rose-300',
    },
    indigo: {
        icon:  'text-indigo-500 dark:text-indigo-400',
        bar:   'from-indigo-400 via-indigo-200 to-transparent',
        badge: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        value: 'text-indigo-700 dark:text-indigo-300',
    },
    violet: {
        icon:  'text-violet-500 dark:text-violet-400',
        bar:   'from-violet-400 via-violet-200 to-transparent',
        badge: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        value: 'text-violet-700 dark:text-violet-300',
    },
}

function KpiCard({ label, value, sub, positive, color, icon, loading }) {
    const c = KPI_COLORS[color]
    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm flex flex-col gap-3 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="w-5 h-5 rounded bg-gray-100 dark:bg-gray-700" />
                    <div className="w-16 h-4 rounded-full bg-gray-100 dark:bg-gray-700" />
                </div>
                <div>
                    <div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-700 mb-2" />
                    <div className="w-32 h-7 rounded bg-gray-100 dark:bg-gray-700" />
                </div>
                <div className="h-[1.5px] bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="w-28 h-3 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
        )
    }
    return (
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <span className={c.icon}>{icon}</span>
                {sub !== null && (
                    <span className={`flex items-center gap-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
                        {positive
                            ? <HiOutlineArrowUp className="w-2.5 h-2.5" />
                            : <HiOutlineArrowDown className="w-2.5 h-2.5" />}
                        {positive ? 'positivo' : 'negativo'}
                    </span>
                )}
            </div>
            <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold tabular-nums ${c.value}`}>{value}</p>
            </div>
            <div className={`h-[1.5px] bg-gradient-to-r ${c.bar}`} />
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub ?? 'Sem dados do mês anterior'}</p>
        </div>
    )
}

// ─── SkeletonRow ───────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="py-3 pr-4"><div className="w-16 h-3 rounded bg-gray-100 dark:bg-gray-700" /></td>
            <td className="py-3 pr-4"><div className="w-40 h-3 rounded bg-gray-100 dark:bg-gray-700" /></td>
            <td className="py-3 pr-4 hidden sm:table-cell"><div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-700" /></td>
            <td className="py-3 pr-4 hidden md:table-cell"><div className="w-16 h-3 rounded bg-gray-100 dark:bg-gray-700" /></td>
            <td className="py-3 text-right"><div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-700 ml-auto" /></td>
        </tr>
    )
}

// ─── EmptyState ────────────────────────────────────────────────────────────
const EmptyState = ({ icon, message, sub }) => (
    <div className="flex flex-col items-center justify-center py-8 gap-2.5 select-none">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
            <span className="text-2xl">{icon}</span>
        </div>
        <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
            {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
    </div>
)

// ─── Main ──────────────────────────────────────────────────────────────────
export default function CashFlowDashboard() {
    const companyPublicId = useSelector((s) => s.auth.user.companyPublicId)

    const [data,      setData]      = useState(null)
    const [loading,   setLoading]   = useState(true)
    const [txFilter,  setTxFilter]  = useState('todos')

    const load = useCallback(async () => {
        if (!companyPublicId) return
        setLoading(true)
        try {
            const res = await getFinancialDashboard(companyPublicId)
            setData(res)
        } finally {
            setLoading(false)
        }
    }, [companyPublicId])

    useEffect(() => { load() }, [load])

    // ── derived ─────────────────────────────────────────────────────────────
    const series = data?.monthlySeries ?? []
    const maxVal = useMemo(() =>
        Math.max(...series.flatMap(m => [m.receipts, m.expenses]), 1),
        [series]
    )

    const recPct  = data ? pctChange(data.receiptsThisMonth, data.prevMonthReceipts) : null
    const despPct = data ? pctChange(data.expensesThisMonth, data.prevMonthExpenses) : null

    const prevMonthLabel = useMemo(() => {
        const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const d = new Date()
        d.setMonth(d.getMonth() - 1)
        return `${labels[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`
    }, [])

    const transactions = data?.recentTransactions ?? []
    const filteredTx = useMemo(() => {
        if (txFilter === 'entradas') return transactions.filter(t => t.type === 'entrada')
        if (txFilter === 'saidas')   return transactions.filter(t => t.type === 'saida')
        return transactions
    }, [transactions, txFilter])

    const upcoming = data?.upcomingPayables ?? []

    // ── render ───────────────────────────────────────────────────────────────
    return (
        <div className="p-4 md:p-6 space-y-5">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dashboard Financeiro</h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        Visão geral · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <HiOutlineDocumentText className="w-4 h-4" />
                        Relatório
                    </button>
                </div>
            </div>

            {/* Alerta de vencidas */}
            {!loading && data && data.overduePayablesCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
                    <HiOutlineExclamation className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
                        <span className="font-semibold">{data.overduePayablesCount} conta{data.overduePayablesCount > 1 ? 's' : ''} a pagar vencida{data.overduePayablesCount > 1 ? 's' : ''}</span>
                        <span className="text-amber-500 dark:text-amber-400"> · Total de {fmt(data.overduePayablesTotal)} em aberto</span>
                    </p>
                    <a
                        href="/cash-flow/accounts-payable"
                        className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap"
                    >
                        Ver agora →
                    </a>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    loading={loading}
                    label="Receitas do Mês"
                    value={fmt(data?.receiptsThisMonth)}
                    sub={recPct !== null ? `${recPct > 0 ? '+' : ''}${recPct.toFixed(1)}% vs ${prevMonthLabel}` : null}
                    positive={recPct === null ? true : recPct >= 0}
                    color="emerald"
                    icon={<HiOutlineTrendingUp className="w-5 h-5" />}
                />
                <KpiCard
                    loading={loading}
                    label="Despesas do Mês"
                    value={fmt(data?.expensesThisMonth)}
                    sub={despPct !== null ? `${despPct > 0 ? '+' : ''}${despPct.toFixed(1)}% vs ${prevMonthLabel}` : null}
                    positive={despPct === null ? true : despPct <= 0}
                    color="rose"
                    icon={<HiOutlineTrendingDown className="w-5 h-5" />}
                />
                <KpiCard
                    loading={loading}
                    label="Resultado Líquido"
                    value={fmt(data?.netResultThisMonth)}
                    sub="Receitas menos despesas"
                    positive={(data?.netResultThisMonth ?? 0) >= 0}
                    color="indigo"
                    icon={<HiOutlineChartBar className="w-5 h-5" />}
                />
                <KpiCard
                    loading={loading}
                    label="Saldo em Caixa"
                    value={fmt(data?.currentCashBalance)}
                    sub="Última sessão de caixa"
                    positive={(data?.currentCashBalance ?? 0) >= 0}
                    color="violet"
                    icon={<HiOutlineCash className="w-5 h-5" />}
                />
            </div>

            {/* Chart + Upcoming */}
            <div className="grid lg:grid-cols-5 gap-4">

                {/* Bar chart */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Evolução Mensal</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
                                Receitas
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 inline-block" />
                                Despesas
                            </span>
                        </div>
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-indigo-400 via-indigo-200 to-transparent mb-5 -mx-5 px-5" />

                    {loading ? (
                        <div className="flex items-end gap-2 h-40 px-1 animate-pulse">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className="w-full flex items-end justify-center gap-0.5 h-32">
                                        <div className="w-[45%] rounded-t-md bg-gray-100 dark:bg-gray-700" style={{ height: `${40 + Math.random() * 50}%` }} />
                                        <div className="w-[45%] rounded-t-md bg-gray-100 dark:bg-gray-700" style={{ height: `${30 + Math.random() * 40}%` }} />
                                    </div>
                                    <div className="w-10 h-2 rounded bg-gray-100 dark:bg-gray-700" />
                                </div>
                            ))}
                        </div>
                    ) : series.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineChartBar />}
                            message="Sem dados de evolução mensal"
                            sub="Registre receitas e despesas para visualizar o gráfico"
                        />
                    ) : (
                        <div className="flex items-end gap-2 h-40 px-1">
                            {series.map((m, i) => {
                                const isLast = i === series.length - 1
                                const recH  = Math.round((m.receipts / maxVal) * 100)
                                const despH = Math.round((m.expenses / maxVal) * 100)
                                return (
                                    <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
                                        <div className="w-full flex items-end justify-center gap-0.5 h-32">
                                            <div
                                                className={`w-[45%] rounded-t-md transition-all duration-500 ${isLast ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}
                                                style={{ height: `${recH}%` }}
                                                title={`Receitas: ${fmt(m.receipts)}`}
                                            />
                                            <div
                                                className={`w-[45%] rounded-t-md transition-all duration-500 ${isLast ? 'bg-rose-500 dark:bg-rose-400' : 'bg-rose-100 dark:bg-rose-900/40'}`}
                                                style={{ height: `${despH}%` }}
                                                title={`Despesas: ${fmt(m.expenses)}`}
                                            />
                                        </div>
                                        <span className={`text-[9px] font-medium ${isLast ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                            {m.key}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {!loading && series.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">Maior receita</p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {fmt(Math.max(...series.map(m => m.receipts)))}
                                </p>
                                <p className="text-[9px] text-gray-400">{series.find(m => m.receipts === Math.max(...series.map(x => x.receipts)))?.key ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">Média de resultado</p>
                                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                                    {fmt(Math.round(series.reduce((a, m) => a + (m.receipts - m.expenses), 0) / series.length))}
                                </p>
                                <p className="text-[9px] text-gray-400">últimos 6 meses</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">Resultado atual</p>
                                <p className={`text-sm font-semibold tabular-nums ${(data?.netResultThisMonth ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                    {fmt(data?.netResultThisMonth)}
                                </p>
                                <p className="text-[9px] text-gray-400">este mês</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upcoming bills */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h2 className="font-semibold text-gray-800 dark:text-gray-100">Próximos Vencimentos</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Contas a pagar · 7 dias</p>
                        </div>
                        {!loading && upcoming.length > 0 && (
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full tabular-nums">
                                {fmt(upcoming.reduce((a, b) => a + b.amountPending, 0))}
                            </span>
                        )}
                    </div>
                    <div className="h-[2px] bg-gradient-to-r from-rose-400 via-rose-200 to-transparent mb-4 -mx-5 px-5" />

                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px]">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/20 animate-pulse">
                                    <div className="w-1 self-stretch rounded-full bg-gray-200 dark:bg-gray-600 shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="w-36 h-3 rounded bg-gray-200 dark:bg-gray-700" />
                                        <div className="w-20 h-2.5 rounded bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                    <div className="w-16 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                                </div>
                            ))
                        ) : upcoming.length === 0 ? (
                            <EmptyState
                                icon={<HiOutlineReceiptRefund />}
                                message="Nenhum vencimento nos próximos 7 dias"
                                sub="Contas a pagar em dia"
                            />
                        ) : (
                            upcoming.map((b) => {
                                const days   = diffDays(b.dueDate)
                                const urgent = days <= 0
                                const soon   = days > 0 && days <= 2
                                return (
                                    <div
                                        key={b.publicId}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                            urgent ? 'bg-rose-50 dark:bg-rose-900/20' :
                                            soon   ? 'bg-amber-50 dark:bg-amber-900/10' :
                                                     'bg-gray-50/80 dark:bg-gray-700/20'
                                        }`}
                                    >
                                        <div className={`w-1 self-stretch rounded-full shrink-0 ${
                                            urgent ? 'bg-rose-400' :
                                            soon   ? 'bg-amber-400' :
                                                     'bg-gray-200 dark:bg-gray-600'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{b.description}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                {b.categoryName && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                        {b.categoryName}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-gray-400">{fmtDate(b.dueDate)}</span>
                                                {b.status === 'vencido' && (
                                                    <span className="text-[10px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded-md">
                                                        Vencido
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`text-sm font-bold tabular-nums ${urgent ? 'text-rose-600 dark:text-rose-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {fmt(b.amountPending)}
                                            </p>
                                            <p className={`text-[10px] font-medium ${urgent ? 'text-rose-500' : soon ? 'text-amber-500' : 'text-gray-400'}`}>
                                                {days < 0 ? `${Math.abs(days)}d atraso` : days === 0 ? 'Hoje!' : days === 1 ? 'Amanhã' : `${days}d`}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <a
                        href="/cash-flow/accounts-payable"
                        className="mt-4 block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-3 border-t border-gray-100 dark:border-gray-700/50"
                    >
                        Ver todas as contas a pagar →
                    </a>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                    <div>
                        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Últimas Transações</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Recebimentos e pagamentos registrados</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-0.5 rounded-xl">
                        {[
                            { key: 'todos',    label: 'Todos' },
                            { key: 'entradas', label: 'Entradas' },
                            { key: 'saidas',   label: 'Saídas' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setTxFilter(f.key)}
                                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                                    txFilter === f.key
                                        ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[2px] bg-gradient-to-r from-violet-400 via-violet-200 to-transparent mb-4 -mx-5 px-5" />

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[11px] text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700/50">
                                <th className="pb-2.5 text-left font-medium pr-4">Data</th>
                                <th className="pb-2.5 text-left font-medium pr-4">Descrição</th>
                                <th className="pb-2.5 text-left font-medium pr-4 hidden sm:table-cell">Categoria</th>
                                <th className="pb-2.5 text-left font-medium pr-4 hidden md:table-cell">Forma</th>
                                <th className="pb-2.5 text-right font-medium">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/20">
                            {loading ? (
                                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                            ) : filteredTx.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState
                                            icon={<HiOutlineCurrencyDollar />}
                                            message="Nenhuma transação encontrada"
                                            sub="Registre recebimentos ou pagamentos para visualizar aqui"
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredTx.map((t) => (
                                    <tr key={t.publicId} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                                        <td className="py-3 pr-4 text-gray-400 dark:text-gray-500 whitespace-nowrap text-xs tabular-nums">
                                            {fmtDate(t.date)}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.type === 'entrada' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                <span className="text-gray-700 dark:text-gray-200 truncate max-w-[200px] group-hover:max-w-none">
                                                    {t.description}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 pr-4 hidden sm:table-cell">
                                            {t.category ? (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {t.category}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-400 dark:text-gray-500 text-xs hidden md:table-cell">
                                            {t.method ?? '—'}
                                        </td>
                                        <td className={`py-3 text-right font-bold tabular-nums text-sm ${t.type === 'entrada' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'entrada' ? '+' : '−'}{fmt(t.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredTx.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                        <p className="text-xs text-gray-400">{filteredTx.length} transaç{filteredTx.length === 1 ? 'ão' : 'ões'} exibida{filteredTx.length === 1 ? '' : 's'}</p>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400 text-xs">
                                Entradas: <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                    {fmt(filteredTx.filter(t => t.type === 'entrada').reduce((a, t) => a + t.amount, 0))}
                                </span>
                            </span>
                            <span className="text-gray-400 text-xs">
                                Saídas: <span className="font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                                    {fmt(filteredTx.filter(t => t.type === 'saida').reduce((a, t) => a + t.amount, 0))}
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
