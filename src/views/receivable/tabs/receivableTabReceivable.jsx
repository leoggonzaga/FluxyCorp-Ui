import { useEffect, useState } from "react";
import { Button, Card, DateValue, Dropdown, MoneyValue, Tag, Tooltip } from "../../../components/ui";
import { HiArrowNarrowRight, HiArrowRight, HiCash, HiClipboardList, HiDotsHorizontal, HiExternalLink, HiLibrary, HiOutlineChevronRight, HiOutlinePencil, HiPencil, HiTrash } from "react-icons/hi";

const ReceivableTabReceivable = ({ loadReceivable, openReceivableUpsert, openIncomingUpsert }) => {

    const [receivable, setReceivable] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false)
    const [itemSelected, setItemSelected] = useState(null)

    const toggleExpand = (item = null) => {
        setIsExpanded(prev => !prev)
        setItemSelected(prev => prev != null ? null : item)
    }

    const load = () => {
        const result = loadReceivable();

        if (result?.data) {
            setReceivable(result.data)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div className='flex flex-col gap-2'>
            {receivable?.map((item, index) => {
                return (
                    <div className=''>
                        <Card className={`group ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                            <div className='flex items-center justify-between w-full'>
                                <div className='w-5/6 flex items-center'>
                                    <div className='w-2/3 flex items-center '>
                                        <div className='w-1/4 flex items-center gap-3'>
                                            <HiOutlineChevronRight size={16} className='hover:text-gray-600 cursor-pointer' onClick={() => toggleExpand(item)} />

                                            <div className='flex flex-col gap-1'>
                                                <Tooltip title='Data de Recebimento'>
                                                    <DateValue className='font-bold text-base' value={item.date} />
                                                </Tooltip>


                                            </div>
                                        </div>
                                        <span className=' font-semibold w-3/4 justify-start  gap-1  flex flex-col'>
                                            <span className='flex items-center gap-1 text-nowrap text-gray-800'>
                                                <span className='hover:underline flex items-center gap-1 cursor-pointer'>
                                                    <HiExternalLink className='text-gray-400' />
                                                    {item.personFullName}
                                                </span>

                                                {
                                                    item.financiallyResponsibleName &&
                                                    <Tooltip title='Nome do Responsável'>
                                                        <span>({item.financiallyResponsibleName})</span>
                                                    </Tooltip>

                                                }

                                                {' - '}

                                                <MoneyValue className='text-emerald-600  font-semibold' value={item.amount} />

                                                {
                                                    !!item.isPartial &&
                                                    <Tag className='bg-emerald-600 text-gray-100'>Parcial</Tag>
                                                }
                                            </span>
                                            <span className='text-xs'>{item.description}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className='flex items-center w-1/6 justify-end gap-1'>
                                    <div className='flex justify-between items-center w-full'>
                                        <div className="flex items-center gap-2">
                                            {/* <MoneyValue className='text-emerald-600 font-semibold' value={item.amount} /> */}
                                        </div>

                                        <div className='opacity-0 group-hover:opacity-100'>
                                            <Dropdown
                                                renderTitle={<Button
                                                    className='ml-2'
                                                    shape='circle'
                                                    variant='solid'
                                                    size='xs'
                                                    color='gray-400'
                                                    icon={<HiDotsHorizontal />}
                                                />}
                                                placement="middle-end-top"
                                            >
                                                <Dropdown.Item eventKey="1" onClick={() => openIncomingUpsert(item)}><HiCash /> Pagar</Dropdown.Item>
                                                <Dropdown.Item eventKey="2" onClick={() => openReceivableUpsert(item)}><HiPencil /> Editar</Dropdown.Item>
                                                <Dropdown.Item eventKey="3" className="text-red-600"><HiTrash /> Excluir</Dropdown.Item>
                                            </Dropdown>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </Card>
                        <div className={`flex justify-center  ${isExpanded && itemSelected?.id == item?.id ? '' : 'hidden'} px-1 text-xs`}>
                            <div className='w-full bg-gray-100/50 border-l-1 border-r-1 border-b-1 rounded-b-lg px-4 py-1 flex flex-col gap-1'>
                                <span className='flex items-center gap-1'>ID: <b>{itemSelected?.id}</b></span>
                                <span className='flex items-center gap-1'>ID de Controle: <b>345</b></span>
                                <span className='flex items-center gap-1'>Data de Criação: <b><DateValue value={item.createdAt} /></b></span>
                                <span className='flex items-center gap-1'>Atualizado Em: <b><DateValue value={item.updatedAt} /></b></span>
                                <span className='flex items-center gap-1'>Atualizado Por: <b>{item.updatedBy}</b></span>
                                {!!item.dueDate &&
                                    <span className='flex items-center gap-1'>Data de Vencimento: <b><DateValue value={item.dueDate} /></b></span>
                                }

                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ReceivableTabReceivable;