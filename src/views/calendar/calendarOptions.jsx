import {
    HiOutlinePlus,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineUserGroup,
    HiOutlineTag,
} from 'react-icons/hi'
import { Calendar, Checkbox } from '../../components/ui'
import { Loading } from '../../components/shared'
import { enterpriseApiGetEmployees } from '../../api/enterprise/EnterpriseService'
import { useEffect, useState } from 'react'

const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500',
]

const TYPE_LIST = [
    { name: 'Consulta',     color: '#4f39f6' },
    { name: 'Avaliação',    color: '#f59e0b' },
    { name: 'Cirurgia',     color: '#f43f5e' },
    { name: 'Ortodontia',   color: '#10b981' },
    { name: 'Endodontia',   color: '#8b5cf6' },
    { name: 'Radiologia',   color: '#0ea5e9' },
    { name: 'Implante',     color: '#14b8a6' },
    { name: 'Emergência',   color: '#ef4444' },
]

function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const CalendarOptions = ({ handleChangeDate, openUpsert }) => {
    const [employees, setEmployees]           = useState([])
    const [isLoading, setIsLoading]           = useState(false)
    const [employeesChecked, setEmployeesChecked] = useState([])
    const [typesChecked, setTypesChecked]     = useState([])
    const [isOpen, setIsOpen]                 = useState(true)
    const [selectedDate, setSelectedDate]     = useState(null)

    useEffect(() => {
        setIsLoading(true)
        enterpriseApiGetEmployees()
            .then(res => { if (res?.data) setEmployees(res.data) })
            .finally(() => setIsLoading(false))
    }, [])

    const toggleEmployee = (id) =>
        setEmployeesChecked(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])

    const toggleType = (name) =>
        setTypesChecked(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])

    if (!isOpen) {
        return (
            <div className="flex flex-col items-center py-4 w-10 h-full">
                <button
                    onClick={() => setIsOpen(true)}
                    title="Abrir painel"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                    <HiOutlineChevronRight className="w-4 h-4" />
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-[240px] shrink-0 h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Filtros
                </span>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                </button>
            </div>

            {/* New appointment button */}
            <div className="px-3 pb-3">
                <button
                    onClick={openUpsert}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm shadow-indigo-500/30"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    Novo Agendamento
                </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-3" />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">

                {/* Mini calendar */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden shadow-sm">
                    <Calendar
                        className="calendarOption"
                        style={{ fontSize: 11 }}
                        onChange={(date) => {
                            setSelectedDate(date)
                            handleChangeDate(date)
                        }}
                        value={selectedDate}
                    />
                </div>

                {/* Employees */}
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <HiOutlineUserGroup className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Profissionais
                        </span>
                    </div>
                    <Loading loading={isLoading}>
                        <div className="space-y-1.5 min-h-[40px]">
                            {employees.length === 0 && !isLoading && (
                                <p className="text-[11px] text-gray-300 dark:text-gray-600 text-center py-2">
                                    Nenhum profissional
                                </p>
                            )}
                            {employees.map((emp, i) => {
                                const checked = employeesChecked.includes(emp.id)
                                const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length]
                                return (
                                    <label
                                        key={emp.id}
                                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-colors ${
                                            checked
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                                            {getInitials(emp.fullName)}
                                        </div>
                                        <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate font-medium">
                                            {emp.fullName}
                                        </span>
                                        <Checkbox
                                            checked={checked}
                                            onChange={() => toggleEmployee(emp.id)}
                                        />
                                    </label>
                                )
                            })}
                        </div>
                    </Loading>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                {/* Appointment types */}
                <div>
                    <div className="flex items-center gap-2 mb-2.5">
                        <HiOutlineTag className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            Tipos de Atendimento
                        </span>
                    </div>
                    <div className="space-y-1">
                        {TYPE_LIST.map((type) => {
                            const checked = typesChecked.includes(type.name)
                            return (
                                <label
                                    key={type.name}
                                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors ${
                                        checked
                                            ? 'bg-gray-50 dark:bg-gray-700/30'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'
                                    }`}
                                >
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: type.color }}
                                    />
                                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 font-medium">
                                        {type.name}
                                    </span>
                                    <Checkbox
                                        checked={checked}
                                        onChange={() => toggleType(type.name)}
                                    />
                                </label>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarOptions
