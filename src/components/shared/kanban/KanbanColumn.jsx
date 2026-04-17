/**
 * KanbanColumn — coluna genérica do padrão kanban da aplicação.
 *
 * Responsável pelo visual da coluna (fundo tintado, header, divider, área de cards).
 * A lógica de drag-and-drop (SortableContext, useDroppable) fica no consumidor,
 * que passa `isOver` e `columnRef` quando necessário.
 *
 * Props:
 *   accent       — cor principal hex (ex: '#6366f1')
 *   accentLight  — cor de fundo suave (ex: 'rgba(99,102,241,0.08)')
 *   icon         — componente de ícone React
 *   title        — título da coluna
 *   count        — quantidade de itens
 *   isOver       — boolean, intensifica o fundo no drag-over
 *   columnRef    — ref para useDroppable do dnd-kit
 *   emptyLabel   — texto quando vazio (padrão: 'Vazio')
 *   minHeight    — altura mínima da área de cards (padrão: '11rem')
 *   footer       — node opcional renderizado após os cards (ex: total em R$)
 *   children     — cards
 */
const KanbanColumn = ({
    accent,
    accentLight,
    icon: Icon,
    title,
    count = 0,
    isOver = false,
    columnRef,
    emptyLabel = 'Vazio',
    minHeight = '11rem',
    footer,
    children,
}) => {
    const bg = isOver
        ? accentLight?.replace(/[\d.]+\)$/, '0.14)')
        : accentLight

    return (
        <div
            ref={columnRef}
            style={{ background: bg }}
            className='rounded-2xl border border-white/60 dark:border-gray-700/40 backdrop-blur-md shadow-sm transition-colors duration-200 overflow-hidden'
        >
            {/* Header */}
            <div className='flex items-center gap-2 px-3 pt-3 pb-2'>
                {Icon && (
                    <div
                        className='w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0'
                        style={{ background: accent + '22' }}
                    >
                        <Icon className='w-4 h-4' style={{ color: accent }} />
                    </div>
                )}
                <h3 className='font-semibold text-gray-700 dark:text-gray-200 text-xs flex-1 leading-tight'>
                    {title}
                </h3>
                <span
                    className='text-xs font-bold min-w-[20px] text-center px-1.5 py-0.5 rounded-full'
                    style={{ background: accent + '22', color: accent }}
                >
                    {count}
                </span>
            </div>

            {/* Divider */}
            <div className='mx-3 h-px mb-2' style={{ background: accent + '30' }} />

            {/* Body */}
            <div className='px-2 pb-2 space-y-2' style={{ minHeight }}>
                {count === 0 && (
                    <div
                        className='flex items-center justify-center rounded-xl border border-dashed text-[11px] text-gray-400 h-20'
                        style={{ borderColor: accent + '40' }}
                    >
                        {emptyLabel}
                    </div>
                )}
                {children}
            </div>

            {footer && (
                <div className='mx-2 mb-2'>
                    <div className='h-px mb-1.5' style={{ background: accent + '20' }} />
                    {footer}
                </div>
            )}
        </div>
    )
}

export default KanbanColumn
