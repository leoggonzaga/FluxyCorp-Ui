import { HiOutlineBriefcase, HiOutlineIdentification, HiOutlineMail } from 'react-icons/hi'
import {
    getAvatarColor,
    getGradient,
    getInitials,
    StatusDot,
} from '../../../components/shared/listPatterns/patternUtils'

const InfoRow = ({ icon, label, value }) => (
    <div className='flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0'>
        <div className='w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0'>
            {icon}
        </div>
        <div className='min-w-0 flex-1'>
            <p className='text-[11px] text-gray-400 dark:text-gray-500 mb-0.5 uppercase tracking-wide'>
                {label}
            </p>
            <p className='text-sm font-medium text-gray-700 dark:text-gray-200 truncate'>
                {value || '—'}
            </p>
        </div>
    </div>
)

const EmployeeViewDetails = ({ data }) => {
    const name     = data?.person?.fullName || data?.fullName || ''
    const jobTitle = data?.jobTitle?.name || '—'
    const email    = data?.email || '—'
    const cpf      = data?.person?.nationalDocumentNumber || '—'

    return (
        <div className='flex flex-col w-2/6 rounded-2xl border border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-800 shadow-sm overflow-hidden flex-shrink-0'>
            <div className={`h-28 bg-gradient-to-br ${getGradient(name)} flex-shrink-0`} />

            <div className='flex flex-col items-center -mt-9 px-6 pb-6'>
                <div
                    className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-white dark:ring-gray-800 shadow-md flex-shrink-0 ${getAvatarColor(name)}`}
                >
                    {getInitials(name)}
                </div>

                <div className='mt-3 text-center'>
                    <h4 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-snug'>
                        {name || '—'}
                    </h4>
                    <span className='mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-700/40'>
                        {jobTitle}
                    </span>
                </div>

                <div className='mt-2.5'>
                    <StatusDot status='ativo' />
                </div>

                <div className='w-full mt-5 pt-1 border-t border-gray-100 dark:border-gray-700/50'>
                    <InfoRow icon={<HiOutlineMail size={15} />}           label='Email' value={email} />
                    <InfoRow icon={<HiOutlineIdentification size={15} />} label='CPF'   value={cpf} />
                    <InfoRow icon={<HiOutlineBriefcase size={15} />}      label='Cargo' value={jobTitle} />
                </div>
            </div>
        </div>
    )
}

export default EmployeeViewDetails
