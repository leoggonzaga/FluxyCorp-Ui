import { HiOutlineSearch } from "react-icons/hi";
import { Card, Input, Tag } from "../../components/ui";
import { useNavigate } from "react-router-dom";

const ServiceTableIndex = () => {

    const navigate = useNavigate();

    const tableServices = [
        {
            id: 1,
            name: 'Tabela 2024',
            items: 365,
            description: 'Tabela Antiga'
        },
        {
            id: 2,
            name: 'Tabela 2025',
            items: 365,
            description: 'Tabela Vigente'
        }
    ]

    return (
        <div>
            <h2 className='text-gray-800'>Tabelas de Serviços</h2>

            <div className="flex justify-end">
                <Input placeholder="Pesquisar por Nome da Tabela" className="w-[280px]" prefix={<HiOutlineSearch />} />
            </div>

            <div className="flex flex-col gap-2 mt-4">
                {
                    tableServices?.map((item) => {
                        return (
                            <Card className="hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/service-tables/${item.id}`)}>
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-base font-semibold text-gray-700 flex items-center gap-2">
                                            {item.name}
                                            <Tag className="bg-emerald-600 text-gray-100">Ativo</Tag>
                                        </span>
                                        <span>{item.description}</span>
                                    </div>
                                    <div>
                                        <span>Itens: <b>{item.items}</b></span>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default ServiceTableIndex;