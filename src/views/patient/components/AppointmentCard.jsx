import { useState } from 'react'
import { Badge } from '@/components/ui'
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'
import ProceduresTable from './ProceduresTable'

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const AppointmentCard = ({ appointment }) => {
    const [showProcedures, setShowProcedures] = useState(false)

    return (
        <div className='border border-gray-200 dark:border-gray-700/40 rounded-xl overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 shadow-sm'>
            <div className='p-4'>
                <div className='flex gap-4'>
                    {/* Data - design criativo com gradiente */}
                    <div className='flex flex-col items-center justify-center px-3 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/20 shadow-xs min-w-[64px] flex-shrink-0'>
                        <p className='text-xs font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider'>
                            {formatDate(appointment.date).slice(3)}
                        </p>
                        <p className='text-xl font-bold text-indigo-700 dark:text-indigo-200 leading-none mt-0.5'>
                            {formatDate(appointment.date).slice(0, 2)}
                        </p>
                    </div>

                    {/* Conteúdo principal */}
                    <div className='flex-1 min-w-0 space-y-3'>
                        {/* Header com serviço e badge */}
                        <div className='flex items-center justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                                <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm truncate'>
                                    {appointment.service}
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{appointment.time} · {appointment.professional}</p>
                            </div>
                            <div className='px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/25'>
                                <span className='text-xs font-bold text-white'>Concluído</span>
                            </div>
                        </div>

                        {/* Evolução Clínica - design bonito */}
                        <div className='space-y-2.5'>
                            <p className='text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider'>Evolução Clínica</p>
                            <div className='relative group'>
                                <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl blur-sm opacity-60 group-hover:opacity-80 transition-opacity'></div>
                                <div className='relative bg-white dark:bg-gray-800/60 backdrop-blur-md rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm shadow-indigo-500/5 p-4'>
                                    <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-400 rounded-l-2xl opacity-60'></div>
                                    <p className='text-sm text-gray-700 dark:text-gray-200 leading-relaxed pl-3 font-medium'>
                                        {appointment.evolution || appointment.notes || 'Sem evolução registrada.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Procedimentos */}
                        {appointment.procedures?.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setShowProcedures((prev) => !prev)}
                                    className='flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors'
                                >
                                    <span>Procedimentos</span>
                                    {showProcedures
                                        ? <HiOutlineChevronUp className='w-3.5 h-3.5' />
                                        : <HiOutlineChevronDown className='w-3.5 h-3.5' />}
                                </button>
                                
                                {showProcedures && (
                                    <div className='mt-2'>
                                        <ProceduresTable appointment={appointment} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppointmentCard
