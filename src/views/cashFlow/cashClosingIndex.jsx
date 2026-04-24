import { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
    HiOutlineCalendar,
    HiOutlineCheckCircle,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlineLockClosed,
    HiOutlineMinus,
    HiOutlinePlus,
    HiOutlineCurrencyDollar,
    HiOutlineUser,
    HiOutlineX,
    HiOutlineDocumentText,
    HiOutlineArrowUp,
    HiOutlineArrowDown,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineLockOpen,
} from 'react-icons/hi'
import { Notification, toast } from '@/components/ui'
import CreateButton from '@/components/ui/Button/CreateButton'
import {
    getCashSessions,
    getCashSessionDetail,
    openCashSession,
    closeCashSession,
    addCashMovement,
    deleteCashMovement,
    reopenCashSession,
} from '@/api/billing/billingService'

// ─── Configs ──────────────────────────────────────────────────────────────────

const FORMAS = {
    dinheiro:      { label: 'Dinheiro',      accent: '#10b981', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    pix:           { label: 'PIX',           accent: '#06b6d4', pill: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    debito:        { label: 'Débito',        accent: '#6366f1', pill: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    credito:       { label: 'Crédito',       accent: '#8b5cf6', pill: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
    cartao:        { label: 'Cartão',        accent: '#a855f7', pill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    transferencia: { label: 'Transferência', accent: '#3b82f6', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    boleto:        { label: 'Boleto',        accent: '#64748b', pill: 'bg-slate-100 text-slate-600 dark:bg-slate-800/30 dark:text-slate-400' },
    cheque:        { label: 'Cheque',        accent: '#78716c', pill: 'bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400' },
    outro:         { label: 'Outro',         accent: '#9ca3af', pill: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

const STATUS_CFG = {
    aberto:  { label: 'Aberto',  pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',       dot: 'bg-amber-400 animate-pulse' },
    fechado: { label: 'Fechado', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
}

const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtShort = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const fmtFull = (dateStr) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).replace(/^\w/, (c) => c.toUpperCase())

const todayStr = () => new Date().toISOString().split('T')[0]

const yesterdayStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CFG[status] ?? STATUS_CFG.aberto
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

const FormaTag = ({ forma }) => {
    const cfg = FORMAS[forma]
    if (!cfg) return null
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.pill}`}>
            {cfg.label}
        </span>
    )
}

const SectionTitle = ({ children, count }) => (
    <div className='flex items-center gap-2 mb-3'>
        <span className='text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest'>{children}</span>
        {count != null && (
            <span className='px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400'>{count}</span>
        )}
        <div className='flex-1 h-px bg-gray-100 dark:bg-gray-700/60' />
    </div>
)

// ─── AbrirCaixaModal ──────────────────────────────────────────────────────────

function AbrirCaixaModal({ onClose, onConfirm, suggestedBalance }) {
    const today = todayStr()
    const [form, setForm] = useState({ date: today, balance: suggestedBalance?.toString() ?? '0' })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

    const handleConfirm = async () => {
        setSaving(true)
        try { await onConfirm(form) } finally { setSaving(false) }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm'>
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <div>
                        <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Abrir Caixa</h3>
                        <p className='text-xs text-gray-400 mt-0.5'>Informe o saldo inicial em dinheiro</p>
                    </div>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='p-6 space-y-4'>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Data do Caixa</label>
                        <input type='date' value={form.date} onChange={e => set('date', e.target.value)}
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30' />
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>
                            Saldo Inicial em Dinheiro (R$)
                        </label>
                        <input type='number' min='0' step='0.01' value={form.balance} onChange={e => set('balance', e.target.value)}
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 tabular-nums font-semibold' />
                        {suggestedBalance != null && (
                            <p className='text-[10px] text-indigo-500 mt-1'>Sugerido: saldo físico do último fechamento</p>
                        )}
                    </div>
                    <div className='flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40'>
                        <HiOutlineCurrencyDollar className='w-4 h-4 text-amber-500 shrink-0' />
                        <p className='text-xs text-amber-700 dark:text-amber-300'>
                            Informe o valor físico que está na gaveta agora.
                        </p>
                    </div>
                </div>
                <div className='flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className='flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'>
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} disabled={saving}
                        className='flex-1 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 flex items-center justify-center gap-1.5'>
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Abrindo…</>
                            : <><HiOutlinePlus className='w-4 h-4' />Abrir Caixa</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── MovimentoModal ───────────────────────────────────────────────────────────

function MovimentoModal({ onClose, onConfirm }) {
    const [form, setForm] = useState({ type: 'sangria', amount: '', description: '', responsible: '' })
    const [saving, setSaving] = useState(false)
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
    const canConfirm = form.amount && Number(form.amount) > 0 && form.description.trim()

    const handleConfirm = async () => {
        setSaving(true)
        try { await onConfirm(form) } finally { setSaving(false) }
    }

    const isSangria = form.type === 'sangria'

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm'>
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/50'>
                    <h3 className='font-semibold text-gray-800 dark:text-gray-100'>Nova Movimentação</h3>
                    <button onClick={() => !saving && onClose()} className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'>
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>
                <div className='p-6 space-y-4'>
                    <div className='flex items-center gap-2 bg-gray-100 dark:bg-gray-700/60 p-0.5 rounded-xl'>
                        {[
                            { k: 'sangria',    l: 'Sangria',    desc: 'Retirada' },
                            { k: 'suprimento', l: 'Suprimento', desc: 'Reforço' },
                        ].map(({ k, l }) => (
                            <button key={k} onClick={() => set('type', k)}
                                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${form.type === k ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Valor (R$) *</label>
                        <input type='number' min='0.01' step='0.01' value={form.amount} onChange={e => set('amount', e.target.value)}
                            placeholder='0,00'
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 tabular-nums font-semibold' />
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Motivo / Descrição *</label>
                        <input value={form.description} onChange={e => set('description', e.target.value)}
                            placeholder={isSangria ? 'Ex: Depósito bancário' : 'Ex: Complemento de troco'}
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30' />
                    </div>
                    <div>
                        <label className='block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5'>Responsável</label>
                        <input value={form.responsible} onChange={e => set('responsible', e.target.value)}
                            placeholder='Nome de quem realizou'
                            className='w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30' />
                    </div>
                </div>
                <div className='flex gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700/50'>
                    <button onClick={() => !saving && onClose()} disabled={saving}
                        className='flex-1 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'>
                        Cancelar
                    </button>
                    <button onClick={handleConfirm} disabled={!canConfirm || saving}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${isSangria ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        {saving
                            ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Salvando…</>
                            : isSangria ? <><HiOutlineMinus className='w-4 h-4' />Registrar Sangria</> : <><HiOutlinePlus className='w-4 h-4' />Registrar Suprimento</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── ClosingDetail ─────────────────────────────────────────────────────────────

const ClosingDetail = ({ sessionId, companyPublicId, onClose, onRefreshList }) => {
    const [detail, setDetail]               = useState(null)
    const [loading, setLoading]             = useState(true)
    const [showCloseForm, setShowCloseForm] = useState(false)
    const [showMovModal, setShowMovModal]   = useState(false)
    const [saldoFisicoInput, setSaldoFisicoInput] = useState('')
    const [obs, setObs]                     = useState('')
    const [closing, setClosing]             = useState(false)
    const [reopening, setReopening]         = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getCashSessionDetail(sessionId, companyPublicId)
            setDetail(data)
        } catch {
            toast.push(<Notification type='danger' title='Erro ao carregar detalhe do caixa' />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [sessionId, companyPublicId])

    useEffect(() => { load() }, [load])

    const handleFechar = async () => {
        if (!saldoFisicoInput) return
        setClosing(true)
        try {
            await closeCashSession(sessionId, {
                companyPublicId,
                physicalClosingBalance: parseFloat(saldoFisicoInput.replace(',', '.')),
                notes: obs.trim() || null,
            })
            toast.push(<Notification type='success' title='Caixa fechado com sucesso' />, { placement: 'top-center' })
            onRefreshList()
            load()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao fechar caixa' />, { placement: 'top-center' })
        } finally {
            setClosing(false)
        }
    }

    const handleReabrir = async () => {
        setReopening(true)
        try {
            await reopenCashSession(sessionId, { companyPublicId })
            toast.push(<Notification type='success' title='Caixa reaberto com sucesso' />, { placement: 'top-center' })
            onRefreshList()
            load()
        } catch (err) {
            const msg = err?.response?.data
            toast.push(<Notification type='danger' title={typeof msg === 'string' ? msg : 'Erro ao reabrir caixa'} />, { placement: 'top-center' })
        } finally {
            setReopening(false)
        }
    }

    const handleAddMovimento = async (form) => {
        await addCashMovement(sessionId, {
            companyPublicId,
            type: form.type,
            amount: Number(form.amount),
            description: form.description.trim(),
            responsibleUserName: form.responsible.trim() || null,
        })
        setShowMovModal(false)
        toast.push(<Notification type='success' title='Movimentação registrada' />, { placement: 'top-center' })
        onRefreshList()
        load()
    }

    const handleDeleteMovimento = async (movementPublicId) => {
        try {
            await deleteCashMovement(sessionId, movementPublicId, companyPublicId)
            toast.push(<Notification type='success' title='Movimentação removida' />, { placement: 'top-center' })
            onRefreshList()
            load()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao remover movimentação' />, { placement: 'top-center' })
        }
    }

    const saldoFisicoNum = parseFloat(saldoFisicoInput.replace(',', '.')) || 0
    const esperado       = detail?.expectedClosingBalance ?? 0
    const diferenca      = detail?.fechamento
        ? (detail.physicalClosingBalance ?? 0) - esperado
        : saldoFisicoInput ? saldoFisicoNum - esperado : null

    const diferencaColor = diferenca == null || Math.abs(diferenca) < 0.01
        ? 'text-emerald-600 dark:text-emerald-400'
        : diferenca > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'

    const diferencaLabel = diferenca == null ? '' : Math.abs(diferenca) < 0.01
        ? 'Caixa conferido — sem divergências'
        : diferenca > 0 ? `Sobra de ${fmt(Math.abs(diferenca))}` : `Falta de ${fmt(Math.abs(diferenca))}`

    const isAberto  = detail?.status === 'aberto'
    const canReopen = detail?.status === 'fechado' && (detail?.sessionDate === todayStr() || detail?.sessionDate === yesterdayStr())

    const porForma = useMemo(() => {
        if (!detail) return []
        return detail.receiptsByMethod.map(b => ({
            key: b.label,
            valor: b.amount,
            cfg: FORMAS[b.label] ?? FORMAS.outro,
        }))
    }, [detail])

    return (
        <div className='fixed inset-0 z-50 flex items-stretch justify-end' style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
            <div className='relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl flex flex-col' onClick={e => e.stopPropagation()}>

                {loading ? (
                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin' />
                    </div>
                ) : !detail ? (
                    <div className='flex-1 flex items-center justify-center text-gray-400 text-sm'>Erro ao carregar.</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'>
                            <div className='flex items-start gap-3 px-6 py-4'>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-semibold mb-0.5'>Fechamento de Caixa</p>
                                    <h2 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-snug'>{fmtFull(detail.sessionDate)}</h2>
                                    <div className='flex items-center gap-2 mt-1.5 flex-wrap'>
                                        <StatusBadge status={detail.status} />
                                        {detail.closedByUserName && (
                                            <span className='text-xs text-gray-400 flex items-center gap-1'>
                                                <HiOutlineUser className='w-3 h-3' />
                                                {detail.closedByUserName}
                                            </span>
                                        )}
                                        {detail.closedAt && (
                                            <span className='text-xs text-gray-400 flex items-center gap-1'>
                                                <HiOutlineClock className='w-3 h-3' />
                                                Fechado às {new Date(detail.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button onClick={onClose} className='w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0'>
                                    <HiOutlineX className='w-4 h-4' />
                                </button>
                            </div>

                            {/* KPI strip */}
                            <div className='grid grid-cols-4 border-t border-gray-100 dark:border-gray-800'>
                                {[
                                    { label: 'Entradas',      value: fmt(detail.totalReceipts),  color: 'text-emerald-600 dark:text-emerald-400' },
                                    { label: 'Saídas',        value: fmt(detail.totalPayments),   color: 'text-rose-500 dark:text-rose-400' },
                                    { label: 'Resultado',     value: fmt(detail.totalReceipts - detail.totalPayments), color: (detail.totalReceipts - detail.totalPayments) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500' },
                                    { label: 'Saldo Esperado', value: fmt(detail.expectedClosingBalance), color: 'text-indigo-600 dark:text-indigo-400' },
                                ].map(k => (
                                    <div key={k.label} className='px-4 py-3 border-r border-gray-100 dark:border-gray-800 last:border-r-0'>
                                        <p className='text-[10px] text-gray-400 font-semibold uppercase tracking-wide truncate'>{k.label}</p>
                                        <p className={`text-sm font-bold mt-0.5 ${k.color}`}>{k.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className='flex-1 px-6 py-5 space-y-6'>

                            {/* Receita por Forma */}
                            {porForma.length > 0 && (
                                <div>
                                    <SectionTitle count={porForma.length}>Receita por Forma de Pagamento</SectionTitle>
                                    <div className='grid grid-cols-2 gap-2'>
                                        {porForma.map(({ key, valor, cfg }) => {
                                            const pct = detail.totalReceipts > 0 ? (valor / detail.totalReceipts) * 100 : 0
                                            return (
                                                <div key={key} className='flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/40'>
                                                    <div className='w-2.5 h-2.5 rounded-full flex-shrink-0' style={{ background: cfg.accent }} />
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-center justify-between mb-1'>
                                                            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300 truncate'>{cfg.label}</span>
                                                            <span className='text-xs font-bold text-gray-800 dark:text-gray-200 tabular-nums ml-2'>{fmt(valor)}</span>
                                                        </div>
                                                        <div className='h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                                                            <div className='h-full rounded-full transition-all' style={{ width: `${pct}%`, background: cfg.accent }} />
                                                        </div>
                                                    </div>
                                                    <span className='text-[10px] text-gray-400 font-semibold w-8 text-right tabular-nums flex-shrink-0'>{pct.toFixed(0)}%</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Atendimentos / Entradas */}
                            <div>
                                <SectionTitle count={detail.receipts.length}>Atendimentos e Receitas</SectionTitle>
                                {detail.receipts.length === 0 ? (
                                    <p className='text-xs text-gray-400 italic px-1'>Nenhum recebimento registrado neste dia.</p>
                                ) : (
                                    <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                                        {detail.receipts.map((r, i) => (
                                            <div key={r.publicId} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/30 last:border-b-0 ${i % 2 === 0 ? '' : 'bg-gray-50/60 dark:bg-gray-800/20'}`}>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug'>{r.description}</p>
                                                    <p className='text-[11px] text-gray-400 tabular-nums mt-0.5'>{r.time}</p>
                                                </div>
                                                <FormaTag forma={r.paymentMethod} />
                                                <span className='text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap'>{fmt(r.amount)}</span>
                                            </div>
                                        ))}
                                        <div className='flex items-center justify-between px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border-t border-gray-100 dark:border-gray-700/50'>
                                            <span className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide'>Total Entradas</span>
                                            <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums'>{fmt(detail.totalReceipts)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Despesas / Saídas */}
                            {detail.payments.length > 0 && (
                                <div>
                                    <SectionTitle count={detail.payments.length}>Despesas e Saídas</SectionTitle>
                                    <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden'>
                                        {detail.payments.map((p, i) => (
                                            <div key={p.publicId} className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 dark:border-gray-700/30 last:border-b-0 ${i % 2 === 0 ? '' : 'bg-gray-50/60 dark:bg-gray-800/20'}`}>
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug'>{p.description}</p>
                                                    <p className='text-[11px] text-gray-400 mt-0.5'>
                                                        <span className='tabular-nums'>{p.time}</span>
                                                        {p.categoryName && <> · {p.categoryName}</>}
                                                        {p.supplierName && <> · {p.supplierName}</>}
                                                    </p>
                                                </div>
                                                <FormaTag forma={p.paymentMethod} />
                                                <span className='text-xs font-bold text-rose-500 dark:text-rose-400 tabular-nums whitespace-nowrap'>− {fmt(p.amount)}</span>
                                            </div>
                                        ))}
                                        <div className='flex items-center justify-between px-4 py-2.5 bg-rose-50 dark:bg-rose-900/20 border-t border-gray-100 dark:border-gray-700/50'>
                                            <span className='text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide'>Total Saídas</span>
                                            <span className='text-sm font-bold text-rose-500 dark:text-rose-400 tabular-nums'>{fmt(detail.totalPayments)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sangrias e Suprimentos */}
                            <div>
                                <div className='flex items-center justify-between mb-3'>
                                    <SectionTitle count={detail.movements.length}>Movimentações de Caixa</SectionTitle>
                                    {isAberto && (
                                        <button onClick={() => setShowMovModal(true)}
                                            className='flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition'>
                                            <HiOutlinePlus className='w-3.5 h-3.5' />
                                            Adicionar
                                        </button>
                                    )}
                                </div>
                                {detail.movements.length === 0 ? (
                                    <p className='text-xs text-gray-400 italic px-1'>Nenhuma movimentação registrada.</p>
                                ) : (
                                    <div className='space-y-1.5'>
                                        {detail.movements.map(m => {
                                            const isSangria = m.type === 'sangria'
                                            return (
                                                <div key={m.publicId} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${isSangria ? 'border-rose-100 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-900/10' : 'border-emerald-100 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isSangria ? 'bg-rose-100 dark:bg-rose-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40'}`}>
                                                        {isSangria ? <HiOutlineMinus className='w-3.5 h-3.5 text-rose-500 dark:text-rose-400' /> : <HiOutlinePlus className='w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400' />}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-xs font-semibold text-gray-700 dark:text-gray-300'>{m.description}</p>
                                                        <p className='text-[11px] text-gray-400'>
                                                            {new Date(m.occurredAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                            {m.responsibleUserName && <> · {m.responsibleUserName}</>}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-bold tabular-nums ${isSangria ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                        {isSangria ? '− ' : '+ '}{fmt(m.amount)}
                                                    </span>
                                                    {isAberto && (
                                                        <button onClick={() => handleDeleteMovimento(m.publicId)}
                                                            className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition flex-shrink-0'>
                                                            <HiOutlineTrash className='w-3.5 h-3.5' />
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Conferência de Fechamento */}
                            <div>
                                <SectionTitle>Conferência de Fechamento (Caixa Físico)</SectionTitle>
                                <div className='rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                                    <div className='px-5 py-4 space-y-2 bg-gray-50/60 dark:bg-gray-800/30'>
                                        {[
                                            { label: 'Saldo Inicial',         value: detail.openingBalance,  op: null },
                                            { label: 'Entradas em Dinheiro',  value: detail.cashReceipts,    op: '+' },
                                            { label: 'Saídas em Dinheiro',    value: detail.cashPayments,    op: '−' },
                                            { label: 'Sangrias',              value: detail.totalSangrias,   op: '−' },
                                            { label: 'Suprimentos',           value: detail.totalSuprimentos, op: '+' },
                                        ].map(row => (
                                            <div key={row.label} className='flex items-center justify-between gap-4'>
                                                <div className='flex items-center gap-2'>
                                                    {row.op
                                                        ? <span className={`text-xs font-bold w-4 text-center ${row.op === '+' ? 'text-emerald-500' : 'text-rose-400'}`}>{row.op}</span>
                                                        : <span className='w-4' />}
                                                    <span className='text-xs text-gray-500 dark:text-gray-400'>{row.label}</span>
                                                </div>
                                                <span className='text-xs tabular-nums text-gray-700 dark:text-gray-300'>{fmt(row.value)}</span>
                                            </div>
                                        ))}
                                        <div className='pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between'>
                                            <span className='text-xs font-bold text-gray-700 dark:text-gray-200'>= Saldo Esperado em Caixa</span>
                                            <span className='text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums'>{fmt(detail.expectedClosingBalance)}</span>
                                        </div>
                                    </div>

                                    {/* Fechado */}
                                    {detail.status === 'fechado' ? (
                                        <div className='px-5 py-4 border-t border-gray-200 dark:border-gray-700/60 space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs text-gray-500'>Saldo Físico Contado</span>
                                                <span className='text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums'>{fmt(detail.physicalClosingBalance)}</span>
                                            </div>
                                            {detail.difference != null && (
                                                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${Math.abs(detail.difference) < 0.01 ? 'bg-emerald-50 dark:bg-emerald-900/20' : detail.difference > 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                                    <span className={`text-xs font-bold ${diferencaColor}`}>Diferença</span>
                                                    <div className='text-right'>
                                                        <span className={`text-sm font-bold tabular-nums ${diferencaColor}`}>{fmt(Math.abs(detail.difference))}</span>
                                                        <p className={`text-[10px] font-semibold ${diferencaColor}`}>{diferencaLabel}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {detail.notes && <p className='text-[11px] text-gray-400 italic px-1'>{detail.notes}</p>}
                                            {canReopen && (
                                                <div className='pt-2 border-t border-gray-100 dark:border-gray-700/50'>
                                                    <button onClick={handleReabrir} disabled={reopening}
                                                        className='w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold border border-amber-200 dark:border-amber-800/40 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none'>
                                                        {reopening
                                                            ? <><div className='w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin' />Reabrindo…</>
                                                            : <><HiOutlineLockOpen className='w-4 h-4' />Reabrir Caixa</>}
                                                    </button>
                                                    <p className='text-[10px] text-gray-400 dark:text-gray-500 text-center mt-1.5'>
                                                        Permitido para o caixa de hoje ou do dia anterior
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : !showCloseForm ? (
                                        <div className='px-5 py-4 border-t border-gray-200 dark:border-gray-700/60'>
                                            <button onClick={() => setShowCloseForm(true)}
                                                className='w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold border border-indigo-200 dark:border-indigo-800/40 transition flex items-center justify-center gap-2'>
                                                <HiOutlineLockClosed className='w-4 h-4' />
                                                Realizar Fechamento de Caixa
                                            </button>
                                        </div>
                                    ) : (
                                        <div className='px-5 py-4 border-t border-gray-200 dark:border-gray-700/60 space-y-3'>
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Saldo Físico Contado (R$) *</label>
                                                <input type='number' min='0' step='0.01' placeholder='0,00' value={saldoFisicoInput}
                                                    onChange={e => setSaldoFisicoInput(e.target.value)}
                                                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400 tabular-nums' />
                                            </div>
                                            {saldoFisicoInput && (
                                                <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${Math.abs(saldoFisicoNum - esperado) < 0.01 ? 'bg-emerald-50 dark:bg-emerald-900/20' : (saldoFisicoNum - esperado) > 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                                                    <span className={`text-xs font-bold ${diferencaColor}`}>Diferença</span>
                                                    <div className='text-right'>
                                                        <span className={`text-sm font-bold tabular-nums ${diferencaColor}`}>{fmt(Math.abs(saldoFisicoNum - esperado))}</span>
                                                        <p className={`text-[10px] font-semibold ${diferencaColor}`}>{diferencaLabel}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>Observações</label>
                                                <textarea rows={2} value={obs} onChange={e => setObs(e.target.value)}
                                                    placeholder='Justificativa de diferença, ocorrências, etc.'
                                                    className='w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 resize-none' />
                                            </div>
                                            <div className='flex gap-2'>
                                                <button onClick={() => setShowCloseForm(false)} disabled={closing}
                                                    className='flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'>
                                                    Cancelar
                                                </button>
                                                <button onClick={handleFechar} disabled={!saldoFisicoInput || closing}
                                                    className='flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2'>
                                                    {closing
                                                        ? <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' />Fechando…</>
                                                        : <><HiOutlineLockClosed className='w-4 h-4' />Fechar Caixa</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showMovModal && (
                <MovimentoModal onClose={() => setShowMovModal(false)} onConfirm={handleAddMovimento} />
            )}
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CashClosingIndex = () => {
    const companyPublicId = useSelector(s => s.auth.user.companyPublicId)

    const today        = todayStr()
    const now          = new Date()
    const [monthOffset, setMonthOffset] = useState(0)
    const displayDate  = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const displayYear  = displayDate.getFullYear()
    const displayMonth = displayDate.getMonth()
    const monthLabel   = `${MONTH_NAMES[displayMonth]} ${displayYear}`

    const [sessions, setSessions]         = useState([])
    const [loading, setLoading]           = useState(false)
    const [selectedId, setSelectedId]     = useState(null)
    const [showAbrirModal, setShowAbrirModal] = useState(false)

    const load = useCallback(async () => {
        if (!companyPublicId) return
        setLoading(true)
        try {
            const data = await getCashSessions(companyPublicId, displayYear, displayMonth + 1)
            setSessions(data ?? [])
        } catch {
            toast.push(<Notification type='danger' title='Erro ao carregar fechamentos' />, { placement: 'top-center' })
        } finally {
            setLoading(false)
        }
    }, [companyPublicId, displayYear, displayMonth])

    useEffect(() => { load() }, [load])

    const yesterday      = yesterdayStr()
    const todayExists    = sessions.some(s => s.sessionDate === today)
    const isCurrentMonth = monthOffset === 0

    const lastClosed = useMemo(() =>
        sessions.find(s => s.status === 'fechado' && s.physicalClosingBalance != null),
        [sessions])

    const monthKpis = useMemo(() => ({
        entradas: sessions.reduce((s, fc) => s + fc.totalReceipts, 0),
        saidas:   sessions.reduce((s, fc) => s + fc.totalPayments, 0),
        resultado: sessions.reduce((s, fc) => s + fc.totalReceipts - fc.totalPayments, 0),
        abertos:  sessions.filter(fc => fc.status === 'aberto').length,
        dias:     sessions.length,
    }), [sessions])

    const handleAbrirCaixa = async (form) => {
        try {
            await openCashSession({
                companyPublicId,
                sessionDate: form.date,
                openingBalance: parseFloat(form.balance) || 0,
            })
            toast.push(<Notification type='success' title='Caixa aberto' />, { placement: 'top-center' })
            setShowAbrirModal(false)
            load()
        } catch (err) {
            const msg = err?.response?.data
            toast.push(<Notification type='danger' title={typeof msg === 'string' ? msg : 'Erro ao abrir caixa'} />, { placement: 'top-center' })
            throw err
        }
    }

    return (
        <div className='space-y-5'>

            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>Fechamento de Caixa</h3>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>Controle diário de entradas, saídas e conferência</p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-1 py-1'>
                        <button onClick={() => setMonthOffset(v => v - 1)} className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition'>
                            <HiOutlineChevronLeft className='w-4 h-4' />
                        </button>
                        <span className='text-sm font-semibold text-gray-700 dark:text-gray-200 px-2 min-w-[130px] text-center'>{monthLabel}</span>
                        <button onClick={() => setMonthOffset(v => v + 1)} className='w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition'>
                            <HiOutlineChevronRight className='w-4 h-4' />
                        </button>
                    </div>
                    {isCurrentMonth && !todayExists && (
                        <CreateButton onClick={() => setShowAbrirModal(true)}>
                            Abrir Caixa Hoje
                        </CreateButton>
                    )}
                    <button onClick={load} title='Atualizar' className='w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition'>
                        <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                {[
                    { label: 'Receita do Período',  value: fmt(monthKpis.entradas),   sub: `${monthKpis.dias} dia${monthKpis.dias !== 1 ? 's' : ''} com movimento`, Icon: HiOutlineArrowUp,    color: '#10b981' },
                    { label: 'Despesas do Período', value: fmt(monthKpis.saidas),     sub: 'Contas pagas no período', Icon: HiOutlineArrowDown,   color: '#f43f5e' },
                    { label: 'Resultado Líquido',   value: fmt(monthKpis.resultado),  sub: monthKpis.resultado >= 0 ? 'Superávit no período' : 'Déficit no período', Icon: HiOutlineCurrencyDollar, color: monthKpis.resultado >= 0 ? '#6366f1' : '#f43f5e' },
                    { label: 'Caixas Pendentes',    value: monthKpis.abertos,         sub: monthKpis.abertos > 0 ? 'Aguardando fechamento' : 'Tudo conferido', Icon: monthKpis.abertos > 0 ? HiOutlineExclamation : HiOutlineCheckCircle, color: monthKpis.abertos > 0 ? '#f59e0b' : '#10b981' },
                ].map(k => (
                    <div key={k.label} className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm px-4 py-4 flex items-start gap-3'>
                        <div className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0' style={{ background: k.color + '18' }}>
                            <k.Icon className='w-5 h-5' style={{ color: k.color }} />
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none mb-1'>{k.label}</p>
                            <p className='text-lg font-bold text-gray-800 dark:text-gray-100 leading-none'>{k.value}</p>
                            <p className='text-[11px] text-gray-400 mt-1'>{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
                <div className='px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/60 grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center'>
                    {['Data', 'Status', 'Entradas', 'Saídas', 'Resultado', ''].map(h => (
                        <span key={h} className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>{h}</span>
                    ))}
                </div>

                {loading ? (
                    <div className='flex items-center justify-center gap-3 py-16 text-gray-400'>
                        <div className='w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin' />
                        <span className='text-sm'>Carregando caixas…</span>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-16 gap-3 text-gray-300 dark:text-gray-600'>
                        <HiOutlineDocumentText className='w-10 h-10' />
                        <p className='text-sm font-medium'>Nenhum fechamento em {monthLabel}</p>
                        {isCurrentMonth && (
                            <button onClick={() => setShowAbrirModal(true)} className='text-xs text-indigo-500 hover:text-indigo-700 font-semibold'>
                                Abrir caixa de hoje →
                            </button>
                        )}
                    </div>
                ) : (
                    <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                        {sessions.map(fc => {
                            const resultado      = fc.totalReceipts - fc.totalPayments
                            const isToday        = fc.sessionDate === today
                            const isYesterday    = fc.sessionDate === yesterday
                            const hasDiff        = fc.difference != null && Math.abs(fc.difference) >= 0.01
                            const canReopenRow   = (isToday || isYesterday) && fc.status === 'fechado'
                            return (
                                <div key={fc.publicId} onClick={() => setSelectedId(fc.publicId)}
                                    className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-700/20 ${isToday ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}>

                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-sm font-bold text-gray-800 dark:text-gray-200 tabular-nums'>{fmtShort(fc.sessionDate)}</span>
                                            {isToday && <span className='text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400'>HOJE</span>}
                                        </div>
                                        <p className='text-[11px] text-gray-400 mt-0.5'>{fc.receiptCount} recebimentos · {fc.paymentCount} pagamentos</p>
                                    </div>

                                    <StatusBadge status={fc.status} />

                                    <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums text-right'>{fmt(fc.totalReceipts)}</span>
                                    <span className='text-sm font-semibold text-rose-500 dark:text-rose-400 tabular-nums text-right'>{fmt(fc.totalPayments)}</span>

                                    <div className='text-right'>
                                        <span className={`text-sm font-bold tabular-nums ${resultado >= 0 ? 'text-gray-800 dark:text-gray-200' : 'text-rose-500'}`}>{fmt(resultado)}</span>
                                        {hasDiff && (
                                            <p className={`text-[10px] font-semibold tabular-nums ${fc.difference > 0 ? 'text-sky-500' : 'text-rose-500'}`}>
                                                {fc.difference > 0 ? '▲' : '▼'} {fmt(Math.abs(fc.difference))} no caixa
                                            </p>
                                        )}
                                    </div>

                                    <div className='flex items-center gap-1.5' onClick={e => e.stopPropagation()}>
                                        {canReopenRow && (
                                            <button onClick={() => setSelectedId(fc.publicId)}
                                                title='Reabrir caixa'
                                                className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 transition whitespace-nowrap'>
                                                <HiOutlineLockOpen className='w-3.5 h-3.5' />
                                                Reabrir
                                            </button>
                                        )}
                                        <button onClick={() => setSelectedId(fc.publicId)}
                                            className='flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 transition whitespace-nowrap'>
                                            Ver detalhe
                                            <HiOutlineChevronRight className='w-3 h-3' />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Drawer */}
            {selectedId && (
                <ClosingDetail
                    sessionId={selectedId}
                    companyPublicId={companyPublicId}
                    onClose={() => setSelectedId(null)}
                    onRefreshList={load}
                />
            )}

            {/* Abrir Caixa Modal */}
            {showAbrirModal && (
                <AbrirCaixaModal
                    onClose={() => setShowAbrirModal(false)}
                    onConfirm={handleAbrirCaixa}
                    suggestedBalance={lastClosed?.physicalClosingBalance}
                />
            )}
        </div>
    )
}

export default CashClosingIndex
