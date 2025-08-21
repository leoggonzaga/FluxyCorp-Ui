import { useState } from 'react'
import dayjs from 'dayjs'
import { Tooltip } from '../../../components/ui';

const CalendarEventWeek = ({ event }) => {

    const { patientName, serviceColor } = event.extendedProps

    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const end = event.end ? dayjs(event.end).format('HH:mm') : ''

    const [hover, setHover] = useState(false)

    return (

        <div
            className=''
        >
            <Tooltip title='Avaliação' placement='left'>
                <div className={`absolute top-0 left-0 h-full p-[3px] bg-${serviceColor}-600 border-r-1 border-gray-100 rounded-l-lg`} />
            </Tooltip>

            <span class="[writing-mode:sideways-lr] rotate-180 ml-1 mt-1">
                <Tooltip title={patientName}>
                    {patientName}
                </Tooltip>

            </span>

            <div className='relative'>
                {/* <span style={{ fontWeight: 'bold' }} className='rotate-90 flex items-center left-0 top-0 absolute mt-2'>{patientName}</span> */}
                {/* <span className='flex gap-1 whitespace-nowrap'>{start} - {end}</span> */}
            </div>

        </div >
    )
}

export default CalendarEventWeek