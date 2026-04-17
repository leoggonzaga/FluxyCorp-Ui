import classNames from 'classnames'

const variants = {
    emerald: {
        border:     'border-emerald-200 dark:border-emerald-900/60',
        iconColor:  'text-emerald-500 dark:text-emerald-400',
        accentLine: 'from-emerald-400 via-emerald-300/50 to-transparent',
        subtitle:   'text-emerald-600/60 dark:text-emerald-400/50',
    },
    teal: {
        border:     'border-teal-200 dark:border-teal-900/60',
        iconColor:  'text-teal-500 dark:text-teal-400',
        accentLine: 'from-teal-400 via-teal-300/50 to-transparent',
        subtitle:   'text-teal-600/60 dark:text-teal-400/50',
    },
    blue: {
        border:     'border-blue-200 dark:border-blue-900/60',
        iconColor:  'text-blue-500 dark:text-blue-400',
        accentLine: 'from-blue-400 via-blue-300/50 to-transparent',
        subtitle:   'text-blue-600/60 dark:text-blue-400/50',
    },
    amber: {
        border:     'border-amber-200 dark:border-amber-900/60',
        iconColor:  'text-amber-500 dark:text-amber-400',
        accentLine: 'from-amber-400 via-amber-300/50 to-transparent',
        subtitle:   'text-amber-600/60 dark:text-amber-400/50',
    },
    violet: {
        border:     'border-violet-200 dark:border-violet-900/60',
        iconColor:  'text-violet-500 dark:text-violet-400',
        accentLine: 'from-violet-400 via-violet-300/50 to-transparent',
        subtitle:   'text-violet-600/60 dark:text-violet-400/50',
    },
    indigo: {
        border:     'border-indigo-200 dark:border-indigo-900/60',
        iconColor:  'text-indigo-500 dark:text-indigo-400',
        accentLine: 'from-indigo-400 via-indigo-300/50 to-transparent',
        subtitle:   'text-indigo-600/60 dark:text-indigo-400/50',
    },
    rose: {
        border:     'border-rose-200 dark:border-rose-900/60',
        iconColor:  'text-rose-500 dark:text-rose-400',
        accentLine: 'from-rose-400 via-rose-300/50 to-transparent',
        subtitle:   'text-rose-600/60 dark:text-rose-400/50',
    },
}

/**
 * Cartão com linha de acento gradiente entre header e conteúdo.
 *
 * @param {ReactNode} icon           - Ícone (cor controlada pela variante)
 * @param {string}    title          - Título do card
 * @param {string}    [subtitle]     - Subtítulo opcional
 * @param {string}    [color]        - Variante de cor
 * @param {ReactNode} [headerAction] - Elemento extra no lado direito do cabeçalho
 * @param {string}    [className]    - Classes extras no wrapper
 * @param {ReactNode} children       - Conteúdo do card
 */
const SectionCard = ({
    icon,
    title,
    subtitle,
    color = 'blue',
    headerAction,
    className,
    children,
}) => {
    const v = variants[color]

    return (
        <div className={classNames('section-card', v.border, className)}>

            {/* Header */}
            <div className={classNames(
                headerAction ? 'section-card-header-between' : 'section-card-header',
                'bg-white dark:bg-gray-800/20',
            )}>
                <div className='flex items-center gap-3'>
                    <span className={classNames('flex-shrink-0 w-5 h-5', v.iconColor)}>
                        {icon}
                    </span>
                    <div>
                        <p className='section-card-title'>{title}</p>
                        {subtitle && (
                            <p className={classNames('section-card-subtitle', v.subtitle)}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {headerAction && <div>{headerAction}</div>}
            </div>

            {/* Linha de acento gradiente */}
            <div className={classNames('h-[2px] bg-gradient-to-r', v.accentLine)} />

            <div className='section-card-body'>{children}</div>
        </div>
    )
}

export default SectionCard
