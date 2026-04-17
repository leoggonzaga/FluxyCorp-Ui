/**
 * Padrão 2 — Grid Cards
 * Cards centrados em grade responsiva (1→2→3 colunas).
 * Ideal para: diretório de equipe, catálogos visuais, poucos itens por vez.
 *
 * Props do item: { id, name, email?, badge?, status, avatarName? }
 */
import Loading from '@/components/shared/Loading'
import { HiOutlineMail } from 'react-icons/hi'
import { getInitials, getAvatarColor, StatusDot, EmptyState } from './patternUtils'

const Pattern2 = ({ items = [], loading, onItemClick, emptyMessage }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className='group cursor-pointer bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-2xl p-5 flex flex-col items-center text-center hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-md hover:shadow-indigo-100/50 hover:-translate-y-0.5 transition-all duration-150'
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3 shadow-md ${getAvatarColor(item.avatarName ?? item.name)}`}>
                            {getInitials(item.avatarName ?? item.name)}
                        </div>

                        <p className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate w-full group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
                            {item.name}
                        </p>

                        {item.badge && (
                            <span className='mt-1 text-[11px] font-medium text-indigo-500 dark:text-indigo-400'>
                                {item.badge}
                            </span>
                        )}

                        {item.email && (
                            <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 truncate max-w-full'>
                                <HiOutlineMail size={11} className='flex-shrink-0' />
                                {item.email}
                            </span>
                        )}

                        <div className='mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/40 w-full flex justify-center'>
                            <StatusDot status={item.status} />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </Loading>
)

export default Pattern2
