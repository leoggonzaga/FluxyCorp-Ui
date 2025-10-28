import CalendarView from '@/components/shared/CalendarView'
import { Card, Dialog } from '@/components/ui'
import CalendarOptions from './calendarOptions'
import { useRef, useState } from 'react'
import AppointmentUpsert from './appointmentUpsert'


const CalendarPage = ({ on }) => {
    const calendarRef = useRef()

    const [isUpsertOpen, setIsUpsert] = useState(false);
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
        const api = calendarRef.current?.getApi?.();

        if (!api)
            return

        api.gotoDate(dateStr)
        api.unselect()
        api.select(dateStr)
    }

    return (
        <div>
            <div className='flex w-full gap-4'>
                <div className='flex w-full border-1 rounded-lg'>
                    <div className='flex relative rounded-lg min-w-[10px]'>
                        <CalendarOptions handleChangeDate={handleChangeDate} openUpsert={openUpsert} closeUpsert={closeUpsert} />
                    </div>
                    <div className='w-full border-l-1'>
                        <CalendarView calendarRef={calendarRef} openUpsert={openUpsert} closeUpsert={closeUpsert} />
                    </div>
                </div>

                <Dialog
                    isOpen={isUpsertOpen}
                    onRequestClose={() => closeUpsert()}
                    onClose={() => closeUpsert()}
                    width={630}
                >
                    <AppointmentUpsert data={selectedEvent} onClose={() => closeUpsert()} />
                </Dialog>
            </div>
        </div>
    )
}

export default CalendarPage