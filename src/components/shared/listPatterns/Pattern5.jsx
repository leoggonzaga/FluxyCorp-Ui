/**
 * Padrão 5 — Slim Row + Metric
 * Linha slim com barra de cor lateral, duas sub-linhas de info e métrica numérica destacada.
 * Ideal para: movimentações de estoque, solicitações, transações — qualquer lista com quantidade.
 *
 * Props do item:
 *   id            — chave única
 *   name          — texto principal (bold)
 *   sub1?         — sub-linha 1 abaixo do nome
 *   sub1Icon?     — componente react-icons para sub1
 *   sub2?         — sub-linha 2 abaixo do nome
 *   sub2Icon?     — componente react-icons para sub2
 *   badge?        — texto do badge de tipo/status
 *   badgeColor?   — classes Tailwind do badge (default: indigo)
 *   badgeIcon?    — componente react-icons dentro do badge
 *   barColor?     — classe Tailwind da barra lateral esquerda (ex: 'bg-orange-400')
 *   metric?       — valor numérico destacado (ex: '+3', '−5', '12')
 *   metricColor?  — classe Tailwind de cor do metric (ex: 'text-emerald-600')
 *   metricSub?    — texto abaixo do metric (ex: 'un' ou '10 → 7')
 *   avatarName?   — nome usado para gerar iniciais do avatar
 *   avatarColor?  — override da cor automática do avatar
 *   _raw          — objeto original (passado para callbacks)
 *
 * Props do componente:
 *   actions: Array<{
 *     key, label?, icon?, tooltip?,
 *     visible?(item) → bool,   — se false, botão não aparece nessa linha
 *     onClick(item),
 *     className?
 *   }>
 *   onItemClick?(item) — clique na linha inteira
 */
import Loading from '@/components/shared/Loading'
import { getInitials, getAvatarColor, EmptyState } from './patternUtils'

const DEFAULT_BADGE = 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/40 text-indigo-600 dark:text-indigo-400'

const Pattern5 = ({ items = [], loading, onItemClick, emptyMessage, actions = [] }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='flex flex-col gap-2'>
                {items.map((item) => {
                    const visibleActions = actions.filter(a => !a.visible || a.visible(item))
                    const Sub1Icon = item.sub1Icon
                    const Sub2Icon = item.sub2Icon
                    const BadgeIcon = item.badgeIcon

                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick?.(item)}
                            className={`group flex items-stretch gap-0 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-sm hover:shadow-indigo-100/60 hover:-translate-y-px transition-all duration-150 ${onItemClick ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            {/* Barra lateral de cor */}
                            <div className={`w-1 flex-shrink-0 ${item.barColor ?? 'bg-gray-200 dark:bg-gray-700'}`} />

                            {/* Conteúdo principal */}
                            <div className='flex items-center gap-4 px-4 py-3 flex-1 min-w-0'>

                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${item.avatarColor ?? getAvatarColor(item.avatarName ?? item.name)}`}>
                                    {getInitials(item.avatarName ?? item.name)}
                                </div>

                                {/* Nome + sub-linhas */}
                                <div className='flex-1 min-w-0'>
                                    <p className={`text-sm font-semibold text-gray-800 dark:text-gray-100 truncate transition-colors ${onItemClick ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : ''}`}>
                                        {item.name}
                                    </p>
                                    <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
                                        {item.sub1 && (
                                            <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate'>
                                                {Sub1Icon && <Sub1Icon size={11} className='flex-shrink-0' />}
                                                {item.sub1}
                                            </span>
                                        )}
                                        {item.sub2 && (
                                            <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500'>
                                                {Sub2Icon && <Sub2Icon size={11} className='flex-shrink-0' />}
                                                {item.sub2}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Badge tipo/status */}
                                {item.badge && (
                                    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 text-[11px] font-semibold ${item.badgeColor ?? DEFAULT_BADGE}`}>
                                        {BadgeIcon && <BadgeIcon size={11} />}
                                        <span className='whitespace-nowrap'>{item.badge}</span>
                                    </div>
                                )}

                                {/* Métrica numérica — largura fixa para alinhar entre linhas */}
                                {item.metric != null && (
                                    <div className='text-right flex-shrink-0 w-16'>
                                        <p className={`text-xl font-bold leading-tight ${item.metricColor ?? 'text-gray-700 dark:text-gray-200'}`}>
                                            {item.metric}
                                        </p>
                                        {item.metricSub && (
                                            <p className='text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap'>
                                                {item.metricSub}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Ações — largura fixa para manter alinhamento quando visible() varia */}
                                {actions.length > 0 && (
                                    <div
                                        className='flex items-center justify-end gap-1.5 flex-shrink-0 w-36'
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {visibleActions.map((action) =>
                                            action.label ? (
                                                <button
                                                    key={action.key}
                                                    title={action.tooltip}
                                                    onClick={() => action.onClick?.(item)}
                                                    className={action.className ?? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm'}
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
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
    </Loading>
)

export default Pattern5
