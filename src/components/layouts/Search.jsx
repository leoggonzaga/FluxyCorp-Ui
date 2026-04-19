import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConsumerSearchInput from '@/components/shared/ConsumerSearchInput'

const Search = () => {
    const [term, setTerm] = useState('')
    const navigate = useNavigate()

    const handleSelect = (consumer) => {
        setTerm(consumer.socialName || consumer.name)
        navigate(`/patients?id=${consumer.publicId ?? consumer.id}`)
    }

    return (
        <ConsumerSearchInput
            value={term}
            onChange={setTerm}
            onSelect={handleSelect}
            className='w-[400px]'
            placeholder='Buscar paciente por nome ou CPF...'
        />
    )
}

export default Search
