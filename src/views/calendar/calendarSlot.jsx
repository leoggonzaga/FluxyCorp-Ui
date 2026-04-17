import dayjs from 'dayjs'

const CalendarSlot = ({ arg }) => {
    const m = dayjs(arg.date).minute()
    const isHour = m === 0

    return (
        <div style={{
            fontSize: isHour ? '0.70rem' : '0.62rem',
            fontWeight: isHour ? 600 : 400,
            color: isHour ? '#6366f1' : '#9ca3af',
            opacity: isHour ? 1 : 0.6,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: isHour ? '0.02em' : 0,
        }}>
            {dayjs(arg.date).format('HH:mm')}
        </div>
    )
}

export default CalendarSlot
