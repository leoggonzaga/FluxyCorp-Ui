import { useCallback, useEffect, useState } from 'react'
import {
    HiOutlineClipboardList,
    HiOutlineDocumentText,
    HiOutlineCurrencyDollar,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineX,
    HiOutlineBan,
    HiOutlineCheck,
    HiOutlineClock,
    HiOutlineTrash,
} from 'react-icons/hi'
import { Notification, toast } from '@/components/ui'
import SectionCard from './SectionCard'
import {
    treatmentPlanGetByPatient,
    treatmentPlanGetById,
    treatmentPlanApprove,
    treatmentPlanRemoveItem,
    treatmentContractGetByPatient,
    treatmentContractGetById,
    treatmentContractCompleteItem,
    treatmentPlanReject,
    treatmentPlanDelete,
} from '@/api/consultation/consultationService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBrl = (v) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Config de status ─────────────────────────────────────────────────────────

const PLAN_STATUS = {
    Draft:     { label: 'Rascunho',             dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' },
    Created:   { label: 'Aguard. aprovação',    dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' },
    Approved:  { label: 'Aprovado',             dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
    Rejected:  { label: 'Rejeitado',            dot: 'bg-red-400',     badge: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
    Cancelled: { label: 'Cancelado',            dot: 'bg-gray-300',    badge: 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-500' },
}

const CONTRACT_STATUS = {
    Active:    { label: 'Ativo',     dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800' },
    Completed: { label: 'Concluído', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' },
    Cancelled: { label: 'Cancelado', dot: 'bg-gray-300',    badge: 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-500' },
}

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 text-2xl'>
            {icon}
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
    </div>
)

// ─── Barra de progresso ───────────────────────────────────────────────────────

const ProgressBar = ({ completed, total }) => {
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100)
    return (
        <div className='flex items-center gap-2 mt-1.5'>
            <div className='flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden'>
                <div
                    className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className='text-[10px] font-semibold text-gray-400 whitespace-nowrap tabular-nums'>
                {completed}/{total}
            </span>
        </div>
    )
}

// ─── Card de planejamento (expansível, lazy-load) ─────────────────────────────

const PlanCard = ({ plan, onReject, onDelete, onApprove, onItemRemoved }) => {
    const [expanded, setExpanded]   = useState(false)
    const [detail, setDetail]       = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [approving, setApproving] = useState(false)
    const [removing, setRemoving]   = useState(null)

    const cfg       = PLAN_STATUS[plan.status] ?? PLAN_STATUS.Draft
    const isDraft   = plan.status === 'Draft'
    const isCreated = plan.status === 'Created'
    const canEdit   = isDraft || isCreated

    const handleApprove = async () => {
        setApproving(true)
        await onApprove(plan.publicId)
        setApproving(false)
    }

    const handleToggle = async () => {
        const next = !expanded
        setExpanded(next)
        if (next && !detail) {
            setLoadingDetail(true)
            const d = await treatmentPlanGetById(plan.publicId)
            setDetail(d ?? null)
            setLoadingDetail(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        setRemoving(itemId)
        await treatmentPlanRemoveItem(plan.publicId, itemId)
        const d = await treatmentPlanGetById(plan.publicId)
        setDetail(d ?? null)
        setRemoving(null)
        onItemRemoved?.()
    }

    const items = detail?.items ?? []

    return (
        <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/30'>

            {/* ── Cabeçalho ── */}
            <div className='flex items-start gap-3 p-3.5'>
                {/* Dot */}
                <div className='flex-shrink-0 mt-1'>
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                </div>

                {/* Info principal */}
                <button
                    className='flex-1 min-w-0 text-left'
                    onClick={handleToggle}
                >
                    <div className='flex items-center gap-2 flex-wrap'>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                        <span className='text-[11px] text-gray-400'>{fmtDate(plan.createdAt)}</span>
                        {plan.approvedAt && (
                            <span className='text-[11px] text-gray-400'>· aprovado {fmtDate(plan.approvedAt)}</span>
                        )}
                    </div>
                    <div className='mt-1.5 flex items-center gap-3'>
                        <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                            {plan.itemCount} {plan.itemCount === 1 ? 'procedimento' : 'procedimentos'}
                        </span>
                        <span className='text-sm font-bold text-gray-700 dark:text-gray-300'>
                            {fmtBrl(plan.totalAmount)}
                        </span>
                    </div>
                    {plan.professionalName && (
                        <p className='text-[11px] text-gray-400 mt-0.5'>por {plan.professionalName}</p>
                    )}
                </button>

                {/* Ações + chevron */}
                <div className='flex items-center gap-1 flex-shrink-0'>
                    {/* Botão Aprovar — só para planos salvos aguardando aprovação */}
                    {isCreated && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleApprove() }}
                            disabled={approving}
                            title='Aprovar planejamento'
                            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm disabled:opacity-60'
                        >
                            {approving
                                ? <span className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                : <HiOutlineCheck className='w-3.5 h-3.5' />}
                            Aprovar
                        </button>
                    )}

                    {/* Rejeitar / excluir — rascunho ou aguardando */}
                    {(isDraft || isCreated) && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onReject(plan.publicId) }}
                                title='Rejeitar'
                                className='p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition'
                            >
                                <HiOutlineBan className='w-3.5 h-3.5' />
                            </button>
                            {isDraft && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(plan.publicId) }}
                                    title='Excluir'
                                    className='p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition'
                                >
                                    <HiOutlineX className='w-3.5 h-3.5' />
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={handleToggle}
                        className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition'
                    >
                        {expanded
                            ? <HiOutlineChevronUp   className='w-4 h-4' />
                            : <HiOutlineChevronDown className='w-4 h-4' />}
                    </button>
                </div>
            </div>

            {/* ── Procedimentos ── */}
            {expanded && (
                <div className='border-t border-gray-100 dark:border-gray-700/40'>
                    {loadingDetail ? (
                        <div className='flex justify-center py-5'>
                            <span className='w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : items.length === 0 ? (
                        <p className='text-xs text-gray-400 text-center py-5'>
                            Nenhum procedimento adicionado ainda.
                        </p>
                    ) : (
                        <>
                            <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                                {[...items]
                                    .sort((a, b) => a.sequence - b.sequence)
                                    .map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition'
                                        >
                                            {/* Número de sequência */}
                                            <span className='w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center text-[10px] font-bold text-violet-600 dark:text-violet-400 flex-shrink-0'>
                                                {idx + 1}
                                            </span>

                                            {/* Nome */}
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-xs font-medium text-gray-700 dark:text-gray-300 truncate'>
                                                    {item.serviceName}
                                                </p>
                                                <p className='text-[10px] text-gray-400 mt-0.5'>
                                                    {item.quantity}× {fmtBrl(item.unitPrice)}
                                                </p>
                                            </div>

                                            {/* Total do item */}
                                            <span className='text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0'>
                                                {fmtBrl(item.unitPrice * item.quantity)}
                                            </span>

                                            {/* Remover item (só em Draft/Created) */}
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={removing === item.id}
                                                    title='Remover procedimento'
                                                    className='flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50'
                                                >
                                                    {removing === item.id
                                                        ? <span className='w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin' />
                                                        : <HiOutlineTrash className='w-3.5 h-3.5' />}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                            </div>

                            {/* Total geral */}
                            <div className='flex justify-between items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700/40'>
                                <span className='text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Total</span>
                                <span className='text-sm font-bold text-gray-800 dark:text-gray-200'>
                                    {fmtBrl(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Card de contrato (expansível, lazy-load) ─────────────────────────────────

const ContractCard = ({ contract, onCompleteItem }) => {
    const [expanded, setExpanded]     = useState(false)
    const [detail, setDetail]         = useState(null)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [completing, setCompleting] = useState(null)

    const cfg      = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.Active
    const isActive = contract.status === 'Active'
    const total    = (contract.pendingCount ?? 0) + (contract.completedCount ?? 0)

    const handleToggle = async () => {
        const next = !expanded
        setExpanded(next)
        if (next && !detail) {
            setLoadingDetail(true)
            const d = await treatmentContractGetById(contract.publicId)
            setDetail(d ?? null)
            setLoadingDetail(false)
        }
    }

    // Reload detail após concluir item
    const handleComplete = async (itemId) => {
        setCompleting(itemId)
        await onCompleteItem(contract.publicId, itemId)
        // Recarrega detalhe para refletir novo status
        const d = await treatmentContractGetById(contract.publicId)
        setDetail(d ?? detail)
        setCompleting(null)
    }

    const items = detail?.items ?? []

    return (
        <div className='rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden bg-white dark:bg-gray-800/30'>

            {/* ── Cabeçalho ── */}
            <button
                className='w-full flex items-start gap-3 p-3.5 text-left hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition'
                onClick={handleToggle}
            >
                <div className='flex-shrink-0 mt-1'>
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                </div>

                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                        </span>
                        <span className='text-[11px] text-gray-400'>{fmtDate(contract.approvedAt)}</span>
                    </div>

                    <div className='mt-1.5 flex items-center gap-3'>
                        <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                            {total} {total === 1 ? 'procedimento' : 'procedimentos'}
                        </span>
                        <span className='text-sm font-bold text-gray-700 dark:text-gray-300'>
                            {fmtBrl(contract.totalAmount)}
                        </span>
                    </div>

                    <ProgressBar completed={contract.completedCount ?? 0} total={total} />

                    {contract.professionalName && (
                        <p className='text-[11px] text-gray-400 mt-0.5'>por {contract.professionalName}</p>
                    )}
                </div>

                <span className='text-gray-400 flex-shrink-0 mt-1'>
                    {expanded
                        ? <HiOutlineChevronUp   className='w-4 h-4' />
                        : <HiOutlineChevronDown className='w-4 h-4' />}
                </span>
            </button>

            {/* ── Procedimentos ── */}
            {expanded && (
                <div className='border-t border-gray-100 dark:border-gray-700/40'>
                    {loadingDetail ? (
                        <div className='flex justify-center py-5'>
                            <span className='w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : items.length === 0 ? (
                        <p className='text-xs text-gray-400 text-center py-5'>
                            Sem procedimentos registrados.
                        </p>
                    ) : (
                        <>
                            <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                                {[...items]
                                    .sort((a, b) => a.sequence - b.sequence)
                                    .map(item => {
                                        const isPending    = item.status === 'Pending'
                                        const isCompleted  = item.status === 'Completed'
                                        const isCancelled  = item.status === 'Cancelled'
                                        const isCompleting = completing === item.id

                                        return (
                                            <div
                                                key={item.id}
                                                className='flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition'
                                            >
                                                {/* Ícone de status */}
                                                <div className='flex-shrink-0'>
                                                    {isCompleted ? (
                                                        <div className='w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center'>
                                                            <HiOutlineCheck className='w-3 h-3 text-emerald-600 dark:text-emerald-400' />
                                                        </div>
                                                    ) : isCancelled ? (
                                                        <div className='w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                                                            <HiOutlineX className='w-3 h-3 text-gray-400' />
                                                        </div>
                                                    ) : (
                                                        <div className='w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center'>
                                                            <div className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Nome + subtexto */}
                                                <div className='flex-1 min-w-0'>
                                                    <p className={`text-xs font-medium truncate ${
                                                        isCompleted  ? 'text-gray-400 line-through' :
                                                        isCancelled  ? 'text-gray-300 dark:text-gray-600 line-through' :
                                                                       'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {item.serviceName}
                                                    </p>
                                                    <div className='flex items-center gap-2 mt-0.5'>
                                                        <span className='text-[10px] text-gray-400'>
                                                            {item.quantity}× {fmtBrl(item.unitPrice)}
                                                        </span>
                                                        {item.completedAt && (
                                                            <span className='text-[10px] text-emerald-500'>
                                                                · {fmtDate(item.completedAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Total do item */}
                                                <span className='text-xs font-semibold text-gray-600 dark:text-gray-400 flex-shrink-0'>
                                                    {fmtBrl(item.unitPrice * item.quantity)}
                                                </span>

                                                {/* Botão concluir (só ativos + pendentes) */}
                                                {isActive && isPending && (
                                                    <button
                                                        onClick={() => handleComplete(item.id)}
                                                        disabled={isCompleting}
                                                        title='Marcar como concluído'
                                                        className='flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 transition disabled:opacity-50'
                                                    >
                                                        {isCompleting
                                                            ? <span className='w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin' />
                                                            : <HiOutlineCheck className='w-3 h-3' />}
                                                        Concluir
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>

                            {/* Totalizador */}
                            <div className='flex justify-between items-center px-4 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-700/40'>
                                <span className='text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide'>Total</span>
                                <span className='text-sm font-bold text-gray-800 dark:text-gray-200'>
                                    {fmtBrl(contract.totalAmount)}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TreatmentTab({ patientId }) {
    const [plans, setPlans]         = useState([])
    const [contracts, setContracts] = useState([])
    const [loadingPlans, setLoadingPlans]         = useState(true)
    const [loadingContracts, setLoadingContracts] = useState(true)

    const loadPlans = useCallback(async () => {
        if (!patientId) return
        setLoadingPlans(true)
        const data = await treatmentPlanGetByPatient(patientId)
        setPlans(data ?? [])
        setLoadingPlans(false)
    }, [patientId])

    const loadContracts = useCallback(async () => {
        if (!patientId) return
        setLoadingContracts(true)
        const data = await treatmentContractGetByPatient(patientId)
        setContracts(data ?? [])
        setLoadingContracts(false)
    }, [patientId])

    useEffect(() => {
        loadPlans()
        loadContracts()
    }, [loadPlans, loadContracts])

    const handleCompleteItem = async (contractPublicId, itemId) => {
        const res = await treatmentContractCompleteItem(contractPublicId, itemId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Procedimento concluído' />)
            // Atualiza contagens no sumário
            setContracts(prev => prev.map(c => {
                if (c.publicId !== contractPublicId) return c
                const newPending   = Math.max(0, (c.pendingCount ?? 0) - 1)
                const newCompleted = (c.completedCount ?? 0) + 1
                const allDone      = newPending === 0
                return { ...c, pendingCount: newPending, completedCount: newCompleted, status: allDone ? 'Completed' : c.status }
            }))
        }
    }

    const handleApprove = async (publicId) => {
        const res = await treatmentPlanApprove(publicId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Planejamento aprovado — contrato gerado!' />)
            loadPlans()
            loadContracts()
        }
    }

    const handleReject = async (publicId) => {
        const res = await treatmentPlanReject(publicId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Planejamento rejeitado' />)
            loadPlans()
        }
    }

    const handleDelete = async (publicId) => {
        const res = await treatmentPlanDelete(publicId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Planejamento excluído' />)
            loadPlans()
        }
    }

    // ── Métricas ──────────────────────────────────────────────────────────────

    const activeContracts   = contracts.filter(c => c.status === 'Active').length
    const pendingProcedures = contracts.reduce((acc, c) => acc + (c.pendingCount ?? 0), 0)
    const totalContracted   = contracts.reduce((acc, c) => acc + (c.totalAmount ?? 0), 0)
    const draftPlans        = plans.filter(p => p.status === 'Draft').length

    const metrics = [
        {
            label: 'Planejamentos',
            value: plans.length,
            sub: `${draftPlans} em rascunho`,
            accent: 'border-violet-200 dark:border-violet-800',
            text:   'text-violet-600 dark:text-violet-400',
            bg:     'bg-violet-50/60 dark:bg-violet-950/20',
            icon:   <HiOutlineDocumentText className='w-5 h-5 text-violet-400' />,
        },
        {
            label: 'Contratos ativos',
            value: activeContracts,
            sub: `${contracts.length} no total`,
            accent: 'border-blue-200 dark:border-blue-800',
            text:   'text-blue-600 dark:text-blue-400',
            bg:     'bg-blue-50/60 dark:bg-blue-950/20',
            icon:   <HiOutlineClipboardList className='w-5 h-5 text-blue-400' />,
        },
        {
            label: 'Procedimentos pendentes',
            value: pendingProcedures,
            sub: 'em contratos ativos',
            accent: 'border-amber-200 dark:border-amber-800',
            text:   'text-amber-600 dark:text-amber-400',
            bg:     'bg-amber-50/60 dark:bg-amber-950/20',
            icon:   <HiOutlineClock className='w-5 h-5 text-amber-400' />,
        },
        {
            label: 'Total contratado',
            value: fmtBrl(totalContracted),
            sub: 'valor de todos os contratos',
            accent: 'border-emerald-200 dark:border-emerald-800',
            text:   'text-emerald-600 dark:text-emerald-400',
            bg:     'bg-emerald-50/60 dark:bg-emerald-950/20',
            icon:   <HiOutlineCurrencyDollar className='w-5 h-5 text-emerald-400' />,
        },
    ]

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className='space-y-5'>

            {/* Métricas */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                {metrics.map(m => (
                    <div key={m.label} className={`flex items-start gap-3 p-4 rounded-2xl border ${m.accent} ${m.bg}`}>
                        <div className='flex-shrink-0 mt-0.5'>{m.icon}</div>
                        <div className='min-w-0'>
                            <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none'>{m.label}</p>
                            <p className={`text-xl font-bold leading-tight mt-1 ${m.text}`}>{m.value}</p>
                            <p className='text-[10px] text-gray-400 mt-0.5 truncate'>{m.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Listas em grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>

                {/* ── Planejamentos ── */}
                <SectionCard
                    icon={<HiOutlineDocumentText />}
                    title='Planejamentos'
                    subtitle='Clique em um plano para ver os procedimentos'
                    color='violet'
                >
                    {loadingPlans ? (
                        <div className='flex justify-center py-10'>
                            <span className='w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : plans.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineDocumentText />}
                            message='Nenhum planejamento registrado'
                            sub='Crie um planejamento no atendimento para começar'
                        />
                    ) : (
                        <div className='space-y-2'>
                            {[...plans]
                                .sort((a, b) => {
                                    if (a.status === 'Draft' && b.status !== 'Draft') return -1
                                    if (b.status === 'Draft' && a.status !== 'Draft') return 1
                                    return new Date(b.createdAt) - new Date(a.createdAt)
                                })
                                .map(plan => (
                                    <PlanCard
                                        key={plan.publicId}
                                        plan={plan}
                                        onApprove={handleApprove}
                                        onReject={handleReject}
                                        onDelete={handleDelete}
                                        onItemRemoved={loadPlans}
                                    />
                                ))}
                        </div>
                    )}
                </SectionCard>

                {/* ── Contratos ── */}
                <SectionCard
                    icon={<HiOutlineClipboardList />}
                    title='Contratos'
                    subtitle='Clique em um contrato para ver e concluir procedimentos'
                    color='blue'
                >
                    {loadingContracts ? (
                        <div className='flex justify-center py-10'>
                            <span className='w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin' />
                        </div>
                    ) : contracts.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineClipboardList />}
                            message='Nenhum contrato gerado'
                            sub='Contratos são criados ao aprovar um planejamento'
                        />
                    ) : (
                        <div className='space-y-2'>
                            {[...contracts]
                                .sort((a, b) => {
                                    if (a.status === 'Active' && b.status !== 'Active') return -1
                                    if (b.status === 'Active' && a.status !== 'Active') return 1
                                    return new Date(b.approvedAt) - new Date(a.approvedAt)
                                })
                                .map(contract => (
                                    <ContractCard
                                        key={contract.publicId}
                                        contract={contract}
                                        onCompleteItem={handleCompleteItem}
                                    />
                                ))}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    )
}
