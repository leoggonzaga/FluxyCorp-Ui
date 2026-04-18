/**
 * Padrão 1 — Slim Row
 * Linha horizontal compacta com avatar de iniciais, info e badge de cargo.
 * Ideal para: listas densas, consulta rápida, qualquer entidade com email/cargo.
 *
 * Props do item:
 *   { id, name, email?, emailIcon?, meta?, metaIcon?, badge?, badgeColor?,
 *     status?, avatarName?, avatarColor? }
 *   badgeColor: string de classes Tailwind para sobrescrever a cor padrão indigo do badge
 *   avatarColor: string de classes Tailwind para sobrescrever a cor do avatar
 *
 * Props extras:
 *   actions: Array<{ key, icon, label?, onClick(item), className?, tooltip?, visible?(item) }>
 *     visible(item): função opcional — se retornar false, o botão não é renderizado para aquela linha
 */
import Loading from '@/components/shared/Loading'
import { HiOutlineBriefcase, HiOutlineIdentification, HiOutlineMail } from 'react-icons/hi'
import { getInitials, getAvatarColor, StatusDot, EmptyState } from './patternUtils'

const DEFAULT_BADGE = 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/40 text-indigo-600 dark:text-indigo-400'
const DEFAULT_BADGE_ICON_CLS = 'text-indigo-400'

const Pattern1 = ({ items = [], loading, onItemClick, emptyMessage, actions = [] }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='flex flex-col gap-2'>
                {items.map((item) => {
                    const visibleActions = actions.filter(a => !a.visible || a.visible(item))
                    const badgeCls = item.badgeColor ?? DEFAULT_BADGE
                    const badgeIconCls = item.badgeColor ? '' : DEFAULT_BADGE_ICON_CLS
                    const EmailIcon = item.emailIcon ?? HiOutlineMail
                    const MetaIcon  = item.metaIcon  ?? HiOutlineIdentification
                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick?.(item)}
                            className={`group flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-sm hover:shadow-indigo-100/60 hover:-translate-y-px transition-all duration-150 ${onItemClick ? 'cursor-pointer' : ''}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm ${item.avatarColor ?? getAvatarColor(item.avatarName ?? item.name)}`}>
                                {getInitials(item.avatarName ?? item.name)}
                            </div>

                            <div className='flex-1 min-w-0'>
                                <p className={`text-sm font-semibold text-gray-800 dark:text-gray-100 truncate transition-colors ${onItemClick ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : ''}`}>
                                    {item.name}
                                </p>
                                <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
                                    {item.email && (
                                        <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate'>
                                            <EmailIcon size={11} />
                                            {item.email}
                                        </span>
                                    )}
                                    {item.meta && (
                                        <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500'>
                                            <MetaIcon size={11} />
                                            {item.meta}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {item.badge && (
                                <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 ${badgeCls}`}>
                                    {item.badgeIcon
                                        ? <item.badgeIcon size={11} className={badgeIconCls} />
                                        : <HiOutlineBriefcase size={11} className={badgeIconCls} />
                                    }
                                    <span className='text-[11px] font-medium whitespace-nowrap'>
                                        {item.badge}
                                    </span>
                                </div>
                            )}

                            {item.status != null && <StatusDot status={item.status} />}

                            {visibleActions.length > 0 && (
                                <div
                                    className='flex items-center gap-1 ml-1 flex-shrink-0'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {visibleActions.map((action) => (
                                        action.label ? (
                                            <button
                                                key={action.key}
                                                title={action.tooltip}
                                                onClick={() => action.onClick?.(item)}
                                                className={action.className ?? 'px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 transition-colors'}
                                            >
                                                {action.label}
                                            </button>
                                        ) : (
                                            <button
                                                key={action.key}
                                                title={action.tooltip}
                                                onClick={() => action.onClick?.(item)}
                                                className={`p-1.5 rounded-lg transition-colors duration-150 ${action.className ?? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            >
                                                {action.icon}
                                            </button>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}
    </Loading>
)

export default Pattern1
