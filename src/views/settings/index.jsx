import { HiOutlineShieldCheck } from 'react-icons/hi'
import RoleManagement from "./RoleManagement"

const Settings = () => {
    return (
        <div className='p-6 space-y-4'>
            <div className='flex items-center gap-3'>
                <div className='w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0'>
                    <HiOutlineShieldCheck className='w-5 h-5 text-violet-600 dark:text-violet-400' />
                </div>
                <div>
                    <h2 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-tight'>Gerenciar Perfis</h2>
                    <p className='text-xs text-gray-400 dark:text-gray-500'>Defina os perfis de acesso e as permissões de cada um</p>
                </div>
            </div>

            <RoleManagement />
        </div>
    )
}

export default Settings
