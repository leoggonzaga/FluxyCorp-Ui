import dayjs from 'dayjs'

const CalendarSlot = ({ arg }) => {
  const m = dayjs(arg.date).minute()
  const destaque = m % 30 === 0
  return (
    <div className={destaque ? 'opacity-100 font-semibold' : 'opacity-30'}>
      {dayjs(arg.date).format('h:mm a')}
    </div>
  )
}

export default CalendarSlot