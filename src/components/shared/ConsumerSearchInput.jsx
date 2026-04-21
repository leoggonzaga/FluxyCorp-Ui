import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { HiOutlineSearch } from 'react-icons/hi'
import { getConsumersByCompany } from '@/api/consumer/consumerService'

const displayName = (p) => p.socialName || p.name

function calcAge(birthDate) {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

/**
 * ConsumerSearchInput — campo de busca de consumidores reutilizável.
 *
 * Props:
 *  value          string    — valor exibido no input (controlado)
 *  onChange       (term)    — dispara a cada keystroke (para filtro local)
 *  onSelect       (consumer)— dispara quando o usuário escolhe um resultado do dropdown
 *  onResults      (items[]) — quando fornecido, suprime o dropdown e entrega os resultados
 *                             para o pai renderizar inline
 *  allowFreeText  bool      — quando true, exibe opção "Usar '{nome}'" ao não encontrar paciente
 *  placeholder    string
 *  className      string    — classe do container externo
 *  inputClass     string    — classe extra no <input>
 */
const ConsumerSearchInput = ({
    value = '',
    onChange,
    onSelect,
    onResults,
    allowFreeText = false,
    placeholder = 'Buscar por nome, nome social ou CPF…',
    className = '',
    inputClass = '',
}) => {
    const [results, setResults]   = useState([])
    const [open, setOpen]         = useState(false)
    const [loading, setLoading]   = useState(false)
    const debounceRef             = useRef(null)
    const containerRef            = useRef(null)
    const justSelectedRef         = useRef(false)   // suprime o disparo pós-seleção
    const companyPublicId         = useSelector((s) => s.auth.user.companyPublicId)

    // Fetch quando o term mudar
    useEffect(() => {
        if (!value || value.trim().length < 2) {
            setResults([])
            setOpen(false)
            if (onResults) onResults([])
            return
        }
        // Quando onSelect muda o value externamente, ignoramos esse ciclo
        if (justSelectedRef.current) {
            justSelectedRef.current = false
            return
        }
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            if (!companyPublicId) return
            setLoading(true)
            try {
                const data = await getConsumersByCompany(companyPublicId, value.trim())
                const list = data ?? []
                setResults(list)
                if (onResults) onResults(list)
                else setOpen(true)
            } catch {
                setResults([])
                if (onResults) onResults([])
            } finally {
                setLoading(false)
            }
        }, 300)
        return () => clearTimeout(debounceRef.current)
    }, [value, companyPublicId])

    // Fecha ao clicar fora
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target))
                setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (consumer) => {
        justSelectedRef.current = true
        setResults([])
        setOpen(false)
        onSelect?.(consumer)
    }

    const handleFreeText = () => {
        justSelectedRef.current = true
        setResults([])
        setOpen(false)
        onSelect?.({ name: value.trim(), publicId: null })
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className='relative'>
                <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
                <input
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder={placeholder}
                    className={[
                        'w-full pl-9 pr-8 py-2 text-sm border border-gray-200 dark:border-gray-600',
                        'rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100',
                        'focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400',
                        'placeholder-gray-400 transition-all',
                        inputClass,
                    ].join(' ')}
                />
                {loading && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <div className='w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin' />
                    </div>
                )}
            </div>

            {open && (results.length > 0 || (!loading && value.length >= 2)) && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden'>
                    {results.length > 0 ? results.map((p) => {
                        const name     = displayName(p)
                        const hasAlias = p.socialName && p.socialName !== p.name
                        const age      = calcAge(p.birthDate)
                        return (
                            <button
                                key={p.publicId ?? p.id}
                                onMouseDown={() => handleSelect(p)}
                                className='w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700 transition text-left border-b last:border-0 border-gray-100 dark:border-gray-700'
                            >
                                <div className='w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm flex-shrink-0 select-none'>
                                    {name.charAt(0).toUpperCase()}
                                </div>
                                <div className='min-w-0 flex-1'>
                                    <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm truncate'>{name}</p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 truncate'>
                                        {hasAlias && <span>Civil: {p.name}{(p.cpf || age != null) ? ' · ' : ''}</span>}
                                        {p.cpf && <span>CPF: {p.cpf}</span>}
                                        {age != null && <span> · {age} anos</span>}
                                    </p>
                                </div>
                            </button>
                        )
                    }) : (
                        <div className='flex flex-col'>
                            <div className='px-4 py-2.5 text-sm text-center text-gray-400'>
                                Nenhum paciente encontrado
                            </div>
                            {allowFreeText && value.trim().length >= 2 && (
                                <button
                                    onMouseDown={handleFreeText}
                                    className='w-full flex items-center gap-3 px-4 py-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition text-left border-t border-gray-100 dark:border-gray-700'
                                >
                                    <div className='w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 text-sm flex-shrink-0 select-none font-bold'>
                                        +
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='font-semibold text-violet-700 dark:text-violet-300 text-sm truncate'>
                                            Continuar como &quot;{value.trim()}&quot;
                                        </p>
                                        <p className='text-xs text-gray-400 dark:text-gray-500'>
                                            Paciente não cadastrado
                                        </p>
                                    </div>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ConsumerSearchInput
