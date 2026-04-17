import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCenter,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge, Notification, toast } from '@/components/ui'
import { KanbanCard, KanbanColumn } from '@/components/shared'
import {
    HiOutlinePhone,
    HiOutlineClock,
    HiOutlineCheckCircle,
    HiOutlineX,
    HiOutlineDocument,
    HiOutlineUsers,
    HiOutlineFilter,
    HiOutlineChevronUp,
    HiOutlineClipboardList,
} from 'react-icons/hi'

const columns = [
    { key: 'scheduled',   title: 'Agendado',         icon: HiOutlineClock,        accent: '#6366f1', accentLight: 'rgba(99,102,241,0.08)',  dot: 'bg-indigo-400' },
    { key: 'waitingRoom', title: 'Sala de Espera',   icon: HiOutlineUsers,        accent: '#0ea5e9', accentLight: 'rgba(14,165,233,0.08)',  dot: 'bg-sky-400' },
    { key: 'inProgress',  title: 'Em Atendimento',  icon: HiOutlinePhone,        accent: '#f59e0b', accentLight: 'rgba(245,158,11,0.08)',  dot: 'bg-amber-400' },
    { key: 'completed',   title: 'Concluído',        icon: HiOutlineCheckCircle,  accent: '#10b981', accentLight: 'rgba(16,185,129,0.08)',  dot: 'bg-emerald-400' },
    { key: 'pendingDocs', title: 'Doc. Pendente',    icon: HiOutlineDocument,     accent: '#f97316', accentLight: 'rgba(249,115,22,0.08)',  dot: 'bg-orange-400' },
    { key: 'cancelled',   title: 'Cancelado',        icon: HiOutlineX,            accent: '#ef4444', accentLight: 'rgba(239,68,68,0.08)',   dot: 'bg-rose-400' },
]

const AppointmentCard = ({ appointment, dragStyle, dragAttributes, dragListeners, dragRef, isDragging, onViewRecord }) => {
    return (
        <KanbanCard
            dragRef={dragRef}
            dragAttributes={dragAttributes}
            dragListeners={dragListeners}
            dragStyle={dragStyle}
            isDragging={isDragging}
        >
            <div className='flex items-start justify-between gap-2'>
                <p className='font-semibold text-gray-800 text-sm leading-tight'>{appointment.patientName}</p>
                <span className='text-[11px] font-medium text-gray-400 whitespace-nowrap mt-0.5'>{appointment.time}</span>
            </div>

            <div className='mt-2 space-y-1'>
                <div className='flex items-center gap-1.5'>
                    <span className='w-1 h-1 rounded-full bg-gray-300'></span>
                    <span className='text-[11px] text-gray-500'>{appointment.service}</span>
                </div>
                <div className='flex items-center gap-1.5'>
                    <span className='w-1 h-1 rounded-full bg-gray-300'></span>
                    <span className='text-[11px] text-gray-500'>{appointment.professional}</span>
                </div>
            </div>

            <div className='flex items-center gap-1 mt-2 pt-2 border-t border-gray-100'>
                <HiOutlinePhone className='w-3 h-3 text-gray-300' />
                <span className='text-[11px] text-gray-400'>{appointment.phone}</span>
            </div>

            {appointment.arrivalTime && (
                <div className='mt-2 px-2 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[11px] text-sky-700'>
                    <span className='font-semibold'>Chegada: </span>{appointment.arrivalTime}
                </div>
            )}

            {appointment.waitingTime && (
                <div className='mt-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700 flex items-center gap-1'>
                    <HiOutlineClock className='w-3.5 h-3.5' />
                    <span className='font-semibold'>Espera: </span>{appointment.waitingTime}
                </div>
            )}

            {appointment.reason && (
                <div className='mt-2 px-2 py-1 rounded-lg bg-rose-50 border border-rose-100 text-[11px] text-rose-700'>
                    <span className='font-semibold'>Motivo: </span>{appointment.reason}
                </div>
            )}

            {appointment.pendingDoc && (
                <div className='mt-2 px-2 py-1 rounded-lg bg-orange-50 border border-orange-100 text-[11px] text-orange-700'>
                    <span className='font-semibold'>Pendente: </span>{appointment.pendingDoc}
                </div>
            )}

            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onViewRecord?.(appointment) }}
                className='mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-600 text-[11px] font-semibold transition-colors duration-150'
            >
                <HiOutlineClipboardList size={13} />
                Ver Prontuário
            </button>
        </KanbanCard>
    )
}

const SortableAppointmentCard = ({ appointment, onViewRecord }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: appointment.id,
        data: { type: 'appointment' },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
    }

    return (
        <AppointmentCard
            appointment={appointment}
            dragStyle={style}
            dragAttributes={attributes}
            dragListeners={listeners}
            dragRef={setNodeRef}
            isDragging={isDragging}
            onViewRecord={onViewRecord}
        />
    )
}

const findColumnByItemId = (appointments, itemId) => {
    const keys = Object.keys(appointments)
    for (const key of keys) {
        if (appointments[key].some((item) => item.id === itemId)) {
            return key
        }
    }
    return null
}

const Column = ({ column, items, onViewRecord }) => {
    const { setNodeRef, isOver } = useDroppable({ id: column.key })

    return (
        <KanbanColumn
            columnRef={setNodeRef}
            isOver={isOver}
            accent={column.accent}
            accentLight={column.accentLight}
            icon={column.icon}
            title={column.title}
            count={items.length}
            minHeight='18rem'
        >
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                {items.map((appointment) => (
                    <SortableAppointmentCard key={appointment.id} appointment={appointment} onViewRecord={onViewRecord} />
                ))}
            </SortableContext>
        </KanbanColumn>
    )
}

const AppointmentFlowIndex = () => {
    const navigate = useNavigate()

    const handleViewRecord = (appointment) => {
        navigate(`/patients?id=${appointment.patientId}`, {
            state: { fromLabel: 'Fluxo de Atendimento' },
        })
    }

    const [appointments, setAppointments] = useState({
        scheduled: [
            { id: '1', patientId: 1, patientName: 'João Silva',     phone: '(11) 98765-4321', time: '10:00', service: 'Consulta',  professional: 'Dr. Carlos' },
            { id: '2', patientId: 2, patientName: 'Maria Santos',   phone: '(11) 99876-5432', time: '10:30', service: 'Limpeza',   professional: 'Dra. Ana' },
            { id: '3', patientId: 3, patientName: 'Pedro Oliveira', phone: '(11) 97654-3210', time: '11:00', service: 'Avaliação', professional: 'Dr. Bruno' },
        ],
        waitingRoom: [
            { id: '9', patientId: 4, patientName: 'Carla Mendes',  phone: '(11) 91234-5678', time: '09:45', service: 'Consulta', professional: 'Dr. Carlos', arrivalTime: '09:50', waitingTime: '8 min' },
        ],
        inProgress: [
            { id: '4', patientId: 5, patientName: 'Lucas Costa',   phone: '(11) 96543-2109', time: '09:30', service: 'Consulta', professional: 'Dr. Carlos' },
        ],
        completed: [
            { id: '5', patientId: 6, patientName: 'Ana Lima',      phone: '(11) 95432-1098', time: '08:00', service: 'Limpeza',   professional: 'Dra. Ana' },
            { id: '6', patientId: 1, patientName: 'Felipe Alves',  phone: '(11) 94321-0987', time: '08:45', service: 'Avaliação', professional: 'Dr. Bruno' },
        ],
        cancelled: [
            { id: '7', patientId: 2, patientName: 'Roberto Gomes', phone: '(11) 93210-9876', time: '14:00', service: 'Consulta', professional: 'Dr. Carlos', reason: 'Cancelamento do paciente' },
        ],
        pendingDocs: [
            { id: '8', patientId: 3, patientName: 'Juliana Ferreira', phone: '(11) 92109-8765', time: '09:00', service: 'Consulta', professional: 'Dra. Ana', pendingDoc: 'Receituário' },
        ],
    })

    const [visibleColumnsState, setVisibleColumnsState] = useState({
        scheduled: true,
        waitingRoom: true,
        inProgress: true,
        completed: true,
        pendingDocs: true,
        cancelled: true,
    })

    const [showFilters, setShowFilters] = useState(false)

    const [activeId, setActiveId] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    )

    const visibleColumns = columns.filter((column) => visibleColumnsState[column.key])

    const handleDragStart = ({ active }) => {
        setActiveId(active.id)
    }

    const handleDragOver = ({ active, over }) => {
        if (!over) return

        const activeIdValue = active.id
        const overIdValue = over.id

        const activeColumn = findColumnByItemId(appointments, activeIdValue)
        const overColumn = appointments[overIdValue]
            ? overIdValue
            : findColumnByItemId(appointments, overIdValue)

        if (!activeColumn || !overColumn || activeColumn === overColumn) return

        setAppointments((prev) => {
            const activeItems = [...prev[activeColumn]]
            const overItems = [...prev[overColumn]]
            const activeIndex = activeItems.findIndex((item) => item.id === activeIdValue)
            if (activeIndex === -1) return prev

            const [movedItem] = activeItems.splice(activeIndex, 1)

            const overIndex = overItems.findIndex((item) => item.id === overIdValue)
            const insertIndex = overIndex >= 0 ? overIndex : overItems.length
            overItems.splice(insertIndex, 0, movedItem)

            return {
                ...prev,
                [activeColumn]: activeItems,
                [overColumn]: overItems,
            }
        })
    }

    const handleDragEnd = ({ active, over }) => {
        setActiveId(null)

        try {
            if (!over) return

            const activeIdValue = active.id
            const overIdValue = over.id
            const activeColumn = findColumnByItemId(appointments, activeIdValue)
            const overColumn = appointments[overIdValue]
                ? overIdValue
                : findColumnByItemId(appointments, overIdValue)

            if (!activeColumn || !overColumn) return

            if (activeColumn === overColumn && activeIdValue !== overIdValue) {
                const columnItems = appointments[activeColumn]
                const oldIndex = columnItems.findIndex((item) => item.id === activeIdValue)
                const newIndex = columnItems.findIndex((item) => item.id === overIdValue)

                if (oldIndex !== -1 && newIndex !== -1) {
                    setAppointments((prev) => ({
                        ...prev,
                        [activeColumn]: arrayMove(prev[activeColumn], oldIndex, newIndex),
                    }))
                }
            }

            if (activeColumn !== overColumn) {
                toast.push(
                    <Notification type='success' title='Atualizado'>
                        Atendimento movido para {columns.find((c) => c.key === overColumn)?.title}
                    </Notification>
                )
            }
        } catch (error) {
            console.error('Erro ao mover atendimento:', error)
        }
    }

    const toggleColumn = (key) => {
        setVisibleColumnsState({
            ...visibleColumnsState,
            [key]: !visibleColumnsState[key],
        })
    }

    const activeAppointment = useMemo(() => {
        if (!activeId) return null
        const column = findColumnByItemId(appointments, activeId)
        if (!column) return null
        return appointments[column].find((item) => item.id === activeId) || null
    }, [activeId, appointments])

    return (
        <div className='w-full h-full p-4'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-800'>Fluxo de Atendimento</h2>
                    <p className='text-sm text-gray-400 mt-0.5'>Visualize e controle o fluxo de atendimentos do dia</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className='flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-sm transition-all shadow-sm'
                >
                    <HiOutlineFilter className='w-4 h-4' />
                    Colunas
                    <HiOutlineChevronUp className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className='mt-3 bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm'>
                    <div className='flex items-center justify-between mb-3'>
                        <h3 className='text-xs font-semibold text-gray-600 uppercase tracking-wider'>Visibilidade das Colunas</h3>
                        <button onClick={() => setShowFilters(false)} className='text-gray-400 hover:text-gray-600'>
                            <HiOutlineX className='w-4 h-4' />
                        </button>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        {columns.map((column) => (
                            <label
                                key={column.key}
                                className='flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl border transition-all'
                                style={visibleColumnsState[column.key]
                                    ? { background: column.accentLight, borderColor: column.accent + '40', color: column.accent }
                                    : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#9ca3af' }
                                }
                            >
                                <input
                                    type='checkbox'
                                    checked={visibleColumnsState[column.key]}
                                    onChange={() => toggleColumn(column.key)}
                                    className='sr-only'
                                />
                                <span className={`w-1.5 h-1.5 rounded-full ${column.dot}`}></span>
                                <span className='text-xs font-medium'>{column.title}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div className='mt-6'>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3'>
                        {visibleColumns.map((column) => (
                            <Column key={column.key} column={column} items={appointments[column.key] || []} onViewRecord={handleViewRecord} />
                        ))}
                    </div>

                    <DragOverlay>
                        {activeAppointment ? (
                            <div className='w-64'>
                                <AppointmentCard appointment={activeAppointment} isDragging />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Stats Footer */}
            <div className='mt-4'>
                <div className='grid grid-cols-3 md:grid-cols-6 gap-2'>
                    {visibleColumns.map((column) => (
                        <div
                            key={column.key}
                            className='rounded-xl px-3 py-2 text-center'
                            style={{ background: column.accentLight }}
                        >
                            <p className='text-[11px] font-medium text-gray-500 truncate'>{column.title}</p>
                            <p className='text-xl font-bold mt-0.5' style={{ color: column.accent }}>
                                {(appointments[column.key] || []).length}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AppointmentFlowIndex
