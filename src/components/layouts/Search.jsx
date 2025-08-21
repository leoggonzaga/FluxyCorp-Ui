import { HiOutlineSearch } from "react-icons/hi";
import { Input, Select, Spinner } from "../ui";
import AsyncSelect from 'react-select/async'
import Loading from "../shared/Loading";


const Search = () => {
    return (
        <Input
            placeholder="Nome do Paciente..."
            className='w-[400px]'
            prefix={<HiOutlineSearch className='text-xl' />}
            suffix={<Spinner isSpining={false} />}
        />
    )
}

export default Search;