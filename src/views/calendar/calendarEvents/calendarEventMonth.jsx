import dayjs from 'dayjs'

const COLOR_MAP = {
    indigo:  { bg: 'rgba(79,57,246,0.10)',  stripe: '#4f39f6', text: '#4338ca' },
    sky:     { bg: 'rgba(14,165,233,0.10)', stripe: '#0ea5e9', text: '#0369a1' },
    emerald: { bg: 'rgba(16,185,129,0.10)', stripe: '#10b981', text: '#047857' },
    rose:    { bg: 'rgba(244,63,94,0.10)',  stripe: '#f43f5e', text: '#be123c' },
    amber:   { bg: 'rgba(245,158,11,0.10)', stripe: '#f59e0b', text: '#92400e' },
    purple:  { bg: 'rgba(139,92,246,0.10)', stripe: '#8b5cf6', text: '#6d28d9' },
    blue:    { bg: 'rgba(59,130,246,0.10)', stripe: '#3b82f6', text: '#1d4ed8' },
    teal:    { bg: 'rgba(20,184,166,0.10)', stripe: '#14b8a6', text: '#0f766e' },
    cyan:    { bg: 'rgba(6,182,212,0.10)',  stripe: '#06b6d4', text: '#0e7490' },
    pink:    { bg: 'rgba(236,72,153,0.10)', stripe: '#ec4899', text: '#9d174d' },
    orange:  { bg: 'rgba(249,115,22,0.10)', stripe: '#f97316', text: '#9a3412' },
}

const DEFAULT = { bg: 'rgba(79,57,246,0.10)', stripe: '#4f39f6', text: '#4338ca' }

const CalendarEventMonth = ({ event }) => {
    const { consumerName, serviceColor } = event.extendedProps
    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const c = COLOR_MAP[serviceColor] || DEFAULT

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'stretch',
                backgroundColor: c.bg,
                borderRadius: 5,
                overflow: 'hidden',
                cursor: 'pointer',
                fontSize: '0.72rem',
                lineHeight: 1.3,
                height: '100%',
            }}
        >
            <div style={{ width: 3, backgroundColor: c.stripe, flexShrink: 0, borderRadius: '3px 0 0 3px' }} />
            <div style={{ padding: '2px 5px', overflow: 'hidden', flex: 1 }}>
                <div style={{ fontWeight: 700, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {consumerName || event.title}
                </div>
                {start && (
                    <div style={{ color: c.text, opacity: 0.65, fontSize: '0.65rem', fontVariantNumeric: 'tabular-nums' }}>
                        {start}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CalendarEventMonth
