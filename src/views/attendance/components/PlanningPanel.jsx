import { useCallback, useEffect, useState } from 'react'
import { Notification, toast } from '@/components/ui'
import {
    HiOutlineCheck,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineClipboardList,
    HiOutlineDocumentText,
    HiOutlineLightningBolt,
    HiOutlinePlus,
    HiOutlineTrash,
} from 'react-icons/hi'
import {
    treatmentPlanCreate,
    treatmentPlanGetByPatient,
    treatmentPlanGetById,
    treatmentPlanRemoveItem,
    treatmentPlanSubmit,
    treatmentContractGetByPatient,
    treatmentContractGetById,
    treatmentContractCompleteItem,
} from '@/api/consultation/consultationService'

const fmtBrl = (v) =>
    (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Item do planejamento ─────────────────────────────────────────────────────

const PlanItem = ({ item, onRemove, removing }) => (
    <div className='flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800/40 border border-violet-100 dark:border-violet-800/30'>
        <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-gray-800 dark:text-gray-200 truncate'>{item.serviceName}</p>
            <p className='text-[10px] text-gray-400 mt-0.5'>
                {item.quantity}× {fmtBrl(item.unitPrice)}
                {' · '}
                <span className='font-bold text-violet-600 dark:text-violet-400'>
                    {fmtBrl(item.unitPrice * item.quantity)}
                </span>
            </p>
        </div>
        <button
            onClick={() => onRemove(item.id)}
            disabled={removing === item.id}
            className='flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-40'
        >
            {removing === item.id
                ? <span className='w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin' />
                : <HiOutlineTrash className='w-3.5 h-3.5' />}
        </button>
    </div>
)

// ─── Card de contrato ativo ───────────────────────────────────────────────────

const ContractCard = ({ contract, onComplete }) => {
    const [expanded, setExpanded]     = useState(true)
    const [detail, setDetail]         = useState(null)
    const [loadingDetail, setLoading] = useState(false)
    const [completing, setCompleting] = useState(null)

    const loadDetail = useCallback(async () => {
        setLoading(true)
        const d = await treatmentContractGetById(contract.publicId)
        setDetail(d ?? null)
        setLoading(false)
    }, [contract.publicId])

    useEffect(() => { loadDetail() }, [loadDetail])

    const pending   = (detail?.items ?? []).filter(i => i.status === 'Pending')
    const completed = (detail?.items ?? []).filter(i => i.status === 'Completed')
    const total     = pending.length + completed.length

    const handleComplete = async (itemId) => {
        setCompleting(itemId)
        await onComplete(contract.publicId, itemId)
        await loadDetail()
        setCompleting(null)
    }

    return (
        <div className='rounded-xl border border-blue-100 dark:border-blue-800/40 overflow-hidden bg-white dark:bg-gray-800/30'>
            <button
                onClick={() => setExpanded(e => !e)}
                className='w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition'
            >
                <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0' />
                <div className='flex-1 min-w-0'>
                    <p className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                        {loadingDetail
                            ? 'Carregando...'
                            : `${contract.pendingCount ?? pending.length} pendente${(contract.pendingCount ?? pending.length) !== 1 ? 's' : ''} · ${fmtBrl(contract.totalAmount)}`
                        }
                    </p>
                    {total > 0 && (
                        <div className='flex items-center gap-1.5 mt-1'>
                            <div className='flex-1 h-1 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden'>
                                <div
                                    className='h-full rounded-full bg-emerald-500 transition-all'
                                    style={{ width: `${Math.round((completed.length / total) * 100)}%` }}
                                />
                            </div>
                            <span className='text-[10px] text-gray-400 whitespace-nowrap'>{completed.length}/{total}</span>
                        </div>
                    )}
                </div>
                {expanded
                    ? <HiOutlineChevronUp   className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />
                    : <HiOutlineChevronDown className='w-3.5 h-3.5 text-gray-400 flex-shrink-0' />}
            </button>

            {expanded && loadingDetail && (
                <div className='flex justify-center py-4 border-t border-blue-50 dark:border-blue-800/30'>
                    <span className='w-4 h-4 border border-blue-400 border-t-transparent rounded-full animate-spin' />
                </div>
            )}

            {expanded && !loadingDetail && pending.length > 0 && (
                <div className='border-t border-blue-50 dark:border-blue-800/30 divide-y divide-gray-50 dark:divide-gray-700/30'>
                    {pending.map(item => (
                        <div key={item.id} className='flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition'>
                            <div className='w-4 h-4 rounded-full border-2 border-amber-300 dark:border-amber-600 flex-shrink-0' />
                            <div className='flex-1 min-w-0'>
                                <p className='text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate'>{item.serviceName}</p>
                                <p className='text-[10px] text-gray-400'>{item.quantity}× {fmtBrl(item.unitPrice)}</p>
                            </div>
                            <button
                                onClick={() => handleComplete(item.id)}
                                disabled={completing === item.id}
                                className='flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 transition disabled:opacity-50'
                            >
                                {completing === item.id
                                    ? <span className='w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin' />
                                    : <HiOutlineCheck className='w-3 h-3' />}
                                Concluir
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {expanded && !loadingDetail && pending.length === 0 && total > 0 && (
                <div className='px-3 py-2.5 border-t border-blue-50 dark:border-blue-800/30'>
                    <p className='text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5'>
                        <HiOutlineCheck className='w-3.5 h-3.5' />
                        Todos os procedimentos concluídos
                    </p>
                </div>
            )}
        </div>
    )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PlanningPanel({ patientId, patientName, professionalName, disabled }) {
    const [plans, setPlans]           = useState([])
    const [contracts, setContracts]   = useState([])
    const [activePlan, setActivePlan] = useState(null)

    const [loading, setLoading]           = useState(true)
    const [creating, setCreating]         = useState(false)
    const [submitting, setSubmitting]     = useState(false)
    const [removingItem, setRemovingItem] = useState(null)

    // ── Carregamento de dados ─────────────────────────────────────────────────

    const loadAll = useCallback(async () => {
        if (!patientId) return
        setLoading(true)
        const [planList, contractList] = await Promise.all([
            treatmentPlanGetByPatient(patientId),
            treatmentContractGetByPatient(patientId),
        ])
        const allPlans     = planList ?? []
        const allContracts = contractList ?? []
        setPlans(allPlans)
        setContracts(allContracts)

        const draft = allPlans.find(p => p.status === 'Draft')
        if (draft) {
            const detail = await treatmentPlanGetById(draft.publicId)
            setActivePlan(detail ?? null)
        } else {
            setActivePlan(null)
        }
        setLoading(false)
    }, [patientId])

    useEffect(() => { loadAll() }, [loadAll])

    // ── Ações ─────────────────────────────────────────────────────────────────

    const handleCreatePlan = async () => {
        if (!patientId) return
        setCreating(true)
        const res = await treatmentPlanCreate({
            patientId,
            patientName:      patientName ?? '',
            professionalName: professionalName ?? '',
        })
        if (res !== null) {
            toast.push(<Notification type='success' title='Planejamento criado' />)
            await loadAll()
        }
        setCreating(false)
    }

    const handleRemoveItem = async (itemId) => {
        if (!activePlan) return
        setRemovingItem(itemId)
        await treatmentPlanRemoveItem(activePlan.publicId, itemId)
        const detail = await treatmentPlanGetById(activePlan.publicId)
        setActivePlan(detail ?? activePlan)
        setRemovingItem(null)
    }

    const handleSubmit = async () => {
        if (!activePlan?.items?.length) {
            toast.push(<Notification type='warning' title='Adicione ao menos um procedimento antes de salvar.' />)
            return
        }
        setSubmitting(true)
        const res = await treatmentPlanSubmit(activePlan.publicId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Planejamento salvo — aguardando aprovação no prontuário.' />)
            await loadAll()
        }
        setSubmitting(false)
    }

    const handleCompleteContractItem = async (contractPublicId, itemId) => {
        const res = await treatmentContractCompleteItem(contractPublicId, itemId)
        if (res !== null) {
            toast.push(<Notification type='success' title='Procedimento concluído' />)
        }
    }

    const activeContracts = contracts.filter(c => c.status === 'Active')

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) return (
        <div className='flex justify-center py-12'>
            <span className='w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
        </div>
    )

    return (
        <div className='flex flex-col gap-4'>

            {/* ── Contratos ativos ── */}
            {activeContracts.length > 0 && (
                <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5'>
                        <HiOutlineClipboardList className='w-3.5 h-3.5' />
                        Contratos Ativos
                    </p>
                    <div className='space-y-2'>
                        {activeContracts.map(c => (
                            <ContractCard
                                key={c.publicId}
                                contract={c}
                                onComplete={handleCompleteContractItem}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Planejamento em rascunho ── */}
            <div>
                <div className='flex items-center justify-between px-1 mb-2'>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5'>
                        <HiOutlineDocumentText className='w-3.5 h-3.5' />
                        Planejamento
                    </p>
                    {activePlan && (
                        <span className='text-[10px] font-semibold text-violet-500 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 px-2 py-0.5 rounded-full'>
                            Rascunho
                        </span>
                    )}
                </div>

                {/* Sem plano em rascunho */}
                {!activePlan ? (
                    <div className='flex flex-col items-center gap-3 py-8 text-center'>
                        <div className='w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                            <HiOutlineDocumentText className='w-6 h-6 text-gray-300 dark:text-gray-600' />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>Nenhum planejamento aberto</p>
                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>
                                Adicione procedimentos na aba <span className='font-semibold text-gray-500'>Procedimentos</span>
                            </p>
                        </div>
                        <button
                            onClick={handleCreatePlan}
                            disabled={creating || disabled}
                            className='flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm disabled:opacity-50'
                        >
                            {creating
                                ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                : <HiOutlinePlus className='w-4 h-4' />}
                            Criar Planejamento
                        </button>
                    </div>
                ) : activePlan.items?.length === 0 ? (
                    /* Plano existe mas vazio */
                    <div className='flex flex-col items-center gap-2.5 py-6 text-center border border-dashed border-violet-200 dark:border-violet-800/40 rounded-xl'>
                        <div className='w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center'>
                            <HiOutlineDocumentText className='w-5 h-5 text-violet-300 dark:text-violet-600' />
                        </div>
                        <div>
                            <p className='text-xs font-medium text-gray-500 dark:text-gray-400'>Planejamento vazio</p>
                            <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>
                                Adicione procedimentos na aba <span className='font-semibold'>Procedimentos</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Plano com itens */
                    <>
                        <div className='space-y-1.5 mb-3'>
                            {[...activePlan.items]
                                .sort((a, b) => a.sequence - b.sequence)
                                .map(item => (
                                    <PlanItem
                                        key={item.id}
                                        item={item}
                                        onRemove={handleRemoveItem}
                                        removing={removingItem}
                                    />
                                ))
                            }
                            <div className='flex justify-between items-center px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-800/40'>
                                <span className='text-xs font-semibold text-violet-600 dark:text-violet-400'>Total</span>
                                <span className='text-sm font-bold text-violet-700 dark:text-violet-300'>
                                    {fmtBrl(activePlan.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting || disabled}
                            className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 dark:shadow-none disabled:opacity-40 disabled:cursor-not-allowed'
                        >
                            {submitting
                                ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                : <HiOutlineLightningBolt className='w-4 h-4' />}
                            Salvar Planejamento
                        </button>
                        <p className='text-[10px] text-gray-400 text-center mt-1.5'>
                            Após salvar, o planejamento aguarda aprovação no prontuário
                        </p>
                    </>
                )}
            </div>

        </div>
    )
}
