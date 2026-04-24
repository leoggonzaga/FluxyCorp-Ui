import { useState, useMemo } from 'react'
import ContractModal from './contractModal'
import {
    HiOutlinePlus,
    HiOutlineX,
    HiOutlineCheckCircle,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineCurrencyDollar,
    HiOutlineUserGroup,
    HiOutlineTrendingUp,
    HiOutlineFilter,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineDocumentText,
    HiOutlineViewList,
    HiOutlineViewBoards,
    HiOutlineBriefcase,
    HiOutlineExclamation,
} from 'react-icons/hi'
import { Button, Dialog, Input, Select, Notification, toast } from '@/components/ui'
import CreateButton from '@/components/ui/Button/CreateButton'
import { KanbanCard, KanbanColumn } from '@/components/shared'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'
import { Card } from '@/components/ui'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

const fmtDate = (iso) => {
    if (!iso) return '—'
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

// ─── Etapas do Funil ──────────────────────────────────────────────────────────
export const STAGES = [
    { id: 'prospeccao',  label: 'Prospecção',  color: '#6366f1', light: '#eef2ff', width: '100%' },
    { id: 'qualificacao',label: 'Qualificação', color: '#8b5cf6', light: '#f5f3ff', width: '85%'  },
    { id: 'orcamento',   label: 'Orçamento',    color: '#f59e0b', light: '#fffbeb', width: '70%'  },
    { id: 'negociacao',  label: 'Negociação',   color: '#f97316', light: '#fff7ed', width: '55%'  },
    { id: 'fechado',     label: 'Fechado',      color: '#10b981', light: '#ecfdf5', width: '40%'  },
]

const STAGE_OPTS = STAGES.map((s) => ({ value: s.id, label: s.label }))

// ─── Mock — Funcionários ──────────────────────────────────────────────────────
const EMPLOYEES = [
    { value: 'ana_lima',     label: 'Dra. Ana Lima' },
    { value: 'carlos',       label: 'Carlos Santos' },
    { value: 'mariana',      label: 'Mariana Oliveira' },
    { value: 'roberto',      label: 'Dr. Roberto Mendes' },
    { value: 'patricia',     label: 'Patrícia Cruz' },
]

// ─── Mock — Negociações ───────────────────────────────────────────────────────
const INITIAL_LEADS = [
    { id: 1,  patient: 'João da Silva',       receivedBy: 'mariana',   quotedBy: 'ana_lima',  stage: 'fechado',     value: 4800,  description: 'Implante dentário superior',     createdAt: '2026-03-10', notes: 'Cliente muito interessado desde o início.' },
    { id: 2,  patient: 'Maria Aparecida',     receivedBy: 'carlos',    quotedBy: 'roberto',   stage: 'negociacao',  value: 3200,  description: 'Prótese total removível',         createdAt: '2026-03-18', notes: 'Aguardando aprovação do plano de saúde.' },
    { id: 3,  patient: 'Pedro Henrique',      receivedBy: 'ana_lima',  quotedBy: 'ana_lima',  stage: 'orcamento',   value: 1500,  description: 'Clareamento + facetas',           createdAt: '2026-03-22', notes: '' },
    { id: 4,  patient: 'Carla Ferreira',      receivedBy: 'patricia',  quotedBy: 'roberto',   stage: 'qualificacao',value: 2800,  description: 'Ortodontia adultos',              createdAt: '2026-04-01', notes: 'Paciente quer parcelar em 18x.' },
    { id: 5,  patient: 'Luís Eduardo',        receivedBy: 'mariana',   quotedBy: null,        stage: 'prospeccao',  value: 0,     description: 'Primeiro contato – interesse geral', createdAt: '2026-04-05', notes: '' },
    { id: 6,  patient: 'Fernanda Gomes',      receivedBy: 'carlos',    quotedBy: 'ana_lima',  stage: 'fechado',     value: 6400,  description: 'Implante full arch inferior',     createdAt: '2026-03-05', notes: 'Procedimento agendado para maio.' },
    { id: 7,  patient: 'Renata Borges',       receivedBy: 'patricia',  quotedBy: 'roberto',   stage: 'orcamento',   value: 900,   description: 'Clareamento a laser',             createdAt: '2026-04-08', notes: '' },
    { id: 8,  patient: 'Thiago Nascimento',   receivedBy: 'ana_lima',  quotedBy: null,        stage: 'prospeccao',  value: 0,     description: 'Indicação de amigo',              createdAt: '2026-04-10', notes: '' },
    { id: 9,  patient: 'Beatriz Lopes',       receivedBy: 'mariana',   quotedBy: 'ana_lima',  stage: 'negociacao',  value: 5200,  description: 'Implante + coroa porcelana',      createdAt: '2026-03-28', notes: 'Solicitou desconto de 10%.' },
    { id: 10, patient: 'Gustavo Almeida',     receivedBy: 'carlos',    quotedBy: 'roberto',   stage: 'qualificacao',value: 1800,  description: 'Facetas de porcelana (6 dentes)', createdAt: '2026-04-12', notes: 'Passou pela consulta de avaliação.' },
    { id: 11, patient: 'Isabela Martins',     receivedBy: 'patricia',  quotedBy: 'ana_lima',  stage: 'fechado',     value: 2400,  description: 'Aparelho autoligado',             createdAt: '2026-02-20', notes: 'Contrato assinado.' },
    { id: 12, patient: 'Rafael Souza',        receivedBy: 'mariana',   quotedBy: null,        stage: 'prospeccao',  value: 0,     description: 'Lead via Instagram',              createdAt: '2026-04-14', notes: '' },
]

const empName = (id) => EMPLOYEES.find((e) => e.value === id)?.label ?? '—'
const stageInfo = (id) => STAGES.find((s) => s.id === id)

// ─── Validação ────────────────────────────────────────────────────────────────
const schema = Yup.object().shape({
    patient:     Yup.string().required('Campo obrigatório'),
    receivedBy:  Yup.mixed().required('Campo obrigatório'),
    stage:       Yup.mixed().required('Campo obrigatório'),
    value:       Yup.number().min(0).nullable(),
})

// ─── Componente: Funil Visual ─────────────────────────────────────────────────
const SalesFunnel = ({ leads, onStageClick, activeStage }) => {
    const stats = useMemo(() => {
        return STAGES.map((s) => {
            const items = leads.filter((l) => l.stage === s.id)
            return {
                ...s,
                count: items.length,
                total: items.reduce((acc, l) => acc + (l.value || 0), 0),
            }
        })
    }, [leads])

    return (
        <div className='flex flex-col gap-1.5 py-1 select-none'>
            {stats.map((stage) => {
                const isActive = activeStage === stage.id
                const barW = stage.width  // ex: '100%', '85%', …

                return (
                    <button
                        key={stage.id}
                        onClick={() => onStageClick(isActive ? null : stage.id)}
                        className='w-full flex flex-col gap-1 focus:outline-none group'
                    >
                        {/* Label row — sempre full width, nunca cortada */}
                        <div className='flex items-center justify-between w-full px-0.5'>
                            <div className='flex items-center gap-1.5'>
                                <span
                                    className='w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-125'
                                    style={{ background: stage.color }}
                                />
                                <span className={`text-xs font-semibold leading-none transition-colors ${
                                    isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                    {stage.label}
                                </span>
                                <span
                                    className='text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none'
                                    style={{
                                        background: isActive ? stage.color : stage.light,
                                        color:      isActive ? '#fff'       : stage.color,
                                    }}
                                >
                                    {stage.count}
                                </span>
                            </div>
                            <span className={`text-xs font-bold leading-none tabular-nums ${
                                isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {stage.total > 0 ? fmt(stage.total) : '—'}
                            </span>
                        </div>

                        {/* Barra colorida — encolhe para comunicar o funil */}
                        <div className='w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700/50 overflow-hidden'>
                            <div
                                className='h-full rounded-full transition-all duration-300'
                                style={{
                                    width: barW,
                                    background: isActive
                                        ? stage.color
                                        : `linear-gradient(90deg, ${stage.color}cc, ${stage.color}66)`,
                                    boxShadow: isActive ? `0 0 8px ${stage.color}88` : 'none',
                                }}
                            />
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

// ─── Componente: Funil Visual (imagem) ───────────────────────────────────────
const VisualFunnel = ({ leads }) => {
    const stats = useMemo(() => {
        return STAGES.map((s) => {
            const items = leads.filter((l) => l.stage === s.id)
            return {
                ...s,
                count: items.length,
                total: items.reduce((acc, l) => acc + (l.value || 0), 0),
            }
        })
    }, [leads])

    const STEP_H = 44

    return (
        <div className='flex flex-col items-center gap-0 select-none'>
            <svg
                viewBox='0 0 240 232'
                width='100%'
                style={{ display: 'block' }}
            >
                {stats.map((stage, i) => {
                    const topPct  = parseInt(stage.width) / 100
                    const nextPct = i < STAGES.length - 1
                        ? parseInt(STAGES[i + 1].width) / 100
                        : parseInt(stage.width) / 100 - 0.15

                    const W = 240
                    const y = i * STEP_H

                    const x1 = W * (1 - topPct)  / 2
                    const x2 = W * (1 + topPct)  / 2
                    const x3 = W * (1 + nextPct) / 2
                    const x4 = W * (1 - nextPct) / 2

                    const midX = W / 2
                    const midY = y + STEP_H / 2

                    // largura visível no meio do trapézio
                    const midPct = (topPct + nextPct) / 2
                    const visibleW = W * midPct

                    return (
                        <g key={stage.id}>
                            {/* Trapézio */}
                            <polygon
                                points={`${x1},${y} ${x2},${y} ${x3},${y + STEP_H} ${x4},${y + STEP_H}`}
                                fill={stage.color}
                                opacity='0.88'
                            />
                            {/* Separador */}
                            {i < STAGES.length - 1 && (
                                <line
                                    x1={x4} y1={y + STEP_H}
                                    x2={x3} y2={y + STEP_H}
                                    stroke='white' strokeWidth='1.5'
                                />
                            )}
                            {/* Quantidade — centralizada no trapézio */}
                            <text
                                x={midX}
                                y={midY - 4}
                                textAnchor='middle'
                                dominantBaseline='middle'
                                fontSize='15'
                                fontWeight='800'
                                fill='white'
                                opacity='0.95'
                            >
                                {stage.count}
                            </text>
                            {/* Valor — linha abaixo, também centralizado */}
                            <text
                                x={midX}
                                y={midY + 12}
                                textAnchor='middle'
                                dominantBaseline='middle'
                                fontSize='8.5'
                                fontWeight='700'
                                fill='white'
                                opacity='0.9'
                            >
                                {stage.total > 0 ? fmt(stage.total) : '—'}
                            </text>
                        </g>
                    )
                })}
            </svg>

            {/* Legenda */}
            <div className='w-full grid grid-cols-1 gap-y-1 mt-3'>
                {stats.map((stage) => (
                    <div key={stage.id} className='flex items-center gap-2'>
                        <span
                            className='w-3 h-3 rounded-sm flex-shrink-0'
                            style={{ background: stage.color, opacity: 0.88 }}
                        />
                        <span className='text-xs text-gray-600 dark:text-gray-300 leading-none'>
                            {stage.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Componente: Badge de Etapa ───────────────────────────────────────────────
const StageBadge = ({ stageId }) => {
    const s = stageInfo(stageId)
    if (!s) return null
    return (
        <span
            className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold'
            style={{ background: s.light, color: s.color }}
        >
            <span className='w-1.5 h-1.5 rounded-full' style={{ background: s.color }} />
            {s.label}
        </span>
    )
}

// ─── Componente: Card Kanban de Lead ─────────────────────────────────────────
const LeadKanbanCard = ({ lead, onEdit, onDelete, onContract, onMove, stageIndex }) => {
    const s = stageInfo(lead.stage)
    const canBack    = stageIndex > 0
    const canForward = stageIndex < STAGES.length - 1

    return (
        <KanbanCard>
            {/* Nome + ações */}
            <div className='flex items-start justify-between gap-2 mb-1'>
                <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug'>
                    {lead.patient}
                </p>
                <div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
                    <button
                        onClick={() => onContract(lead)}
                        className='p-1 rounded text-gray-400 hover:text-emerald-500 transition-colors'
                        title='Contrato'
                    ><HiOutlineDocumentText className='text-xs' /></button>
                    <button
                        onClick={() => onEdit(lead)}
                        className='p-1 rounded text-gray-400 hover:text-indigo-500 transition-colors'
                        title='Editar'
                    ><HiOutlinePencil className='text-xs' /></button>
                    <button
                        onClick={() => onDelete(lead)}
                        className='p-1 rounded text-gray-400 hover:text-red-400 transition-colors'
                        title='Excluir'
                    ><HiOutlineTrash className='text-xs' /></button>
                </div>
            </div>

            {/* Descrição */}
            {lead.description && (
                <p className='text-xs text-gray-400 leading-snug mb-2 line-clamp-2'>
                    {lead.description}
                </p>
            )}

            {/* Valor */}
            {lead.value > 0 && (
                <p className='text-sm font-bold mb-2' style={{ color: s?.color }}>
                    {fmt(lead.value)}
                </p>
            )}

            {/* Responsáveis */}
            <div className='flex flex-col gap-0.5 mb-3'>
                {lead.receivedBy && (
                    <p className='text-[10px] text-gray-400 leading-none'>
                        <span className='text-gray-300'>Recebeu · </span>{empName(lead.receivedBy)}
                    </p>
                )}
                {lead.quotedBy && (
                    <p className='text-[10px] text-gray-400 leading-none'>
                        <span className='text-gray-300'>Orçamento · </span>{empName(lead.quotedBy)}
                    </p>
                )}
            </div>

            {/* Mover etapa */}
            <div className='flex items-center justify-between border-t border-gray-100 dark:border-gray-700/40 pt-2 mt-1'>
                <p className='text-[10px] text-gray-300'>{fmtDate(lead.createdAt)}</p>
                <div className='flex gap-1'>
                    {canBack && (
                        <button
                            onClick={() => onMove(lead, STAGES[stageIndex - 1].id)}
                            className='flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-indigo-500 bg-gray-50 dark:bg-gray-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded px-1.5 py-0.5 transition-colors'
                        >
                            <HiOutlineChevronLeft className='text-[10px]' />
                            <span>{STAGES[stageIndex - 1].label}</span>
                        </button>
                    )}
                    {canForward && (
                        <button
                            onClick={() => onMove(lead, STAGES[stageIndex + 1].id)}
                            className='flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-indigo-500 bg-gray-50 dark:bg-gray-700/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded px-1.5 py-0.5 transition-colors'
                        >
                            <span>{STAGES[stageIndex + 1].label}</span>
                            <HiOutlineChevronRight className='text-[10px]' />
                        </button>
                    )}
                </div>
            </div>
        </KanbanCard>
    )
}

// ─── Componente: Visão Kanban ─────────────────────────────────────────────────
const KanbanView = ({ leads, search, onEdit, onDelete, onContract, onMove }) => {
    const filtered = search.trim()
        ? leads.filter((l) =>
            l.patient.toLowerCase().includes(search.toLowerCase()) ||
            l.description?.toLowerCase().includes(search.toLowerCase()) ||
            empName(l.receivedBy).toLowerCase().includes(search.toLowerCase())
        )
        : leads

    return (
        <div className='flex gap-3 overflow-x-auto pb-4 -mx-1 px-1'>
            {STAGES.map((stage, stageIndex) => {
                const cols  = filtered.filter((l) => l.stage === stage.id)
                const total = cols.reduce((a, l) => a + (l.value || 0), 0)

                return (
                    <div key={stage.id} className='flex-shrink-0 w-60'>
                        <KanbanColumn
                            accent={stage.color}
                            accentLight={stage.light}
                            title={stage.label}
                            count={cols.length}
                            emptyLabel='Sem negociações'
                            minHeight='14rem'
                            footer={total > 0 ? (
                                <p className='text-[10px] font-semibold text-center pb-2' style={{ color: stage.color }}>
                                    {fmt(total)}
                                </p>
                            ) : null}
                        >
                            {cols.map((lead) => (
                                <LeadKanbanCard
                                    key={lead.id}
                                    lead={lead}
                                    stageIndex={stageIndex}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onContract={onContract}
                                    onMove={onMove}
                                />
                            ))}
                        </KanbanColumn>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Componente: Modal de Cadastro / Edição ───────────────────────────────────
const LeadModal = ({ isOpen, onClose, initialData, onSave }) => {
    const isEdit = !!initialData?.id

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose} width={600}>
            <Formik
                enableReinitialize
                initialValues={{
                    patient:     initialData?.patient     ?? '',
                    receivedBy:  initialData?.receivedBy  ?? null,
                    quotedBy:    initialData?.quotedBy    ?? null,
                    stage:       initialData?.stage       ?? 'prospeccao',
                    value:       initialData?.value       ?? '',
                    description: initialData?.description ?? '',
                    notes:       initialData?.notes       ?? '',
                }}
                validationSchema={schema}
                onSubmit={(values, { resetForm }) => {
                    onSave(values)
                    resetForm()
                    onClose()
                }}
            >
                {({ errors, touched, values, setFieldValue }) => (
                    <Form>
                        <FormContainer>
                            {/* Header */}
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0'>
                                    <HiOutlineBriefcase className='text-indigo-500 text-xl' />
                                </div>
                                <div>
                                    <h4 className='text-base font-bold text-gray-800 dark:text-gray-100'>
                                        {isEdit ? 'Editar Negociação' : 'Nova Negociação'}
                                    </h4>
                                    <p className='text-xs text-gray-400 mt-0.5'>Registre os detalhes do prospect</p>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                {/* Paciente / Prospect */}
                                <FormItem
                                    label='Nome do Prospect / Paciente'
                                    asterisk
                                    invalid={errors.patient && touched.patient}
                                    errorMessage={errors.patient}
                                >
                                    <Field type='text' name='patient' placeholder='Ex: João da Silva' component={Input} />
                                </FormItem>

                                <div className='grid grid-cols-2 gap-4'>
                                    {/* Quem recebeu o prospect */}
                                    <FormItem
                                        label='Quem recebeu o prospect'
                                        asterisk
                                        invalid={errors.receivedBy && touched.receivedBy}
                                        errorMessage={errors.receivedBy}
                                    >
                                        <Field name='receivedBy'>
                                            {({ field }) => (
                                                <Select
                                                    placeholder='Selecione'
                                                    options={EMPLOYEES}
                                                    value={EMPLOYEES.find((e) => e.value === field.value) || null}
                                                    onChange={(opt) => setFieldValue('receivedBy', opt?.value)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    {/* Quem fez o orçamento */}
                                    <FormItem
                                        label='Quem fez o orçamento'
                                        invalid={errors.quotedBy && touched.quotedBy}
                                        errorMessage={errors.quotedBy}
                                    >
                                        <Field name='quotedBy'>
                                            {({ field }) => (
                                                <Select
                                                    placeholder='Selecione (opcional)'
                                                    options={EMPLOYEES}
                                                    isClearable
                                                    value={EMPLOYEES.find((e) => e.value === field.value) || null}
                                                    onChange={(opt) => setFieldValue('quotedBy', opt?.value ?? null)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    {/* Etapa */}
                                    <FormItem
                                        label='Etapa do Funil'
                                        asterisk
                                        invalid={errors.stage && touched.stage}
                                        errorMessage={errors.stage}
                                    >
                                        <Field name='stage'>
                                            {({ field }) => (
                                                <Select
                                                    placeholder='Selecione a etapa'
                                                    options={STAGE_OPTS}
                                                    value={STAGE_OPTS.find((o) => o.value === field.value) || null}
                                                    onChange={(opt) => setFieldValue('stage', opt?.value)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    {/* Valor */}
                                    <FormItem
                                        label='Valor estimado (R$)'
                                        invalid={errors.value && touched.value}
                                        errorMessage={errors.value}
                                    >
                                        <Field name='value'>
                                            {({ field }) => (
                                                <Input
                                                    type='number'
                                                    placeholder='0,00'
                                                    prefix={<span className='text-gray-400 text-sm'>R$</span>}
                                                    {...field}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Descrição */}
                                <FormItem label='Descrição do serviço'>
                                    <Field
                                        type='text'
                                        name='description'
                                        placeholder='Ex: Implante dentário superior'
                                        component={Input}
                                    />
                                </FormItem>

                                {/* Observações */}
                                <FormItem label='Observações'>
                                    <Field name='notes'>
                                        {({ field }) => (
                                            <textarea
                                                {...field}
                                                rows={3}
                                                placeholder='Notas internas sobre a negociação…'
                                                className='w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300'
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </div>

                            {/* Ações */}
                            <div className='flex items-center justify-end gap-3 mt-6'>
                                <Button type='button' onClick={onClose}>Cancelar</Button>
                                <Button variant='solid' type='submit' icon={<HiOutlineCheckCircle />}>
                                    {isEdit ? 'Salvar alterações' : 'Registrar negociação'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
const LeadsIndex = () => {
    const [leads, setLeads] = useState(INITIAL_LEADS)
    const [activeStage, setActiveStage] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editData, setEditData] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [contractLead, setContractLead] = useState(null)
    const [viewMode, setViewMode] = useState('list')
    const [search, setSearch] = useState('')
    const [sortField, setSortField] = useState('createdAt')
    const [sortAsc, setSortAsc] = useState(false)

    // ── Stats Gerais ───────────────────────────────────────────────────────────
    const totalValue    = leads.reduce((a, l) => a + (l.value || 0), 0)
    const closedLeads   = leads.filter((l) => l.stage === 'fechado')
    const closedValue   = closedLeads.reduce((a, l) => a + (l.value || 0), 0)
    const convRate      = leads.length > 0 ? Math.round((closedLeads.length / leads.length) * 100) : 0
    const avgTicket     = leads.filter(l => l.value > 0).length > 0
        ? totalValue / leads.filter(l => l.value > 0).length
        : 0

    // ── Filtro + Sort ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        let list = activeStage ? leads.filter((l) => l.stage === activeStage) : leads
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(
                (l) =>
                    l.patient.toLowerCase().includes(q) ||
                    l.description.toLowerCase().includes(q) ||
                    empName(l.receivedBy).toLowerCase().includes(q) ||
                    empName(l.quotedBy).toLowerCase().includes(q),
            )
        }
        return [...list].sort((a, b) => {
            let va = a[sortField] ?? ''
            let vb = b[sortField] ?? ''
            if (typeof va === 'string') va = va.toLowerCase()
            if (typeof vb === 'string') vb = vb.toLowerCase()
            if (va < vb) return sortAsc ? -1 : 1
            if (va > vb) return sortAsc ? 1 : -1
            return 0
        })
    }, [leads, activeStage, search, sortField, sortAsc])

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSave = (values) => {
        if (editData?.id) {
            setLeads((prev) =>
                prev.map((l) =>
                    l.id === editData.id
                        ? { ...l, ...values, value: Number(values.value) || 0 }
                        : l,
                ),
            )
            toast.push(<Notification type='success' title='Negociação atualizada'>Dados salvos com sucesso.</Notification>)
        } else {
            const newLead = {
                ...values,
                id: Date.now(),
                value: Number(values.value) || 0,
                createdAt: new Date().toISOString().slice(0, 10),
            }
            setLeads((prev) => [newLead, ...prev])
            toast.push(<Notification type='success' title='Negociação registrada'>Prospect adicionado ao funil.</Notification>)
        }
        setEditData(null)
    }

    const handleDelete = (id) => {
        setLeads((prev) => prev.filter((l) => l.id !== id))
        setDeleteTarget(null)
        toast.push(<Notification type='info' title='Removido'>Negociação excluída do funil.</Notification>)
    }

    const openEdit = (lead) => {
        setEditData(lead)
        setModalOpen(true)
    }

    const handleMoveStage = (lead, newStageId) => {
        setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, stage: newStageId } : l))
        toast.push(
            <Notification type='success' title='Etapa atualizada'>
                {lead.patient} movido para <strong>{stageInfo(newStageId)?.label}</strong>.
            </Notification>
        )
    }

    const openContract = (lead) => setContractLead({
        ...lead,
        receivedByName: empName(lead.receivedBy),
        quotedByName:   empName(lead.quotedBy),
    })

    const toggleSort = (field) => {
        if (sortField === field) setSortAsc((p) => !p)
        else { setSortField(field); setSortAsc(true) }
    }

    const SortIcon = ({ field }) =>
        sortField === field
            ? sortAsc
                ? <HiOutlineChevronUp className='inline ml-1 text-indigo-500' />
                : <HiOutlineChevronDown className='inline ml-1 text-indigo-500' />
            : null

    return (
        <div className='space-y-6'>

            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className='flex items-center justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                        Funil de Vendas
                    </h3>
                    <p className='text-sm text-gray-400 mt-0.5'>
                        <span className='font-semibold text-indigo-500'>{leads.length}</span> negociações em andamento
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    {/* Toggle visão */}
                    <div className='flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-0.5'>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <HiOutlineViewList className='text-sm' /> Lista
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                viewMode === 'kanban'
                                    ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <HiOutlineViewBoards className='text-sm' /> Kanban
                        </button>
                    </div>
                    <CreateButton onClick={() => { setEditData(null); setModalOpen(true) }}>
                        Nova Negociação
                    </CreateButton>
                </div>
            </div>

            {/* ── Cards de Resumo ─────────────────────────────────────────────── */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {[
                    {
                        label: 'Valor total no funil',
                        value: fmt(totalValue),
                        sub: `${leads.length} negociações`,
                        icon: <HiOutlineCurrencyDollar className='text-base' />,
                        color: '#6366f1',
                    },
                    {
                        label: 'Negócios fechados',
                        value: fmt(closedValue),
                        sub: `${closedLeads.length} contratos`,
                        icon: <HiOutlineCheckCircle className='text-base' />,
                        color: '#10b981',
                    },
                    {
                        label: 'Taxa de conversão',
                        value: `${convRate}%`,
                        sub: 'prospect → fechado',
                        icon: <HiOutlineTrendingUp className='text-base' />,
                        color: '#f59e0b',
                    },
                    {
                        label: 'Ticket médio',
                        value: fmt(avgTicket),
                        sub: 'por negociação',
                        icon: <HiOutlineUserGroup className='text-base' />,
                        color: '#8b5cf6',
                    },
                ].map((card) => (
                    <div
                        key={card.label}
                        className='flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden'
                        style={{ boxShadow: `inset 3px 0 0 ${card.color}` }}
                    >
                        <div
                            className='w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0'
                            style={{ background: card.color + '18', color: card.color }}
                        >
                            {card.icon}
                        </div>
                        <div className='min-w-0'>
                            <p className='text-[11px] text-gray-400 leading-none truncate mb-1'>{card.label}</p>
                            <p className='text-sm font-bold leading-none' style={{ color: card.color }}>{card.value}</p>
                            <p className='text-[10px] text-gray-400 mt-0.5 leading-none'>{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Barra de busca (compartilhada entre os dois modos) ─────────── */}
            <div className='flex items-center gap-3'>
                <div className='relative flex-1 max-w-sm'>
                    <HiOutlineFilter className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Buscar por nome, serviço ou responsável…'
                        className='w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 placeholder-gray-300'
                    />
                </div>
                {viewMode === 'list' && activeStage && (
                    <StageBadge stageId={activeStage} />
                )}
                <span className='text-xs text-gray-400 whitespace-nowrap'>
                    {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
                </span>
            </div>

            {/* ── Visão Lista ─────────────────────────────────────────────────── */}
            {viewMode === 'list' && (
                <div className='flex gap-6 items-start'>

                    {/* Funil lateral */}
                    <Card className='w-64 flex-shrink-0'>
                        <div className='mb-3 flex items-center justify-between'>
                            <p className='text-sm font-bold text-gray-700 dark:text-gray-200'>Etapas</p>
                            {activeStage && (
                                <button
                                    onClick={() => setActiveStage(null)}
                                    className='text-xs text-indigo-500 hover:underline flex items-center gap-0.5'
                                >
                                    <HiOutlineX className='text-xs' /> limpar
                                </button>
                            )}
                        </div>
                        <SalesFunnel leads={leads} onStageClick={setActiveStage} activeStage={activeStage} />
                        <p className='text-center text-xs text-gray-400 mt-2'>Clique para filtrar</p>
                        <div className='border-t border-gray-100 dark:border-gray-700 mt-4 pt-4'>
                            <VisualFunnel leads={leads} />
                        </div>
                    </Card>

                    {/* Tabela */}
                    <div className='flex-1 min-w-0'>
                        <Card>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='border-b border-gray-100 dark:border-gray-700'>
                                            {[
                                                { field: 'patient',    label: 'Prospect / Paciente' },
                                                { field: 'receivedBy', label: 'Recebeu' },
                                                { field: 'quotedBy',   label: 'Orçamento' },
                                                { field: 'stage',      label: 'Etapa' },
                                                { field: 'value',      label: 'Valor' },
                                                { field: 'createdAt',  label: 'Data' },
                                            ].map(({ field, label }) => (
                                                <th
                                                    key={field}
                                                    onClick={() => toggleSort(field)}
                                                    className='text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 cursor-pointer hover:text-indigo-500 transition-colors whitespace-nowrap'
                                                >
                                                    {label}<SortIcon field={field} />
                                                </th>
                                            ))}
                                            <th className='pb-2 w-16' />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className='text-center py-10 text-gray-300 dark:text-gray-600 text-sm'>
                                                    Nenhuma negociação encontrada
                                                </td>
                                            </tr>
                                        )}
                                        {filtered.map((lead, idx) => (
                                            <tr
                                                key={lead.id}
                                                className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors ${
                                                    idx % 2 !== 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''
                                                }`}
                                            >
                                                <td className='py-3 pr-4'>
                                                    <div className='font-semibold text-gray-800 dark:text-gray-100 leading-tight'>{lead.patient}</div>
                                                    {lead.description && (
                                                        <div className='text-xs text-gray-400 mt-0.5 truncate max-w-[180px]'>{lead.description}</div>
                                                    )}
                                                </td>
                                                <td className='py-3 pr-4 text-gray-600 dark:text-gray-300 whitespace-nowrap'>{empName(lead.receivedBy)}</td>
                                                <td className='py-3 pr-4 text-gray-600 dark:text-gray-300 whitespace-nowrap'>
                                                    {lead.quotedBy ? empName(lead.quotedBy) : <span className='text-gray-300 dark:text-gray-600'>—</span>}
                                                </td>
                                                <td className='py-3 pr-4'><StageBadge stageId={lead.stage} /></td>
                                                <td className='py-3 pr-4 font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap'>
                                                    {lead.value > 0 ? fmt(lead.value) : <span className='text-gray-300 font-normal'>—</span>}
                                                </td>
                                                <td className='py-3 pr-4 text-gray-400 whitespace-nowrap'>{fmtDate(lead.createdAt)}</td>
                                                <td className='py-3'>
                                                    <div className='flex items-center gap-1 justify-end'>
                                                        <button onClick={() => openContract(lead)} className='p-1.5 rounded-lg text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors' title='Gerar Contrato'>
                                                            <HiOutlineDocumentText />
                                                        </button>
                                                        <button onClick={() => openEdit(lead)} className='p-1.5 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors' title='Editar'>
                                                            <HiOutlinePencil />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget(lead)} className='p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors' title='Excluir'>
                                                            <HiOutlineTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ── Visão Kanban ─────────────────────────────────────────────────── */}
            {viewMode === 'kanban' && (
                <KanbanView
                    leads={leads}
                    search={search}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                    onContract={openContract}
                    onMove={handleMoveStage}
                />
            )}

            {/* ── Modal de Contrato ──────────────────────────────────────────────── */}
            <ContractModal
                isOpen={!!contractLead}
                onClose={() => setContractLead(null)}
                lead={contractLead}
            />

            {/* ── Modal de Cadastro/Edição ─────────────────────────────────────── */}
            <LeadModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditData(null) }}
                initialData={editData}
                onSave={handleSave}
            />

            {/* ── Confirm Delete ──────────────────────────────────────────────── */}
            <Dialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onRequestClose={() => setDeleteTarget(null)}
                width={420}
            >
                <div className='flex flex-col items-center text-center gap-4 py-2'>
                    <div className='w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center'>
                        <HiOutlineExclamation className='text-red-500 text-3xl' />
                    </div>
                    <div>
                        <p className='text-base font-bold text-gray-800 dark:text-gray-100'>Excluir negociação?</p>
                        <p className='text-sm text-gray-400 mt-1'>
                            <span className='font-semibold text-gray-600 dark:text-gray-300'>{deleteTarget?.patient}</span> será removido do funil. Esta ação não pode ser desfeita.
                        </p>
                    </div>
                    <div className='flex gap-3 mt-2'>
                        <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
                        <Button variant='solid' className='bg-red-500 hover:bg-red-600 border-red-500' onClick={() => handleDelete(deleteTarget.id)}>
                            Sim, excluir
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default LeadsIndex
