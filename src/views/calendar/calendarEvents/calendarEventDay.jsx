import dayjs from 'dayjs'

const COLOR_MAP = {
    indigo:  { stripe: '#4f39f6', bg: 'rgba(79,57,246,0.07)',  name: '#3730a3', time: '#4f39f6',  type: '#6d5df7' },
    sky:     { stripe: '#0ea5e9', bg: 'rgba(14,165,233,0.07)', name: '#075985', time: '#0ea5e9',  type: '#38bdf8' },
    emerald: { stripe: '#10b981', bg: 'rgba(16,185,129,0.07)', name: '#065f46', time: '#059669',  type: '#34d399' },
    rose:    { stripe: '#f43f5e', bg: 'rgba(244,63,94,0.07)',  name: '#9f1239', time: '#e11d48',  type: '#fb7185' },
    amber:   { stripe: '#f59e0b', bg: 'rgba(245,158,11,0.07)', name: '#78350f', time: '#d97706',  type: '#fbbf24' },
    purple:  { stripe: '#8b5cf6', bg: 'rgba(139,92,246,0.07)', name: '#4c1d95', time: '#7c3aed',  type: '#a78bfa' },
    blue:    { stripe: '#3b82f6', bg: 'rgba(59,130,246,0.07)', name: '#1e3a8a', time: '#2563eb',  type: '#60a5fa' },
    teal:    { stripe: '#14b8a6', bg: 'rgba(20,184,166,0.07)', name: '#134e4a', time: '#0d9488',  type: '#2dd4bf' },
    cyan:    { stripe: '#06b6d4', bg: 'rgba(6,182,212,0.07)',  name: '#164e63', time: '#0891b2',  type: '#22d3ee' },
    pink:    { stripe: '#ec4899', bg: 'rgba(236,72,153,0.07)', name: '#831843', time: '#db2777',  type: '#f472b6' },
    orange:  { stripe: '#f97316', bg: 'rgba(249,115,22,0.07)', name: '#7c2d12', time: '#ea580c',  type: '#fb923c' },
}

const DEFAULT = { stripe: '#4f39f6', bg: 'rgba(79,57,246,0.07)', name: '#3730a3', time: '#4f39f6', type: '#6d5df7' }

const CalendarEventDay = ({ event }) => {
    const { consumerName, serviceColor, appointmentType } = event.extendedProps
    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const end   = event.end   ? dayjs(event.end).format('HH:mm')   : ''
    const c = COLOR_MAP[serviceColor] || DEFAULT

    return (
        <div style={{
            display: 'flex',
            height: '100%',
            overflow: 'hidden',
            borderRadius: 6,
            backgroundColor: c.bg,
        }}>
            {/* Stripe */}
            <div style={{ width: 4, backgroundColor: c.stripe, flexShrink: 0, borderRadius: '4px 0 0 4px' }} />

            {/* Content */}
            <div style={{ padding: '5px 9px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Patient name */}
                <div style={{
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    color: c.name,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.3,
                }}>
                    {consumerName || event.title}
                </div>

                {/* Time row */}
                {(start || end) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: c.stripe, flexShrink: 0 }} />
                        <span style={{
                            fontSize: '0.70rem',
                            color: c.time,
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 600,
                        }}>
                            {start}{end ? ` – ${end}` : ''}
                        </span>
                    </div>
                )}

                {/* Type badge */}
                {appointmentType && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: '0.62rem',
                        color: c.type,
                        fontWeight: 600,
                        opacity: 0.9,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {appointmentType}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CalendarEventDay
