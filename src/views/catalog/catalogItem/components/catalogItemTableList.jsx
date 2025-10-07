import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { Button, MoneyValue, Pagination } from "../../../../components/ui";
import { useEffect, useState } from "react";

const CatalogItemTableList = ({ data, load, onEdit, onDelete }) => {
    const [paging, setPaging] = useState({
        pageNumber: 1,
        pageSize: 10,
        total: 0
    })

    useEffect(() => {

    }, [])

    return (
        <>
            <ul>
                {
                    !data?.length ?
                        <span className="font-bold text-sm flex justify-center mt-3">Nenhum item cadastrado.</span>

                        :

                        <>
                            {
                                data?.map(item => (
                                    <li key={item.id} className="first:rounded-t-lg last:rounded-b-lg odd:bg-gray-50 even:bg-gray-100 p-4 flex justify-between">
                                        <div className="flex items-center gap-3 font-semibold">
                                            <span className="text-lg">{item.name}</span>
                                            {' - '}
                                            <MoneyValue className='text-base text-emerald-600' value={item.price} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button icon={<HiOutlinePencil />} onClick={() => onEdit(item)} className="text-sky-700" size="xs" />
                                            <Button icon={<HiOutlineTrash />} onClick={() => onDelete(item.id)} className="text-red-700" size='xs' />
                                        </div>
                                    </li>
                                ))
                            }

                            <div className="flex justify-center mt-4">
                                <Pagination
                                    total={paging.total}
                                    currentPage={paging.pageNumber}
                                    pageSize={paging.pageSize}
                                />
                            </div>
                        </>
                }
            </ul>
        </>
    )
}

export default CatalogItemTableList;