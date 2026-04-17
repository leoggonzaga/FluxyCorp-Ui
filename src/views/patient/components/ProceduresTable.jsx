import { Badge } from '@/components/ui'

const ProceduresTable = ({ appointment }) => {
    const total = appointment.procedures
        .filter((p) => p.status === 'done')
        .reduce((sum, p) => sum + p.value * p.qty, 0)

    return (
        <div className='rounded-lg border border-gray-200 dark:border-gray-700/50 overflow-hidden'>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 text-xs'>
                        <th className='text-left px-3 py-2 font-semibold'>Procedimento</th>
                        <th className='text-left px-3 py-2 font-semibold'>Profissional</th>
                        <th className='text-center px-3 py-2 font-semibold'>Qtd.</th>
                        <th className='text-right px-3 py-2 font-semibold'>Valor</th>
                        <th className='text-center px-3 py-2 font-semibold'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointment.procedures.map((proc, idx) => (
                        <tr
                            key={proc.id}
                            className={idx % 2 === 0
                                ? 'bg-white dark:bg-transparent'
                                : 'bg-gray-50 dark:bg-gray-800/20'}
                        >
                            <td className='px-3 py-2 text-gray-800 dark:text-gray-200 font-medium'>{proc.name}</td>
                            <td className='px-3 py-2 text-gray-700 dark:text-gray-300'>{proc.executedBy || appointment.professional}</td>
                            <td className='px-3 py-2 text-center text-gray-600 dark:text-gray-400'>{proc.qty}</td>
                            <td className='px-3 py-2 text-right text-gray-700 dark:text-gray-300'>
                                R$ {proc.value.toFixed(2).replace('.', ',')}
                            </td>
                            <td className='px-3 py-2 text-center'>
                                <Badge color={proc.status === 'done' ? 'green' : 'red'}>
                                    {proc.status === 'done' ? 'Realizado' : 'Cancelado'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className='bg-gray-100 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-700/50'>
                        <td colSpan={3} className='px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase'>
                            Total
                        </td>
                        <td className='px-3 py-2 text-right font-bold text-gray-800 dark:text-gray-200'>
                            R$ {total.toFixed(2).replace('.', ',')}
                        </td>
                        <td />
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}

export default ProceduresTable
