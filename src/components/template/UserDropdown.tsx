import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import useDarkMode from '@/utils/hooks/useDarkmode'
import { useAppSelector } from '@/store'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { HiOutlineLogout, HiOutlineUser, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import type { CommonProps } from '@/@types/common'
import type { JSX } from 'react'

type DropdownList = {
    label: string
    path: string
    icon: JSX.Element
}

const dropdownItemList: DropdownList[] = []

const itemCls =
    'flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer'

const _UserDropdown = ({ className }: CommonProps) => {
    const { signOut } = useAuth()
    const [isDark, setMode] = useDarkMode()
    const { userName, email } = useAppSelector((state) => state.auth.user)

    const displayName = userName || email || 'Usuário'
    const initial = displayName.charAt(0).toUpperCase()

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2.5 cursor-pointer')}>
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                {initial}
            </div>
            <div className="hidden md:block text-left">
                <p className="text-[11px] text-gray-400 dark:text-white/50 leading-none mb-0.5">Logado como</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none truncate max-w-[120px]">{displayName}</p>
            </div>
        </div>
    )

    return (
        <Dropdown
            menuStyle={{ minWidth: 256, padding: '8px' }}
            renderTitle={UserAvatar}
            placement="bottom-end"
        >
            {/* Header com info do usuário */}
            <Dropdown.Item variant="header">
                <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-base font-bold flex-shrink-0 shadow-md">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {email || 'Sem e-mail cadastrado'}
                        </p>
                    </div>
                </div>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            {/* Links configuráveis */}
            {dropdownItemList.map((item) => (
                <Dropdown.Item key={item.label} variant="custom" className="mb-0.5">
                    <Link to={item.path} className={itemCls}>
                        <span className="text-lg opacity-60">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                </Dropdown.Item>
            ))}

            {/* Toggle de tema */}
            <Dropdown.Item variant="custom" className="mb-0.5">
                <button
                    className={itemCls}
                    onClick={() => setMode(isDark ? 'light' : 'dark')}
                >
                    <span className="text-lg opacity-60">
                        {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
                    </span>
                    <span className="flex-1 text-left">{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                    <span
                        className={classNames(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide',
                            isDark
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                        )}
                    >
                        {isDark ? 'ESCURO' : 'CLARO'}
                    </span>
                </button>
            </Dropdown.Item>

            <Dropdown.Item variant="divider" />

            {/* Sair */}
            <Dropdown.Item variant="custom">
                <button className={classNames(itemCls, 'hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400')} onClick={signOut}>
                    <span className="text-lg opacity-60">
                        <HiOutlineLogout />
                    </span>
                    <span>Sair</span>
                </button>
            </Dropdown.Item>
        </Dropdown>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
