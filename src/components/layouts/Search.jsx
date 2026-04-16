import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineSearch } from 'react-icons/hi'

// Mirror of PATIENTS mock — ideally would come from a shared service/store
const PATIENTS_SEARCH = [
    { id: 1, name: 'João Silva',   cpf: '123.456.789-00', birthDate: '1985-03-15', insurance: 'Unimed' },
    { id: 2, name: 'Maria Santos', cpf: '987.654.321-00', birthDate: '1992-07-22', insurance: 'Bradesco Saúde' },
    { id: 3, name: 'Carlos Oliveira', cpf: '456.789.123-00', birthDate: '1978-11-05', insurance: 'Amil' },
]

function calcAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

const Search = () => {
    const [term, setTerm] = useState('')
    const [results, setResults] = useState([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (term.trim().length < 2) {
            setResults([])
            setOpen(false)
            return
        }
        const lower = term.toLowerCase()
        const filtered = PATIENTS_SEARCH.filter(
            p => p.name.toLowerCase().includes(lower) || p.cpf.includes(term)
        )
        setResults(filtered)
        setOpen(true)
    }, [term])

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleSelect = (patient) => {
        setTerm(patient.name)
        setOpen(false)
        navigate(`/patients?id=${patient.id}`)
    }

    return (
        <div ref={containerRef} className='relative w-[400px]'>
            <div className='relative'>
                <HiOutlineSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none' />
                <input
                    className='w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400'
                    placeholder='Buscar paciente por nome ou CPF...'
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                />
            </div>

            {open && results.length > 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 overflow-hidden'>
                    {results.map(p => (
                        <button
                            key={p.id}
                            className='w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition text-left border-b last:border-0 border-gray-100 dark:border-gray-700'
                            onMouseDown={() => handleSelect(p)}
                        >
                            <div className='w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-base flex-shrink-0'>
                                {p.name.charAt(0)}
                            </div>
                            <div>
                                <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm'>{p.name}</p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>CPF: {p.cpf} · {calcAge(p.birthDate)} anos · {p.insurance}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {open && term.length >= 2 && results.length === 0 && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 p-4 text-center text-sm text-gray-500'>
                    Nenhum paciente encontrado
                </div>
            )}
        </div>
    )
}

export default Search