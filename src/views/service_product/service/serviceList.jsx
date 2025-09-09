import { HiOutlinePencil, HiOutlinePlus, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import { Button, Input, MoneyValue } from "../../../components/ui";

const ServiceList = ({ data, onOpenUpsert }) => {
    return (
        <div>
            {/* <div className="flex items-center justify-between">
                <Button icon={<HiOutlinePlus size={12} />} variant="solid" size="sm">Cadastar Serviço</Button>
            </div> */}

            <div className="">
                {
                    data?.length == 0 &&
                    <span className="bg-gray-50 rounded-lg py-2 flex w-full justify-center font-semibold text-gray-700">Nenhum Serviço Cadastrado</span>
                }

                {
                    data?.length > 0 &&
                    <ul>
                        {
                            data?.map(item => {
                                return (
                                    <li key={item.id} className="first:rounded-t-lg last:rounded-b-lg odd:bg-gray-50 even:bg-gray-100 p-4 flex justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800 text-base font-semibold">{item.name}</span>
                                                {' - '}
                                                <MoneyValue className='text-base font-bold text-emerald-600' value={item.price} />
                                            </div>

                                            <span className="text-gray-600 font-semibold">{item.category?.name}</span>

                                            {
                                                item.catalogList?.length > 0 &&
                                                <div className="flex items-center gap-1 text-sm mt-2">
                                                    <span className=" ">Catálogos:</span>
                                                    {item.catalogList?.map((catalog, index) => {
                                                        return (
                                                            <div key={catalog.id}>
                                                                <span className="font-semibold">{catalog.name}</span>
                                                                {index + 1 < item.catalogList?.length ? ' / ' : ''}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            }
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button icon={<HiOutlinePencil />} onClick={() => onOpenUpsert('service', item)} className="text-sky-700" size="xs" />
                                            <Button icon={<HiOutlineTrash />} className="text-red-700" size='xs' />
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
            </div>
        </div>
    )
}

export default ServiceList;