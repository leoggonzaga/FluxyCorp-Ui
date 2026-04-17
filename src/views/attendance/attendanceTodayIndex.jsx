import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    HiOutlineClock,
    HiOutlineUsers,
    HiOutlineCheckCircle,
    HiOutlineLightningBolt,
    HiOutlinePhone,
    HiOutlineChevronDown,
    HiOutlinePlay,
    HiOutlineEye,
    HiOutlineCalendar,
    HiOutlineClipboardList,
} from 'react-icons/hi'
import { getInitials, getAvatarColor } from '@/components/shared/listPatterns/patternUtils'

// ─── Mock ────────────────────────────────────────────────────────────────────

const MOCK = {
    inProgress: [
        { id: 'ip1', patientId: 5, name: 'Lucas Costa',       time: '09:30', service: 'Consulta Clínica',   professional: 'Dr. Carlos Andrade',  startedAt: '09:35', duration: '28 min', phone: '(11) 96543-2109' },
    ],
    waitingRoom: [
        { id: 'wr1', patientId: 4, name: 'Carla Mendes',      time: '09:45', service: 'Limpeza Dental',      professional: 'Dra. Ana Souza',      arrivalTime: '09:40', waitingTime: '13 min', phone: '(11) 91234-5678' },
        { id: 'wr2', patientId: 6, name: 'Ricardo Bastos',    time: '10:00', service: 'Avaliação Inicial',   professional: 'Dr. Bruno Lima',      arrivalTime: '09:55', waitingTime: '8 min',  phone: '(11) 98877-6655' },
    ],
    scheduled: [
        { id: 'sc1', patientId: 1, name: 'João Silva',        time: '10:30', service: 'Consulta Clínica',   professional: 'Dr. Carlos Andrade',  phone: '(11) 98765-4321' },
        { id: 'sc2', patientId: 2, name: 'Maria Santos',      time: '11:00', service: 'Canal Radicular',     professional: 'Dra. Ana Souza',      phone: '(11) 99876-5432' },
        { id: 'sc3', patientId: 3, name: 'Pedro Oliveira',    time: '11:30', service: 'Extração Simples',    professional: 'Dr. Bruno Lima',      phone: '(11) 97654-3210' },
        { id: 'sc4', patientId: 1, name: 'Fernanda Lima',     time: '14:00', service: 'Profilaxia Dental',   professional: 'Dra. Ana Souza',      phone: '(11) 92233-4455' },
        { id: 'sc5', patientId: 2, name: 'Roberto Gomes',     time: '14:30', service: 'Restauração Resina',  professional: 'Dr. Carlos Andrade',  phone: '(11) 93344-5566' },
    ],
    completed: [
        { id: 'co1', patientId: 6, name: 'Ana Lima',          time: '08:00', service: 'Limpeza Dental',      professional: 'Dra. Ana Souza',      completedAt: '08:42', duration: '42 min' },
        { id: 'co2', patientId: 1, name: 'Felipe Alves',      time: '08:45', service: 'Avaliação Inicial',   professional: 'Dr. Bruno Lima',      completedAt: '09:15', duration: '30 min' },
        { id: 'co3', patientId: 3, name: 'Juliana Ferreira',  time: '09:00', service: 'Aplicação de Flúor',  professional: 'Dra. Ana Souza',      completedAt: '09:22', duration: '22 min' },
    ],
}

// ─── Section config ──────────────────────────────────────────────────────────

const SECTIONS = [
    {
        key:        'inProgress',
        title:      'Em Atendimento',
        Icon:       HiOutlineLightningBolt,
        accent:     '#f59e0b',
        pill:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        rowHover:   'hover:bg-amber-50/60 dark:hover:bg-amber-900/10',
        actionLabel: 'Abrir Atendimento',
        actionStyle: 'bg-amber-500 hover:bg-amber-600 text-white',
        detail: (p) => (
            <span className='flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400'>
                <HiOutlineClock size={12} />
                Iniciado às {p.startedAt} · <span className='font-bold'>{p.duration}</span> em curso
            </span>
        ),
    },
    {
        key:        'waitingRoom',
        title:      'Sala de Espera',
        Icon:       HiOutlineUsers,
        accent:     '#0ea5e9',
        pill:       'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        rowHover:   'hover:bg-sky-50/60 dark:hover:bg-sky-900/10',
        actionLabel: 'Iniciar Atendimento',
        actionStyle: 'bg-sky-500 hover:bg-sky-600 text-white',
        detail: (p) => (
            <span className='flex items-center gap-1 text-[11px] font-medium text-sky-600 dark:text-sky-400'>
                <HiOutlineClock size={12} />
                Chegou às {p.arrivalTime} · aguardando <span className='font-bold'>{p.waitingTime}</span>
            </span>
        ),
    },
    {
        key:        'scheduled',
        title:      'Agendados',
        Icon:       HiOutlineCalendar,
        accent:     '#6366f1',
        pill:       'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        rowHover:   'hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10',
        actionLabel: 'Ver Agendamento',
        actionStyle: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400',
        detail: (p) => (
            <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500'>
                <HiOutlineClock size={12} />
                Marcado para <span className='font-semibold text-indigo-500'>{p.time}</span>
            </span>
        ),
    },
    {
        key:        'completed',
        title:      'Atendidos Hoje',
        Icon:       HiOutlineCheckCircle,
        accent:     '#10b981',
        pill:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        rowHover:   'hover:bg-emerald-50/40 dark:hover:bg-emerald-900/10',
        actionLabel: 'Ver Prontuário',
        actionStyle: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400',
        detail: (p) => (
            <span className='flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400'>
                <HiOutlineCheckCircle size={12} />
                Concluído às {p.completedAt} · <span className='font-bold'>{p.duration}</span>
            </span>
        ),
    },
]

// ─── Patient row ─────────────────────────────────────────────────────────────

const PatientRow = ({ patient, section, onAction, onViewRecord }) => (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors duration-150 ${section.rowHover}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${getAvatarColor(patient.name)}`}>
            {getInitials(patient.name)}
        </div>

        <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate leading-snug'>
                {patient.name}
            </p>
            <p className='text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5'>
                {patient.service}
                <span className='mx-1.5 text-gray-200 dark:text-gray-700'>·</span>
                {patient.professional}
            </p>
        </div>

        <div className='hidden md:block flex-shrink-0'>
            {section.detail(patient)}
        </div>

        {patient.phone && (
            <span className='hidden lg:flex items-center gap-1 text-[11px] text-gray-300 dark:text-gray-600 flex-shrink-0'>
                <HiOutlinePhone size={11} />
                {patient.phone}
            </span>
        )}

        <div className='flex items-center gap-1.5 flex-shrink-0'>
            <button
                onClick={() => onViewRecord?.(patient)}
                title='Ver Prontuário'
                className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150 whitespace-nowrap border border-indigo-100 dark:border-indigo-800/40'
            >
                <HiOutlineClipboardList size={13} />
                <span className='hidden sm:inline'>Prontuário</span>
            </button>

            <button
                onClick={() => onAction?.(patient)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 whitespace-nowrap ${section.actionStyle}`}
            >
                {section.key === 'inProgress' && <HiOutlinePlay size={12} />}
                {section.key === 'waitingRoom' && <HiOutlinePlay size={12} />}
                {(section.key === 'scheduled' || section.key === 'completed') && <HiOutlineEye size={12} />}
                {section.actionLabel}
            </button>
        </div>
    </div>
)

// ─── Section card ─────────────────────────────────────────────────────────────

const COLLAPSED_LIMIT = 3

const SectionCard = ({ section, patients, onAction, onViewRecord }) => {
    const [expanded, setExpanded] = useState(section.key !== 'completed')
    const [showAll, setShowAll]   = useState(false)

    const visible = showAll ? patients : patients.slice(0, COLLAPSED_LIMIT)
    const hidden  = patients.length - COLLAPSED_LIMIT
    const Icon    = section.Icon

    return (
        <div className='bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden'>
            {/* Section header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className='w-full flex items-center gap-3 px-5 py-3.5 text-left'
                style={{ borderBottom: expanded ? `2px solid ${section.accent}18` : 'none' }}
            >
                <div
                    className='w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0'
                    style={{ background: section.accent + '18' }}
                >
                    <Icon size={16} style={{ color: section.accent }} />
                </div>

                <span className='font-bold text-sm text-gray-700 dark:text-gray-200 flex-1'>
                    {section.title}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${section.pill}`}>
                    {patients.length}
                </span>

                <HiOutlineChevronDown
                    size={16}
                    className='text-gray-300 dark:text-gray-600 transition-transform duration-200 ml-1'
                    style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>

            {/* Rows */}
            {expanded && (
                <div className='px-2 py-2'>
                    {patients.length === 0 ? (
                        <p className='text-center text-xs text-gray-300 dark:text-gray-600 py-6'>
                            Nenhum paciente neste status
                        </p>
                    ) : (
                        <>
                            <div className='divide-y divide-gray-50 dark:divide-gray-700/30'>
                                {visible.map((p) => (
                                    <PatientRow key={p.id} patient={p} section={section} onAction={onAction} onViewRecord={onViewRecord} />
                                ))}
                            </div>

                            {!showAll && hidden > 0 && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className='w-full mt-1 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                                >
                                    + {hidden} paciente{hidden > 1 ? 's' : ''} agendado{hidden > 1 ? 's' : ''}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const today = new Date()
const dateLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).replace(/^\w/, (c) => c.toUpperCase())

const total = Object.values(MOCK).reduce((acc, arr) => acc + arr.length, 0)

const AttendanceTodayIndex = () => {
    const navigate = useNavigate()

    const handleAction = (patient) => {
        if (patient.id.startsWith('ip') || patient.id.startsWith('wr')) {
            navigate(`/attendance?patient=${patient.id}`)
        }
    }

    const handleViewRecord = (patient) => {
        navigate(`/patients?id=${patient.patientId}`, {
            state: { fromLabel: 'Prontuário do Dia' },
        })
    }

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div>
                    <h3 className='text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                        Prontuário — Hoje
                    </h3>
                    <p className='text-sm text-gray-400 dark:text-gray-500 mt-0.5'>{dateLabel}</p>
                </div>

                {/* Summary chips */}
                <div className='flex items-center gap-2 flex-wrap'>
                    {SECTIONS.map((s) => {
                        const count = MOCK[s.key].length
                        const Icon  = s.Icon
                        return (
                            <div
                                key={s.key}
                                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold'
                                style={{
                                    background:   s.accent + '12',
                                    borderColor:  s.accent + '30',
                                    color:        s.accent,
                                }}
                            >
                                <Icon size={13} />
                                <span>{count}</span>
                                <span className='hidden sm:inline font-medium opacity-80'>{s.title}</span>
                            </div>
                        )
                    })}
                    <div className='px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'>
                        {total} total
                    </div>
                </div>
            </div>

            {/* Progress bar: proporção dos status */}
            <div className='flex h-1.5 rounded-full overflow-hidden gap-0.5'>
                {SECTIONS.map((s) => {
                    const pct = total > 0 ? (MOCK[s.key].length / total) * 100 : 0
                    return pct > 0 ? (
                        <div
                            key={s.key}
                            className='h-full rounded-full transition-all'
                            style={{ width: `${pct}%`, background: s.accent }}
                        />
                    ) : null
                })}
            </div>

            {/* Sections */}
            <div className='space-y-3'>
                {SECTIONS.map((section) => (
                    <SectionCard
                        key={section.key}
                        section={section}
                        patients={MOCK[section.key]}
                        onAction={handleAction}
                        onViewRecord={handleViewRecord}
                    />
                ))}
            </div>
        </div>
    )
}

export default AttendanceTodayIndex
