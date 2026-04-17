import dayjs from 'dayjs'

const COLOR_MAP = {
    indigo:  { stripe: '#4f39f6', name: '#3730a3', time: '#4f39f6' },
    sky:     { stripe: '#0ea5e9', name: '#075985', time: '#0ea5e9' },
    emerald: { stripe: '#10b981', name: '#065f46', time: '#10b981' },
    rose:    { stripe: '#f43f5e', name: '#9f1239', time: '#f43f5e' },
    amber:   { stripe: '#f59e0b', name: '#78350f', time: '#d97706' },
    purple:  { stripe: '#8b5cf6', name: '#4c1d95', time: '#8b5cf6' },
    blue:    { stripe: '#3b82f6', name: '#1e3a8a', time: '#3b82f6' },
    teal:    { stripe: '#14b8a6', name: '#134e4a', time: '#14b8a6' },
    cyan:    { stripe: '#06b6d4', name: '#164e63', time: '#06b6d4' },
    pink:    { stripe: '#ec4899', name: '#831843', time: '#ec4899' },
    orange:  { stripe: '#f97316', name: '#7c2d12', time: '#ea580c' },
}

const DEFAULT = { stripe: '#4f39f6', name: '#3730a3', time: '#4f39f6' }

const CalendarEventWeek = ({ event }) => {
    const { consumerName, serviceColor, appointmentType } = event.extendedProps
    const start = event.start ? dayjs(event.start).format('HH:mm') : ''
    const end   = event.end   ? dayjs(event.end).format('HH:mm')   : ''
    const c = COLOR_MAP[serviceColor] || DEFAULT

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden', borderRadius: 4 }}>
            {/* Stripe */}
            <div style={{ width: 3, backgroundColor: c.stripe, flexShrink: 0 }} />

            {/* Content */}
            <div style={{ padding: '3px 6px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1 }}>
                <div style={{
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    color: c.name,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.25,
                }}>
                    {consumerName || event.title}
                </div>

                {(start || end) && (
                    <div style={{
                        fontSize: '0.65rem',
                        color: c.time,
                        opacity: 0.85,
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                    }}>
                        {start}{end ? ` – ${end}` : ''}
                    </div>
                )}

                {appointmentType && (
                    <div style={{
                        fontSize: '0.60rem',
                        color: c.stripe,
                        opacity: 0.7,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 1,
                    }}>
                        {appointmentType}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CalendarEventWeek
