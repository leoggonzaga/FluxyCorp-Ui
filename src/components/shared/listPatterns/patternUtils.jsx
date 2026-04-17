export const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
    'bg-pink-500', 'bg-blue-500', 'bg-teal-500', 'bg-cyan-500',
]

export const GRADIENT_COLORS = [
    'from-indigo-400 to-violet-500',
    'from-violet-400 to-purple-500',
    'from-purple-400 to-pink-500',
    'from-blue-400 to-indigo-500',
    'from-teal-400 to-cyan-500',
    'from-pink-400 to-rose-500',
    'from-cyan-400 to-blue-500',
]

export const getInitials = (name = '') => {
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
}

const nameHash = (name = '') => [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)

export const getAvatarColor = (name = '') => AVATAR_COLORS[nameHash(name) % AVATAR_COLORS.length]
export const getGradient    = (name = '') => GRADIENT_COLORS[nameHash(name) % GRADIENT_COLORS.length]

export const StatusDot = ({ status }) => {
    const active = status === 'active' || status === 'ativo'
    return (
        <div className='flex items-center gap-1.5 flex-shrink-0'>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <span className={`text-[11px] font-medium ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {active ? 'Ativo' : 'Inativo'}
            </span>
        </div>
    )
}

export const EmptyState = ({ message = 'Nenhum item encontrado' }) => (
    <div className='flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600'>
        <svg className='w-11 h-11 mb-3 opacity-30' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5}
                d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' />
        </svg>
        <p className='text-sm font-medium'>{message}</p>
    </div>
)
