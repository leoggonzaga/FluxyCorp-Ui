import dayjs from "dayjs"
import { Tooltip } from "../../../components/ui"
import { useState } from "react"

const CalendarEventDay = ({ event }) => {
    const { consumerName, serviceColor, appointmentType } = event.extendedProps

    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const end = event.end ? dayjs(event.end).format('HH:mm') : ''

    const [hover, setHover] = useState(false)

    return (
        <div
            className='overflow-hidden'
        >


            <div className='flex items-center gap-1'>
                <Tooltip title='Avaliação' placement="bottom">
                    <div className={`p-1 bg-${serviceColor}-600 rounded-lg border-2`} />
                </Tooltip>

                <div className=''>
                    <Tooltip title={consumerName} placement="left">
                        <span style={{ fontWeight: 'bold' }}>{consumerName}</span>
                    </Tooltip>

                </div>
            </div>
            <span className='flex gap-1 whitespace-nowrap'>{start} - {end}</span>
        </div>
    )
}

export default CalendarEventDay;