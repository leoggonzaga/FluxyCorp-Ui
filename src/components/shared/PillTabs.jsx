export default function PillTabs({ items = [], value = '', onChange, className = '' }) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
            {items.map((item) => {
                const active = value === item.value
                return (
                    <button
                        key={item.value}
                        type='button'
                        onClick={() => onChange?.(item.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            active
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                    >
                        {item.label}
                    </button>
                )
            })}
        </div>
    )
}
