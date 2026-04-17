/**
 * Padrão 3 — Compact Table
 * Linhas ultra-compactas estilo tabela, sem borda entre cards — borda apenas interna.
 * Ideal para: grandes volumes de dados, views administrativas, exportação visual.
 *
 * Props do item: { id, name, email?, badge?, status, avatarName? }
 */
import Loading from '@/components/shared/Loading'
import { HiOutlineMail } from 'react-icons/hi'
import { getInitials, getAvatarColor, StatusDot, EmptyState } from './patternUtils'

const Pattern3 = ({ items = [], loading, onItemClick, emptyMessage }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='rounded-xl border border-gray-100 dark:border-gray-700/40 overflow-hidden bg-white dark:bg-gray-800/40'>
                {items.map((item, idx) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className={`group cursor-pointer flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20 transition-colors duration-100 ${
                            idx > 0 ? 'border-t border-gray-100 dark:border-gray-700/30' : ''
                        }`}
                    >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${getAvatarColor(item.avatarName ?? item.name)}`}>
                            {getInitials(item.avatarName ?? item.name)}
                        </div>

                        <span className='text-sm font-medium text-gray-700 dark:text-gray-200 w-44 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0'>
                            {item.name}
                        </span>

                        {item.email && (
                            <span className='flex-1 flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate'>
                                <HiOutlineMail size={10} className='flex-shrink-0' />
                                {item.email}
                            </span>
                        )}

                        {item.badge && (
                            <span className='hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 w-36 truncate text-right flex-shrink-0'>
                                {item.badge}
                            </span>
                        )}

                        <div className='flex-shrink-0'>
                            <StatusDot status={item.status} />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </Loading>
)

export default Pattern3
