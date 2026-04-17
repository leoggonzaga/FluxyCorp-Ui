import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineCheck } from 'react-icons/hi'
import classNames from 'classnames'

export const CLINIC_PROFILES = [
    { id: 'admin',         label: 'Administrador' },
    { id: 'doctor',        label: 'Médico / Dentista' },
    { id: 'nurse',         label: 'Enfermeiro(a)' },
    { id: 'receptionist',  label: 'Recepcionista' },
    { id: 'financial',     label: 'Financeiro' },
    { id: 'psychologist',  label: 'Psicólogo(a)' },
    { id: 'physio',        label: 'Fisioterapeuta' },
    { id: 'nutritionist',  label: 'Nutricionista' },
    { id: 'pharmacy',      label: 'Farmacêutico(a)' },
    { id: 'lab',           label: 'Laboratório' },
    { id: 'manager',       label: 'Gerente de Clínica' },
    { id: 'intern',        label: 'Estagiário(a)' },
]

const FilePermissionPopover = ({ permissions = [], onChange }) => {
    const [open, setOpen] = useState(false)
    const [pos, setPos] = useState({ top: 0, right: 0 })
    const btnRef = useRef(null)
    const dropRef = useRef(null)
    const isRestricted = permissions.length > 0

    useEffect(() => {
        const handler = (e) => {
            if (
                dropRef.current && !dropRef.current.contains(e.target) &&
                btnRef.current  && !btnRef.current.contains(e.target)
            ) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleToggle = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
        }
        setOpen((v) => !v)
    }

    const toggle = (id) => {
        onChange(
            permissions.includes(id)
                ? permissions.filter((p) => p !== id)
                : [...permissions, id],
        )
    }

    const dropdown = open && createPortal(
        <div
            ref={dropRef}
            style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
            className='w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden'
        >
            <div className='px-3 py-2 border-b border-gray-100 dark:border-gray-700/60'>
                <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Quem pode abrir</p>
            </div>

            <button
                onClick={() => onChange([])}
                className='w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition text-left'
            >
                <span className='text-sm text-gray-700 dark:text-gray-200'>Todos os perfis</span>
                {!isRestricted && <HiOutlineCheck className='w-4 h-4 text-indigo-500' />}
            </button>

            <div className='border-t border-gray-100 dark:border-gray-700/60 max-h-60 overflow-y-auto'>
                {CLINIC_PROFILES.map((profile) => (
                    <button
                        key={profile.id}
                        onClick={() => toggle(profile.id)}
                        className='w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition text-left'
                    >
                        <span className='text-sm text-gray-700 dark:text-gray-200'>{profile.label}</span>
                        {permissions.includes(profile.id) && (
                            <HiOutlineCheck className='w-4 h-4 text-indigo-500' />
                        )}
                    </button>
                ))}
            </div>

            {isRestricted && (
                <div className='border-t border-gray-100 dark:border-gray-700/60 px-3 py-2 bg-amber-50/60 dark:bg-amber-900/10'>
                    <p className='text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed'>
                        {permissions.map((id) => CLINIC_PROFILES.find((p) => p.id === id)?.label).filter(Boolean).join(', ')}
                    </p>
                </div>
            )}
        </div>,
        document.body,
    )

    return (
        <div className='relative flex-shrink-0'>
            <button
                ref={btnRef}
                onClick={handleToggle}
                title={isRestricted ? 'Acesso restrito — clique para editar' : 'Acesso liberado para todos'}
                className={classNames(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition',
                    isRestricted
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/40',
                )}
            >
                {isRestricted
                    ? <HiOutlineLockClosed className='w-3.5 h-3.5' />
                    : <HiOutlineLockOpen className='w-3.5 h-3.5' />}
            </button>
            {dropdown}
        </div>
    )
}

export default FilePermissionPopover
