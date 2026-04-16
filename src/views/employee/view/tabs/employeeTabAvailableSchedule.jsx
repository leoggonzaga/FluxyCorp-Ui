import { HiOutlineCheckCircle } from "react-icons/hi"
import { Button, Card, Input, Checkbox, Notification, toast } from "../../../../components/ui"
import { useState } from "react"

const EmployeeTabAvailableSchedule = ({ data }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('weekly')
    
    // Horários semanais
    const [schedules, setSchedules] = useState(
        data?.schedules || [
            { dayOfWeek: 1, dayName: 'Segunda-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 2, dayName: 'Terça-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 3, dayName: 'Quarta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 4, dayName: 'Quinta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 5, dayName: 'Sexta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
            { dayOfWeek: 6, dayName: 'Sábado', isWorking: false, startTime: '09:00', endTime: '13:00' },
            { dayOfWeek: 0, dayName: 'Domingo', isWorking: false, startTime: '09:00', endTime: '13:00' },
        ]
    )
    const [rangeStart, setRangeStart] = useState(null)
    
    // Datas específicas de disponibilidade
    const [specificDates, setSpecificDates] = useState(data?.specificDates || [])
    const [dateMode, setDateMode] = useState('single')
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    const [dateStartTime, setDateStartTime] = useState('08:00')
    const [dateEndTime, setDateEndTime] = useState('17:00')
    
    // Indisponibilidades
    const [unavailableDates, setUnavailableDates] = useState(data?.unavailableDates || [])
    const [unavailableMode, setUnavailableMode] = useState('single')
    const [unavailableStart, setUnavailableStart] = useState('')
    const [unavailableEnd, setUnavailableEnd] = useState('')
    const [unavailableReason, setUnavailableReason] = useState('')

    // Funções de Horários Semanais
    const handleWorkingChange = (index) => {
        const updated = [...schedules]
        updated[index].isWorking = !updated[index].isWorking
        setSchedules(updated)
    }

    const handleRangeStart = (index) => {
        setRangeStart(index)
    }

    const handleRangeEnd = (endIndex) => {
        if (rangeStart === null) return
        const start = Math.min(rangeStart, endIndex)
        const end = Math.max(rangeStart, endIndex)
        const updated = [...schedules]
        for (let i = start; i <= end; i++) {
            updated[i].isWorking = true
        }
        setSchedules(updated)
        setRangeStart(null)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Range de dias selecionado!
            </Notification>
        )
    }

    const handleTimeChange = (index, field, value) => {
        const updated = [...schedules]
        updated[index][field] = value
        setSchedules(updated)
    }

    const selectAll = () => {
        const updated = schedules.map((schedule) => ({
            ...schedule,
            isWorking: true,
        }))
        setSchedules(updated)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Todos os dias selecionados!
            </Notification>
        )
    }

    const selectWeekdays = () => {
        const updated = schedules.map((schedule, index) => ({
            ...schedule,
            isWorking: index >= 0 && index <= 4,
        }))
        setSchedules(updated)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Semana (seg-sex) selecionada!
            </Notification>
        )
    }

    const selectWeekend = () => {
        const updated = schedules.map((schedule, index) => ({
            ...schedule,
            isWorking: index >= 5,
        }))
        setSchedules(updated)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Fim de semana selecionado!
            </Notification>
        )
    }

    const selectNone = () => {
        const updated = schedules.map((schedule) => ({
            ...schedule,
            isWorking: false,
        }))
        setSchedules(updated)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Seleção limpa!
            </Notification>
        )
    }

    const handleApplyToAll = () => {
        if (schedules.length === 0) return
        const firstWorking = schedules[0].isWorking
        const firstStart = schedules[0].startTime
        const firstEnd = schedules[0].endTime
        const updated = schedules.map((schedule) => ({
            ...schedule,
            isWorking: firstWorking,
            startTime: firstStart,
            endTime: firstEnd,
        }))
        setSchedules(updated)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Horários aplicados a todos os dias!
            </Notification>
        )
    }

    const addSpecificDate = () => {
        if (!dateStart) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Selecione uma data inicial!
                </Notification>
            )
            return
        }

        if (dateMode === 'range' && !dateEnd) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Selecione uma data final para o range!
                </Notification>
            )
            return
        }

        if (dateMode === 'range' && new Date(dateEnd) < new Date(dateStart)) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    A data final deve ser maior ou igual à data inicial!
                </Notification>
            )
            return
        }

        const newDate = {
            startDate: dateStart,
            endDate: dateMode === 'range' ? dateEnd : null,
            startTime: dateStartTime,
            endTime: dateEndTime,
        }

        setSpecificDates([...specificDates, newDate])
        setDateStart('')
        setDateEnd('')
        toast.push(
            <Notification type='success' title='Sucesso'>
                Data {dateMode === 'range' ? 'range' : ''} adicionada!
            </Notification>
        )
    }

    const removeSpecificDate = (index) => {
        setSpecificDates(specificDates.filter((_, i) => i !== index))
        toast.push(
            <Notification type='success' title='Sucesso'>
                Data removida!
            </Notification>
        )
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString + 'T00:00:00')
        return date.toLocaleDateString('pt-BR')
    }

    const addUnavailableDate = () => {
        if (!unavailableStart) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Selecione uma data inicial!
                </Notification>
            )
            return
        }

        if (unavailableMode === 'range' && !unavailableEnd) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Selecione uma data final para o range!
                </Notification>
            )
            return
        }

        if (unavailableMode === 'range' && new Date(unavailableEnd) < new Date(unavailableStart)) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    A data final deve ser maior ou igual à data inicial!
                </Notification>
            )
            return
        }

        const newUnavailable = {
            startDate: unavailableStart,
            endDate: unavailableMode === 'range' ? unavailableEnd : null,
            reason: unavailableReason || 'Indisponível',
        }

        setUnavailableDates([...unavailableDates, newUnavailable])
        setUnavailableStart('')
        setUnavailableEnd('')
        setUnavailableReason('')
        toast.push(
            <Notification type='success' title='Sucesso'>
                Indisponibilidade adicionada!
            </Notification>
        )
    }

    const removeUnavailableDate = (index) => {
        setUnavailableDates(unavailableDates.filter((_, i) => i !== index))
        toast.push(
            <Notification type='success' title='Sucesso'>
                Indisponibilidade removida!
            </Notification>
        )
    }

    const handleSave = async () => {
        console.log('Horários salvos:', {
            schedules,
            specificDates,
            unavailableDates
        })
        toast.push(
            <Notification type='success' title='Sucesso'>
                Horários do profissional atualizados com sucesso!
            </Notification>
        )
        setIsEditing(false)
    }

    const handleReset = () => {
        setSchedules(
            data?.schedules || [
                { dayOfWeek: 1, dayName: 'Segunda-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
                { dayOfWeek: 2, dayName: 'Terça-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
                { dayOfWeek: 3, dayName: 'Quarta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
                { dayOfWeek: 4, dayName: 'Quinta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
                { dayOfWeek: 5, dayName: 'Sexta-feira', isWorking: false, startTime: '08:00', endTime: '17:00' },
                { dayOfWeek: 6, dayName: 'Sábado', isWorking: false, startTime: '09:00', endTime: '13:00' },
                { dayOfWeek: 0, dayName: 'Domingo', isWorking: false, startTime: '09:00', endTime: '13:00' },
            ]
        )
        setSpecificDates(data?.specificDates || [])
        setUnavailableDates(data?.unavailableDates || [])
    }

    const workingDaysCount = schedules.filter(s => s.isWorking).length
    const totalDatesCount = specificDates.length
    const totalUnavailableCount = unavailableDates.length

    return (
        <Card className='flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between w-full mb-4 pb-4 border-b border-gray-200'>
                <div className='flex gap-2 flex-wrap'>
                    <span className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold'>Semana: {workingDaysCount}</span>
                    {totalDatesCount > 0 && <span className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'>Datas: {totalDatesCount}</span>}
                    {totalUnavailableCount > 0 && <span className='px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold'>Indisponível: {totalUnavailableCount}</span>}
                </div>
                <div className='flex items-center gap-2'>
                    <Button size="sm" onClick={() => { if (isEditing) handleReset(); setIsEditing(prev => !prev) }}>{isEditing ? 'Cancelar' : 'Editar'}</Button>
                    {isEditing && <Button size="sm" variant="solid" icon={<HiOutlineCheckCircle />} onClick={handleSave}>Salvar</Button>}
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-2 mb-6 border-b border-gray-200'>
                <button onClick={() => setActiveTab('weekly')} className={`px-4 py-2 font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'weekly' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 hover:text-gray-800'}`}>Horários Semanais</button>
                <button onClick={() => setActiveTab('specific')} className={`px-4 py-2 font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'specific' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 hover:text-gray-800'}`}>Datas Específicas</button>
                <button onClick={() => setActiveTab('unavailable')} className={`px-4 py-2 font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'unavailable' ? 'border-b-2 border-primary text-primary' : 'text-gray-600 hover:text-gray-800'}`}>Indisponibilidades</button>
            </div>

            {/* TAB 1 */}
            {activeTab === 'weekly' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                            <div className='flex items-center justify-between mb-3'>
                                <p className='text-sm text-blue-800 font-semibold'>Seleção rápida:</p>
                                {rangeStart !== null && <span className='text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded'>Clique em outro dia para completar o range</span>}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <Button size="sm" variant="plain" onClick={selectAll} className='text-blue-600 hover:text-blue-800 font-semibold text-xs'>Todos</Button>
                                <Button size="sm" variant="plain" onClick={selectWeekdays} className='text-blue-600 hover:text-blue-800 font-semibold text-xs'>Semana (Seg-Sex)</Button>
                                <Button size="sm" variant="plain" onClick={selectWeekend} className='text-blue-600 hover:text-blue-800 font-semibold text-xs'>Fim de Semana</Button>
                                <Button size="sm" variant="plain" onClick={selectNone} className='text-blue-600 hover:text-blue-800 font-semibold text-xs'>Limpar</Button>
                                <Button size="sm" variant="plain" onClick={handleApplyToAll} className='text-blue-600 hover:text-blue-800 font-semibold text-xs'>Aplicar horário a todos</Button>
                            </div>
                        </div>
                    )}
                    <div className='space-y-3'>
                        {schedules.map((schedule, index) => (
                            <div key={schedule.dayOfWeek} className={`border rounded-lg p-4 transition-colors ${rangeStart === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <div className='flex items-center justify-between w-full gap-4'>
                                    <div className='flex items-center gap-3 flex-1'>
                                        {isEditing && (
                                            <div className='flex items-center gap-2'>
                                                <Checkbox checked={schedule.isWorking} onChange={() => handleWorkingChange(index)} />
                                                <Button size="xs" variant="plain" onClick={() => { if (rangeStart === null) { handleRangeStart(index) } else if (rangeStart !== index) { handleRangeEnd(index) } else { setRangeStart(null) } }} className={`text-xs px-2 py-1 rounded ${rangeStart === index ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{rangeStart === index ? 'Seleção' : 'Range'}</Button>
                                            </div>
                                        )}
                                        {!isEditing && <Checkbox checked={schedule.isWorking} disabled={true} />}
                                        <div className='font-semibold text-gray-700 w-32'>{schedule.dayName}</div>
                                    </div>
                                    {schedule.isWorking ? (
                                        <div className='flex items-center gap-2 flex-1'>
                                            {isEditing ? (
                                                <>
                                                    <Input type='time' value={schedule.startTime} onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)} className='w-24' />
                                                    <span className='text-gray-500'>até</span>
                                                    <Input type='time' value={schedule.endTime} onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)} className='w-24' />
                                                </>
                                            ) : (
                                                <span className='text-gray-700'>{schedule.startTime} - {schedule.endTime}</span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className='flex-1'><span className='text-gray-400 text-sm italic'>Não trabalha neste dia</span></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 2 */}
            {activeTab === 'specific' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Tipo de Seleção</label>
                                    <div className='flex gap-4'>
                                        <label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='dateMode' value='single' checked={dateMode === 'single'} onChange={(e) => { setDateMode(e.target.value); setDateEnd('') }} className='w-4 h-4' />
                                            <span className='text-sm text-gray-700'>Data Única</span>
                                        </label>
                                        <label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='dateMode' value='range' checked={dateMode === 'range'} onChange={(e) => setDateMode(e.target.value)} className='w-4 h-4' />
                                            <span className='text-sm text-gray-700'>Range de Datas</span>
                                        </label>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Inicial</label>
                                        <Input type='date' value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
                                    </div>
                                    {dateMode === 'range' && (
                                        <div>
                                            <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Final</label>
                                            <Input type='date' value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} min={dateStart} />
                                        </div>
                                    )}
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Hora Inicial</label>
                                        <Input type='time' value={dateStartTime} onChange={(e) => setDateStartTime(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Hora Final</label>
                                        <Input type='time' value={dateEndTime} onChange={(e) => setDateEndTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <Button size='sm' variant='solid' onClick={addSpecificDate}>Adicionar Data</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {specificDates.length > 0 ? (
                        <div className='space-y-2'>
                            <p className='text-sm font-semibold text-gray-700'>Datas Adicionadas ({specificDates.length})</p>
                            <div className='space-y-2'>
                                {specificDates.map((date, index) => (
                                    <div key={index} className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg'>
                                        <div>
                                            <p className='font-semibold text-gray-800'>{formatDate(date.startDate)}{date.endDate && ` a ${formatDate(date.endDate)}`}</p>
                                            <p className='text-xs text-gray-600'>{date.startTime} - {date.endTime}</p>
                                        </div>
                                        {isEditing && <Button size='xs' variant='plain' onClick={() => removeSpecificDate(index)} className='text-red-600 hover:text-red-800'>Remover</Button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='p-4 text-center bg-gray-50 border border-gray-200 rounded-lg'><p className='text-sm text-gray-600'>Nenhuma data específica adicionada</p></div>
                    )}
                </div>
            )}

            {/* TAB 3 */}
            {activeTab === 'unavailable' && (
                <div className='space-y-4'>
                    {isEditing && (
                        <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Tipo de Indisponibilidade</label>
                                    <div className='flex gap-4'>
                                        <label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='unavailableMode' value='single' checked={unavailableMode === 'single'} onChange={(e) => { setUnavailableMode(e.target.value); setUnavailableEnd('') }} className='w-4 h-4' />
                                            <span className='text-sm text-gray-700'>Data Única</span>
                                        </label>
                                        <label className='flex items-center gap-2 cursor-pointer'>
                                            <input type='radio' name='unavailableMode' value='range' checked={unavailableMode === 'range'} onChange={(e) => setUnavailableMode(e.target.value)} className='w-4 h-4' />
                                            <span className='text-sm text-gray-700'>Range de Datas</span>
                                        </label>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Inicial</label>
                                        <Input type='date' value={unavailableStart} onChange={(e) => setUnavailableStart(e.target.value)} />
                                    </div>
                                    {unavailableMode === 'range' && (
                                        <div>
                                            <label className='block text-xs font-semibold text-gray-600 mb-1'>Data Final</label>
                                            <Input type='date' value={unavailableEnd} onChange={(e) => setUnavailableEnd(e.target.value)} min={unavailableStart} />
                                        </div>
                                    )}
                                    <div>
                                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Motivo (Opcional)</label>
                                        <Input type='text' placeholder='Ex: Férias, Doença...' value={unavailableReason} onChange={(e) => setUnavailableReason(e.target.value)} />
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <Button size='sm' variant='solid' onClick={addUnavailableDate}>Adicionar Indisponibilidade</Button>
                                </div>
                            </div>
                        </div>
                    )}
                    {unavailableDates.length > 0 ? (
                        <div className='space-y-2'>
                            <p className='text-sm font-semibold text-gray-700'>Indisponibilidades ({unavailableDates.length})</p>
                            <div className='space-y-2'>
                                {unavailableDates.map((date, index) => (
                                    <div key={index} className='flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg'>
                                        <div>
                                            <p className='font-semibold text-gray-800'>{formatDate(date.startDate)}{date.endDate && ` a ${formatDate(date.endDate)}`}</p>
                                            <p className='text-xs text-gray-600'>{date.reason}</p>
                                        </div>
                                        {isEditing && <Button size='xs' variant='plain' onClick={() => removeUnavailableDate(index)} className='text-red-600 hover:text-red-800'>Remover</Button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='p-4 text-center bg-gray-50 border border-gray-200 rounded-lg'><p className='text-sm text-gray-600'>Nenhuma indisponibilidade registrada</p></div>
                    )}
                </div>
            )}
        </Card>
    )
}

export default EmployeeTabAvailableSchedule