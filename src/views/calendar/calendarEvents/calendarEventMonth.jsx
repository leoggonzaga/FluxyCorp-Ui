import { useState } from 'react'
import dayjs from 'dayjs'
import { Tooltip } from '../../../components/ui';

const CalendarEventMonth = ({ event }) => {
    const { patientName, serviceColor } = event.extendedProps

    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const end = event.end ? dayjs(event.end).format('HH:mm') : ''

    const [hover, setHover] = useState(false)

    return (
        <div
            style={{
                backgroundColor: hover ? '#0170e7ff' : '#007BFF', // muda no hover
                color: '#fff',
                padding: '2px 4px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                maxWidth: '130px',
                position: 'relative'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div className={`absolute top-0 left-0 h-full p-[3px] bg-${serviceColor}-600 border-r-2 border-gray-100 `} />
            <div className='ml-2'>
                <div className='flex gap-1 items-center'>
                    <Tooltip title='Avaliação'>
                        {/* <div className={`p-[3px] bg-${serviceColor}-600 rounded-lg border-2`} /> */}
                    </Tooltip>

                    <div style={{ fontSize: '0.75rem' }}>
                        {start} - {end}
                    </div>
                </div>

                <div className=''>
                    <span style={{ fontWeight: 'bold' }}>{patientName}</span>
                </div>
            </div>

        </div>
    )
}

export default CalendarEventMonth
