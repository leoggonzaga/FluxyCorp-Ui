import React, { useState, useEffect, useRef } from 'react'
import classNames from 'classnames'
import Badge from '@/components/ui/Badge'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import Dialog from '@/components/ui/Dialog'
import CalendarUpsert from '../../views/calendar/calendarUpsert'
import CalendarEventMonth from '../../views/calendar/calendarEvents/calendarEventMonth'
import CalendarEventWeek from '../../views/calendar/calendarEvents/calendarEventWeek'
import CalendarEventDay from '../../views/calendar/calendarEvents/calendarEventDay'
import CalendarSlot from '../../views/calendar/calendarSlot'

const defaultColorList = {
    red: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-500 dark:text-red-100', dot: 'bg-red-500' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-500 dark:text-orange-100', dot: 'bg-orange-500' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500 dark:text-amber-100', dot: 'bg-amber-500' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-500 dark:text-yellow-100', dot: 'bg-yellow-500' },
    lime: { bg: 'bg-lime-50 dark:bg-lime-500/10', text: 'text-lime-500 dark:text-lime-100', dot: 'bg-lime-500' },
    green: { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-500 dark:text-green-100', dot: 'bg-green-500' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-100', dot: 'bg-emerald-500' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-500 dark:text-teal-100', dot: 'bg-teal-500' },
    cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-100', dot: 'bg-cyan-500' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-500 dark:text-sky-100', dot: 'bg-sky-500' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500 dark:text-blue-100', dot: 'bg-blue-500' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-500 dark:text-indigo-100', dot: 'bg-indigo-500' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-500 dark:text-purple-100', dot: 'bg-purple-500' },
    fuchsia: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-500 dark:text-fuchsia-100', dot: 'bg-fuchsia-500' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-500 dark:text-pink-100', dot: 'bg-pink-500' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-500 dark:text-rose-100', dot: 'bg-rose-500' },
}

const CalendarView = (props) => {
    const { wrapperClass, eventColors = () => defaultColorList, calendarRef, openUpsert, closeUpsert, ...rest } = props
    const [contentHeight, setContentHeight] = useState(0)

    const handleDateClick = (arg) => {
        openUpsert()
    }

    const handleEventClick = (clickInfo) => {
        let event = {
            patientFullName: clickInfo.event?.extendedProps?.patientName,
            start: clickInfo.event?.startStr,
            end: clickInfo.event?.endStr
        }

        openUpsert(event);
    }

    useEffect(() => {
        const calculateHeight = () => {
            const headerOffset = 230  // tamanho do seu header, ajuste conforme necessário
            setContentHeight(window.innerHeight - headerOffset)
        }

        calculateHeight()
        window.addEventListener('resize', calculateHeight)
        return () => window.removeEventListener('resize', calculateHeight)
    }, [])

    return (
        <div className={classNames('calendar w-full p-5', wrapperClass)}>
            <FullCalendar
                ref={calendarRef}
                contentHeight={contentHeight}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                dayMaxEvents={true}
                handleWindowResize={true}
                allDaySlot={false}
                // dayCellClassNames={'p-8'}
                droppable={true}
                editable={true}
                slotDuration="00:15:00"
                nowIndicator={true}
                slotEventOverlap={true}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                slotLabelInterval="00:15:00"
                slotLabelContent={(arg) => <CalendarSlot arg={arg}/>}
                events={[
                    {
                        id: '1',
                        title: 'Reunião de planejamento',
                        start: '2025-08-03T09:00:00',
                        end: '2025-08-03T10:30:00',
                        patientName: 'Ana Silva',
                        serviceColor: 'pink'
                    },
                    {
                        id: '99',
                        title: 'Reunião de planejamento',
                        start: '2025-08-03T09:00:00',
                        end: '2025-08-03T10:30:00',
                        patientName: 'Ana Gomes',
                        serviceColor: 'yellow'
                    },
                    {
                        id: '9999',
                        title: 'Reunião de planejamento',
                        start: '2025-08-03T09:00:00',
                        end: '2025-08-03T10:30:00',
                        patientName: 'Ana Fernanda',
                        serviceColor: 'red'
                    },
                    {
                        id: '999',
                        title: 'Reunião de planejamento',
                        start: '2025-08-03T09:00:00',
                        end: '2025-08-03T10:30:00',
                        patientName: 'Ana Donizete',
                        serviceColor: 'purple'

                    },
                    {
                        id: '2',
                        title: 'Consulta com paciente – João Silva',
                        start: '2025-08-06T14:00:00',  // evento na data de hoje
                        end: '2025-08-06T15:00:00',
                        patientName: 'João Silva',
                        serviceColor: 'orange'
                    },
                    {
                        id: '3',
                        title: 'Treinamento de equipe',
                        start: '2025-08-12T11:00:00',
                        end: '2025-08-12T12:15:00',
                        patientName: 'Bruna Costa'
                    },
                    {
                        id: '4',
                        title: 'Demonstração de produto',
                        start: '2025-08-20T16:00:00',
                        end: '2025-08-20T17:00:00',
                        patientName: 'Carlos Eduardo',
                        serviceColor: 'green'
                    },
                    {
                        id: '5',
                        title: 'Revisão mensal de métricas',
                        start: '2025-08-28T13:30:00',
                        end: '2025-08-28T14:30:00',
                        patientName: 'Débora Almeida da Silva Gomes',
                        serviceColor: 'gray'
                    }
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'title',
                    center: '',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay prev,next',
                }}
                eventContent={(arg) => {
                    debugger;
                    if (arg.view.type === 'dayGridMonth')
                        return <CalendarEventMonth event={arg.event} timeText={arg.timeText} />
                    if (arg.view.type === 'timeGridWeek')
                        return <CalendarEventWeek event={arg.event} timeText={arg.timeText} />
                    if (arg.view.type === 'timeGridDay')
                        return <CalendarEventDay event={arg.event} timeText={arg.timeText} />

                }}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                {...rest}
            />
        </div>
    )
}

export default CalendarView
