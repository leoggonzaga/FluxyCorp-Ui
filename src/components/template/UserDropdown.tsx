import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'
import useDarkMode from '@/utils/hooks/useDarkmode'
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

const _UserDropdown = ({ className }: CommonProps) => {
    const { signOut } = useAuth()
    const [isDark, setMode] = useDarkMode()

    const UserAvatar = (
        <div className={classNames(className, 'flex items-center gap-2')}>
            <Avatar size={32} shape="circle" icon={<HiOutlineUser />} />
            <div className="hidden md:block">
                <div className="text-xs capitalize">admin</div>
                <div className="font-bold">User01</div>
            </div>
        </div>
    )

    return (
        <div>
            <Dropdown
                menuStyle={{ minWidth: 240 }}
                renderTitle={UserAvatar}
                placement="bottom-end"
            >
                <Dropdown.Item variant="header">
                    <div className="py-2 px-3 flex items-center gap-2">
                        <Avatar shape="circle" icon={<HiOutlineUser />} />
                        <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">
                                User01
                            </div>
                            <div className="text-xs">user01@mail.com</div>
                        </div>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                {dropdownItemList.map((item) => (
                    <Dropdown.Item
                        key={item.label}
                        eventKey={item.label}
                        className="mb-1 px-0"
                    >
                        <Link
                            className="flex h-full w-full px-2"
                            to={item.path}
                        >
                            <span className="flex gap-2 items-center w-full">
                                <span className="text-xl opacity-50">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </span>
                        </Link>
                    </Dropdown.Item>
                ))}
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="theme-toggle"
                    className="px-0 mb-1"
                    onClick={() => setMode(isDark ? 'light' : 'dark')}
                >
                    <div className="flex items-center justify-between w-full px-3">
                        <span className="flex gap-2 items-center">
                            <span className="text-xl opacity-50">
                                {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
                            </span>
                            <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
                        </span>
                        <span
                            className={classNames(
                                'text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide',
                                isDark
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                            )}
                        >
                            {isDark ? 'ESCURO' : 'CLARO'}
                        </span>
                    </div>
                </Dropdown.Item>
                <Dropdown.Item variant="divider" />
                <Dropdown.Item
                    eventKey="Sign Out"
                    className="gap-2"
                    onClick={signOut}
                >
                    <span className="text-xl opacity-50">
                        <HiOutlineLogout />
                    </span>
                    <span>Sign Out</span>
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

const UserDropdown = withHeaderItem(_UserDropdown)

export default UserDropdown
