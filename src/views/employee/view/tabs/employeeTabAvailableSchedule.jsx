import { useEffect, useState } from 'react'
import {
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineCalendar,
    HiOutlineBan,
    HiOutlineTrash,
    HiOutlinePlus,
} from 'react-icons/hi'
import { Button, Card, Input, Checkbox, Notification, Spinner, toast } from '../../../../components/ui'
import {
    employeeGetAvailability,
    employeeReplaceAvailability,
    employeeGetSpecificDates,
    employeeReplaceSpecificDates,
    employeeGetUnavailabilities,
    employeeReplaceUnavailabilities,
} from '../../../../api/enterprise/EnterpriseService'

const DEFAULT_SCHEDULES = [
    { dayOfWeek: 1, dayName: 'Segunda-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 2, dayName: 'Terça-feira',   isWorking: false, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 3, dayName: 'Quarta-feira',  isWorking: false, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 4, dayName: 'Quinta-feira',  isWorking: false, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 5, dayName: 'Sexta-feira',   isWorking: false, startTime: '08:00', endTime: '17:00' },
    { dayOfWeek: 6, dayName: 'Sábado',        isWorking: false, startTime: '09:00', endTime: '13:00' },
    { dayOfWeek: 0, dayName: 'Domingo',       isWorking: false, startTime: '09:00', endTime: '13:00' },
]

const toHHMM = (timeStr) => (timeStr ? timeStr.substring(0, 5) : '08:00')

const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
}

const EmptyState = ({ icon, message, sub }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
    </div>
)

const TABS = [
    { key: 'weekly',      label: 'Horários Semanais', icon: <HiOutlineClock /> },
    { key: 'specific',    label: 'Datas Específicas', icon: <HiOutlineCalendar /> },
    { key: 'unavailable', label: 'Indisponibilidades', icon: <HiOutlineBan /> },
]

const EmployeeTabAvailableSchedule = ({ data }) => {
    const [activeTab, setActiveTab]   = useState('weekly')
    const [isEditing, setIsEditing]   = useState(false)
    const [loading, setLoading]       = useState(false)
    const [saving, setSaving]         = useState(false)

    // ── Weekly ──────────────────────────────────────────────────────────────
    const [schedules, setSchedules]   = useState(DEFAULT_SCHEDULES)
    const [rangeStart, setRangeStart] = useState(null)

    // ── Specific dates ──────────────────────────────────────────────────────
    const [specificDates, setSpecificDates]     = useState([])
    const [dateMode, setDateMode]               = useState('single')
    const [dateStart, setDateStart]             = useState('')
    const [dateEnd, setDateEnd]                 = useState('')
    const [dateStartTime, setDateStartTime]     = useState('08:00')
    const [dateEndTime, setDateEndTime]         = useState('17:00')

    // ── Unavailability ──────────────────────────────────────────────────────
    const [unavailableDates, setUnavailableDates]   = useState([])
    const [unavailableMode, setUnavailableMode]     = useState('single')
    const [unavailableStart, setUnavailableStart]   = useState('')
    const [unavailableEnd, setUnavailableEnd]       = useState('')
    const [unavailableReason, setUnavailableReason] = useState('')

    // helpers
    const toDateStr = (d) => (d ? (typeof d === 'string' ? d.substring(0, 10) : d) : null)

    // ── API ─────────────────────────────────────────────────────────────────
    const mergeWithApi = (apiItems) =>
        DEFAULT_SCHEDULES.map((def) => {
            const match = apiItems.find((a) => a.dayOfWeek === def.dayOfWeek)
            return match
                ? { ...def, isWorking: true, startTime: toHHMM(match.startTime), endTime: toHHMM(match.endTime) }
                : { ...def, isWorking: false }
        })

    const loadAll = async () => {
        if (!data?.publicId) return
        setLoading(true)
        try {
            const [avail, specific, unavail] = await Promise.all([
                employeeGetAvailability(data.publicId),
                employeeGetSpecificDates(data.publicId),
                employeeGetUnavailabilities(data.publicId),
            ])
            if (avail) setSchedules(mergeWithApi(avail))
            if (specific) setSpecificDates(specific.map((x) => ({
                startDate: toDateStr(x.startDate),
                endDate:   toDateStr(x.endDate),
                startTime: toHHMM(x.startTime),
                endTime:   toHHMM(x.endTime),
            })))
            if (unavail) setUnavailableDates(unavail.map((x) => ({
                startDate: toDateStr(x.startDate),
                endDate:   toDateStr(x.endDate),
                reason:    x.reason,
            })))
        } catch {
            // silently keep defaults
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadAll() }, [data?.publicId])

    // ── Weekly handlers ─────────────────────────────────────────────────────
    const handleWorkingChange = (index) => {
        const updated = [...schedules]
        updated[index] = { ...updated[index], isWorking: !updated[index].isWorking }
        setSchedules(updated)
    }

    const handleTimeChange = (index, field, value) => {
        const updated = [...schedules]
        updated[index] = { ...updated[index], [field]: value }
        setSchedules(updated)
    }

    const handleRangeStart = (index) => setRangeStart(index)

    const handleRangeEnd = (endIndex) => {
        if (rangeStart === null) return
        const start = Math.min(rangeStart, endIndex)
        const end   = Math.max(rangeStart, endIndex)
        const updated = schedules.map((s, i) => (i >= start && i <= end ? { ...s, isWorking: true } : s))
        setSchedules(updated)
        setRangeStart(null)
        toast.push(<Notification type='success' title='Seleção aplicada'>Range de dias marcado!</Notification>)
    }

    const selectAll      = () => { setSchedules(schedules.map((s) => ({ ...s, isWorking: true }))); toast.push(<Notification type='success' title='Todos os dias selecionados' />) }
    const selectWeekdays = () => { setSchedules(schedules.map((s, i) => ({ ...s, isWorking: i <= 4 }))); toast.push(<Notification type='success' title='Segunda a Sexta selecionados' />) }
    const selectWeekend  = () => { setSchedules(schedules.map((s, i) => ({ ...s, isWorking: i >= 5 }))); toast.push(<Notification type='success' title='Fim de semana selecionado' />) }
    const selectNone     = () => { setSchedules(schedules.map((s) => ({ ...s, isWorking: false }))); toast.push(<Notification type='info' title='Seleção limpa' />) }
    const handleApplyToAll = () => {
        const first = schedules[0]
        setSchedules(schedules.map((s) => ({ ...s, isWorking: first.isWorking, startTime: first.startTime, endTime: first.endTime })))
        toast.push(<Notification type='success' title='Horário da segunda aplicado a todos os dias' />)
    }

    // ── Specific dates handlers ─────────────────────────────────────────────
    const addSpecificDate = () => {
        if (!dateStart) { toast.push(<Notification type='warning' title='Selecione uma data inicial' />); return }
        if (dateMode === 'range' && !dateEnd) { toast.push(<Notification type='warning' title='Selecione a data final' />); return }
        if (dateMode === 'range' && new Date(dateEnd) < new Date(dateStart)) { toast.push(<Notification type='warning' title='Data final deve ser após a inicial' />); return }
        setSpecificDates([...specificDates, { startDate: dateStart, endDate: dateMode === 'range' ? dateEnd : null, startTime: dateStartTime, endTime: dateEndTime }])
        setDateStart(''); setDateEnd('')
        toast.push(<Notification type='success' title='Data adicionada' />)
    }

    const removeSpecificDate = (index) => {
        setSpecificDates(specificDates.filter((_, i) => i !== index))
        toast.push(<Notification type='success' title='Data removida' />)
    }

    // ── Unavailability handlers ─────────────────────────────────────────────
    const addUnavailableDate = () => {
        if (!unavailableStart) { toast.push(<Notification type='warning' title='Selecione uma data inicial' />); return }
        if (unavailableMode === 'range' && !unavailableEnd) { toast.push(<Notification type='warning' title='Selecione a data final' />); return }
        if (unavailableMode === 'range' && new Date(unavailableEnd) < new Date(unavailableStart)) { toast.push(<Notification type='warning' title='Data final deve ser após a inicial' />); return }
        setUnavailableDates([...unavailableDates, { startDate: unavailableStart, endDate: unavailableMode === 'range' ? unavailableEnd : null, reason: unavailableReason || 'Indisponível' }])
        setUnavailableStart(''); setUnavailableEnd(''); setUnavailableReason('')
        toast.push(<Notification type='success' title='Indisponibilidade adicionada' />)
    }

    const removeUnavailableDate = (index) => {
        setUnavailableDates(unavailableDates.filter((_, i) => i !== index))
        toast.push(<Notification type='success' title='Indisponibilidade removida' />)
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!data?.publicId) return
        setSaving(true)
        try {
            const weeklySlots = schedules
                .filter((s) => s.isWorking)
                .map((s) => ({ dayOfWeek: s.dayOfWeek, startTime: `${s.startTime}:00`, endTime: `${s.endTime}:00`, roomId: 0 }))

            const specificSlots = specificDates.map((d) => ({
                startDate: d.startDate,
                endDate:   d.endDate || null,
                startTime: `${d.startTime}:00`,
                endTime:   `${d.endTime}:00`,
            }))

            const unavailSlots = unavailableDates.map((d) => ({
                startDate: d.startDate,
                endDate:   d.endDate || null,
                reason:    d.reason,
            }))

            const [r1, r2, r3] = await Promise.all([
                employeeReplaceAvailability(data.publicId, weeklySlots),
                employeeReplaceSpecificDates(data.publicId, specificSlots),
                employeeReplaceUnavailabilities(data.publicId, unavailSlots),
            ])

            if (r1 === null || r2 === null || r3 === null) return
            toast.push(<Notification type='success' title='Disponibilidade salva'>Todas as configurações foram atualizadas com sucesso.</Notification>)
            setIsEditing(false)
            await loadAll()
        } catch {
            toast.push(<Notification type='danger' title='Erro ao salvar'>Não foi possível salvar. Tente novamente.</Notification>)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => { loadAll(); setIsEditing(false); setRangeStart(null) }

    const workingDaysCount = schedules.filter((s) => s.isWorking).length

    if (loading) {
        return (
            <Card className='flex items-center justify-center py-16'>
                <Spinner size='40px' />
            </Card>
        )
    }

    return (
        <Card className='flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between w-full mb-5 pb-4 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary'>
                        <HiOutlineClock className='text-lg' />
                    </div>
                    <div>
                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>Disponibilidade do Profissional</p>
                        <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
                            <span className='px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium'>
                                {workingDaysCount} dia{workingDaysCount !== 1 ? 's' : ''} na semana
                            </span>
                            {specificDates.length > 0 && (
                                <span className='px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium'>
                                    {specificDates.length} data{specificDates.length !== 1 ? 's' : ''} específica{specificDates.length !== 1 ? 's' : ''}
                                </span>
                            )}
                            {unavailableDates.length > 0 && (
                                <span className='px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium'>
                                    {unavailableDates.length} indisponibilidade{unavailableDates.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    {isEditing && (
                        <Button size='sm' variant='plain' onClick={handleCancel} disabled={saving}>
                            Cancelar
                        </Button>
                    )}
                    {!isEditing && (
                        <Button size='sm' onClick={() => setIsEditing(true)}>
                            Editar
                        </Button>
                    )}
                    {isEditing && (
                        <Button size='sm' variant='solid' icon={<HiOutlineCheckCircle />} onClick={handleSave} loading={saving}>
                            Salvar
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-0 mb-5 border-b border-gray-200 dark:border-gray-700'>
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <span className='text-base'>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Horários Semanais ────────────────────────────────────── */}
            {activeTab === 'weekly' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl'>
                            <div className='flex items-center justify-between flex-wrap gap-2'>
                                <p className='text-xs font-semibold text-indigo-700 dark:text-indigo-300'>Seleção rápida</p>
                                {rangeStart !== null && (
                                    <span className='text-xs text-indigo-500 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full'>
                                        Clique em outro dia para completar o range
                                    </span>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-1.5 mt-2'>
                                {[
                                    { label: 'Todos',                fn: selectAll },
                                    { label: 'Seg–Sex',              fn: selectWeekdays },
                                    { label: 'Fim de semana',        fn: selectWeekend },
                                    { label: 'Limpar',               fn: selectNone },
                                    { label: 'Aplicar 1º dia a todos', fn: handleApplyToAll },
                                ].map(({ label, fn }) => (
                                    <button
                                        key={label}
                                        onClick={fn}
                                        className='px-3 py-1 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors'
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {workingDaysCount === 0 && !isEditing ? (
                        <EmptyState
                            icon={<HiOutlineClock />}
                            message='Nenhuma disponibilidade configurada'
                            sub='Clique em Editar para definir os dias e horários de trabalho'
                        />
                    ) : (
                        <div className='space-y-2'>
                            {schedules.map((schedule, index) => (
                                <div
                                    key={schedule.dayOfWeek}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                                        rangeStart === index
                                            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                                            : schedule.isWorking
                                            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40'
                                    }`}
                                >
                                    <Checkbox
                                        checked={schedule.isWorking}
                                        disabled={!isEditing}
                                        onChange={() => isEditing && handleWorkingChange(index)}
                                    />

                                    <span className={`w-32 text-sm font-semibold shrink-0 ${schedule.isWorking ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                                        {schedule.dayName}
                                    </span>

                                    <div className='flex-1 flex items-center gap-2'>
                                        {schedule.isWorking ? (
                                            isEditing ? (
                                                <>
                                                    <Input type='time' value={schedule.startTime} onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)} className='w-28' />
                                                    <span className='text-gray-400 text-xs'>até</span>
                                                    <Input type='time' value={schedule.endTime} onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)} className='w-28' />
                                                </>
                                            ) : (
                                                <span className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                                                    {schedule.startTime} – {schedule.endTime}
                                                </span>
                                            )
                                        ) : (
                                            <span className='text-xs text-gray-400 italic'>Não trabalha</span>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                if (rangeStart === null) handleRangeStart(index)
                                                else if (rangeStart !== index) handleRangeEnd(index)
                                                else setRangeStart(null)
                                            }}
                                            className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                                                rangeStart === index
                                                    ? 'bg-indigo-500 border-indigo-500 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            Range
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: Datas Específicas ────────────────────────────────────── */}
            {activeTab === 'specific' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl'>
                            <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3'>Adicionar data específica de disponibilidade</p>
                            <div className='flex gap-4 mb-3'>
                                {['single', 'range'].map((mode) => (
                                    <label key={mode} className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='radio'
                                            name='dateMode'
                                            value={mode}
                                            checked={dateMode === mode}
                                            onChange={(e) => { setDateMode(e.target.value); if (mode === 'single') setDateEnd('') }}
                                            className='w-4 h-4 accent-primary'
                                        />
                                        <span className='text-sm text-gray-700 dark:text-gray-300'>{mode === 'single' ? 'Data única' : 'Range de datas'}</span>
                                    </label>
                                ))}
                            </div>
                            <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                                <div>
                                    <p className='text-xs font-medium text-gray-500 mb-1'>Data inicial</p>
                                    <Input type='date' value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
                                </div>
                                {dateMode === 'range' && (
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 mb-1'>Data final</p>
                                        <Input type='date' value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} min={dateStart} />
                                    </div>
                                )}
                                <div>
                                    <p className='text-xs font-medium text-gray-500 mb-1'>Hora início</p>
                                    <Input type='time' value={dateStartTime} onChange={(e) => setDateStartTime(e.target.value)} />
                                </div>
                                <div>
                                    <p className='text-xs font-medium text-gray-500 mb-1'>Hora fim</p>
                                    <Input type='time' value={dateEndTime} onChange={(e) => setDateEndTime(e.target.value)} />
                                </div>
                            </div>
                            <div className='flex justify-end mt-3'>
                                <Button size='sm' variant='solid' icon={<HiOutlinePlus />} onClick={addSpecificDate}>
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    )}

                    {specificDates.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineCalendar />}
                            message='Nenhuma data específica adicionada'
                            sub={isEditing ? 'Preencha o formulário acima para adicionar' : 'Clique em Editar para adicionar datas'}
                        />
                    ) : (
                        <div className='space-y-2'>
                            {specificDates.map((date, index) => (
                                <div
                                    key={index}
                                    className='flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20'
                                >
                                    <div>
                                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                                            {formatDate(date.startDate)}{date.endDate ? ` a ${formatDate(date.endDate)}` : ''}
                                        </p>
                                        <p className='text-xs text-gray-500 dark:text-gray-400'>{date.startTime} – {date.endTime}</p>
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeSpecificDate(index)}
                                            className='p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: Indisponibilidades ───────────────────────────────────── */}
            {activeTab === 'unavailable' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl'>
                            <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3'>Registrar indisponibilidade</p>
                            <div className='flex gap-4 mb-3'>
                                {['single', 'range'].map((mode) => (
                                    <label key={mode} className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='radio'
                                            name='unavailableMode'
                                            value={mode}
                                            checked={unavailableMode === mode}
                                            onChange={(e) => { setUnavailableMode(e.target.value); if (mode === 'single') setUnavailableEnd('') }}
                                            className='w-4 h-4 accent-primary'
                                        />
                                        <span className='text-sm text-gray-700 dark:text-gray-300'>{mode === 'single' ? 'Data única' : 'Range de datas'}</span>
                                    </label>
                                ))}
                            </div>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                <div>
                                    <p className='text-xs font-medium text-gray-500 mb-1'>Data inicial</p>
                                    <Input type='date' value={unavailableStart} onChange={(e) => setUnavailableStart(e.target.value)} />
                                </div>
                                {unavailableMode === 'range' && (
                                    <div>
                                        <p className='text-xs font-medium text-gray-500 mb-1'>Data final</p>
                                        <Input type='date' value={unavailableEnd} onChange={(e) => setUnavailableEnd(e.target.value)} min={unavailableStart} />
                                    </div>
                                )}
                                <div>
                                    <p className='text-xs font-medium text-gray-500 mb-1'>Motivo (opcional)</p>
                                    <Input type='text' placeholder='Ex: Férias, Atestado…' value={unavailableReason} onChange={(e) => setUnavailableReason(e.target.value)} />
                                </div>
                            </div>
                            <div className='flex justify-end mt-3'>
                                <Button size='sm' variant='solid' icon={<HiOutlinePlus />} onClick={addUnavailableDate}>
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    )}

                    {unavailableDates.length === 0 ? (
                        <EmptyState
                            icon={<HiOutlineBan />}
                            message='Nenhuma indisponibilidade registrada'
                            sub={isEditing ? 'Preencha o formulário acima para registrar' : 'Clique em Editar para registrar indisponibilidades'}
                        />
                    ) : (
                        <div className='space-y-2'>
                            {unavailableDates.map((date, index) => (
                                <div
                                    key={index}
                                    className='flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                                >
                                    <div>
                                        <p className='text-sm font-semibold text-gray-800 dark:text-gray-100'>
                                            {formatDate(date.startDate)}{date.endDate ? ` a ${formatDate(date.endDate)}` : ''}
                                        </p>
                                        <p className='text-xs text-red-500 dark:text-red-400'>{date.reason}</p>
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => removeUnavailableDate(index)}
                                            className='p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}

export default EmployeeTabAvailableSchedule
