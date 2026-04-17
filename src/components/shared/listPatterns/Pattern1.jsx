/**
 * Padrão 1 — Slim Row
 * Linha horizontal compacta com avatar de iniciais, info e badge de cargo.
 * Ideal para: listas densas, consulta rápida, qualquer entidade com email/cargo.
 *
 * Props do item: { id, name, email?, meta?, badge?, status, avatarName? }
 */
import Loading from '@/components/shared/Loading'
import { HiOutlineBriefcase, HiOutlineIdentification, HiOutlineMail } from 'react-icons/hi'
import { getInitials, getAvatarColor, StatusDot, EmptyState } from './patternUtils'

const Pattern1 = ({ items = [], loading, onItemClick, emptyMessage }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='flex flex-col gap-2'>
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => onItemClick?.(item)}
                        className='group cursor-pointer flex items-center gap-4 px-4 py-3 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-xl hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:shadow-sm hover:shadow-indigo-100/60 hover:-translate-y-px transition-all duration-150'
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm ${getAvatarColor(item.avatarName ?? item.name)}`}>
                            {getInitials(item.avatarName ?? item.name)}
                        </div>

                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
                                {item.name}
                            </p>
                            <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
                                {item.email && (
                                    <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500 truncate'>
                                        <HiOutlineMail size={11} />
                                        {item.email}
                                    </span>
                                )}
                                {item.meta && (
                                    <span className='flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500'>
                                        <HiOutlineIdentification size={11} />
                                        {item.meta}
                                    </span>
                                )}
                            </div>
                        </div>

                        {item.badge && (
                            <div className='hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-700/40 flex-shrink-0'>
                                <HiOutlineBriefcase size={11} className='text-indigo-400' />
                                <span className='text-[11px] font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap'>
                                    {item.badge}
                                </span>
                            </div>
                        )}

                        <StatusDot status={item.status} />
                    </div>
                ))}
            </div>
        )}
    </Loading>
)

export default Pattern1
