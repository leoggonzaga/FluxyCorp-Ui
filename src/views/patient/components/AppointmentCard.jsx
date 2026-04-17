import { useState } from 'react'
import { Badge } from '@/components/ui'
import { HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi'
import ProceduresTable from './ProceduresTable'

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const AppointmentCard = ({ appointment }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden'>
            <button
                className='w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition text-left'
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <div className='bg-gray-700 dark:bg-gray-600 text-white rounded-lg p-2 text-center min-w-14 flex-shrink-0'>
                    <p className='text-xs'>{formatDate(appointment.date).slice(3)}</p>
                    <p className='font-bold text-lg leading-none'>{formatDate(appointment.date).slice(0, 2)}</p>
                </div>

                <div className='flex-1 min-w-0'>
                    <p className='font-semibold text-gray-800 dark:text-gray-200 text-sm truncate'>
                        {appointment.service}
                    </p>
                    <p className='text-xs text-gray-500'>{appointment.time} · {appointment.professional}</p>
                </div>

                <div className='flex items-center gap-2 flex-shrink-0'>
                    <Badge color='green'>Concluído</Badge>
                    {isOpen
                        ? <HiOutlineChevronUp className='text-gray-400' />
                        : <HiOutlineChevronDown className='text-gray-400' />}
                </div>
            </button>

            {isOpen && (
                <div className='bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50'>
                    <div className='px-4 pt-3 pb-2'>
                        <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>Anotações</p>
                        <p className='text-sm text-gray-700 dark:text-gray-300'>
                            {appointment.notes || 'Sem anotações.'}
                        </p>
                    </div>

                    {appointment.procedures?.length > 0 && (
                        <div className='px-4 pb-4'>
                            <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>
                                Procedimentos Realizados
                            </p>
                            <ProceduresTable appointment={appointment} />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AppointmentCard
