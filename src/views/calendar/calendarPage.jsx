import CalendarView from '@/components/shared/CalendarView'
import { Dialog } from '@/components/ui'
import CalendarOptions from './calendarOptions'
import { useRef, useState } from 'react'
import AppointmentUpsert from './appointmentUpsert'

const CalendarPage = () => {
    const calendarRef = useRef()
    const [isUpsertOpen, setIsUpsert] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState(null)

    const openUpsert = (data) => {
        setIsUpsert(true)
        setSelectedEvent(data || null)
    }

    const closeUpsert = () => {
        setIsUpsert(false)
        setSelectedEvent(null)
    }

    const handleChangeDate = (dateStr) => {
        const api = calendarRef.current?.getApi?.()
        if (!api) return
        api.gotoDate(dateStr)
        api.unselect()
        api.select(dateStr)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page card */}
            <div className="flex-1 flex bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">

                {/* Sidebar */}
                <div className="border-r border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
                    <CalendarOptions
                        handleChangeDate={handleChangeDate}
                        openUpsert={openUpsert}
                        closeUpsert={closeUpsert}
                    />
                </div>

                {/* Calendar */}
                <div className="flex-1 min-w-0">
                    <CalendarView
                        calendarRef={calendarRef}
                        openUpsert={openUpsert}
                        closeUpsert={closeUpsert}
                    />
                </div>
            </div>

            {/* Appointment modal */}
            <Dialog
                isOpen={isUpsertOpen}
                onRequestClose={closeUpsert}
                onClose={closeUpsert}
                width={630}
            >
                <AppointmentUpsert data={selectedEvent} onClose={closeUpsert} />
            </Dialog>
        </div>
    )
}

export default CalendarPage
