/**
 * Padrão 4 — Profile Card
 * Cards com faixa gradiente no topo e avatar sobreposto — visual mais rico.
 * Ideal para: destaque de pessoas/produtos, home dashboards, poucos itens premium.
 *
 * Props do item: { id, name, email?, meta?, badge?, status, avatarName? }
 */
import Loading from '@/components/shared/Loading'
import { HiOutlineIdentification, HiOutlineMail } from 'react-icons/hi'
import { getInitials, getAvatarColor, getGradient, EmptyState } from './patternUtils'

const Pattern4 = ({ items = [], loading, onItemClick, emptyMessage }) => (
    <Loading loading={loading}>
        {!loading && items.length === 0 ? (
            <EmptyState message={emptyMessage} />
        ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {items.map((item) => {
                    const seed = item.avatarName ?? item.name
                    return (
                        <div
                            key={item.id}
                            onClick={() => onItemClick?.(item)}
                            className='group cursor-pointer bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/40 rounded-2xl overflow-hidden hover:border-transparent hover:shadow-lg hover:shadow-indigo-100/60 dark:hover:shadow-indigo-900/30 hover:-translate-y-0.5 transition-all duration-200'
                        >
                            {/* Faixa gradiente */}
                            <div className={`h-14 bg-gradient-to-r ${getGradient(seed)} relative`}>
                                <div className={`absolute -bottom-5 left-4 w-11 h-11 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-sm font-bold shadow-md ${getAvatarColor(seed)}`}>
                                    {getInitials(seed)}
                                </div>
                            </div>

                            {/* Conteúdo */}
                            <div className='pt-7 pb-4 px-4'>
                                <p className='text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors'>
                                    {item.name}
                                </p>
                                {item.badge && (
                                    <p className='text-[11px] text-indigo-500 dark:text-indigo-400 font-medium mt-0.5 truncate'>
                                        {item.badge}
                                    </p>
                                )}

                                <div className='mt-3 space-y-1.5'>
                                    {item.email && (
                                        <span className='flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 truncate'>
                                            <HiOutlineMail size={11} className='flex-shrink-0' />
                                            {item.email}
                                        </span>
                                    )}
                                    {item.meta && (
                                        <span className='flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500'>
                                            <HiOutlineIdentification size={11} className='flex-shrink-0' />
                                            {item.meta}
                                        </span>
                                    )}
                                </div>

                                <div className='flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/40'>
                                    {(() => {
                                        const active = item.status === 'active' || item.status === 'ativo'
                                        return (
                                            <>
                                                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                <span className={`text-[11px] font-medium ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {active ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
    </Loading>
)

export default Pattern4
