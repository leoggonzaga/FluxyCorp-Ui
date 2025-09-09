import { useEffect, useState } from "react";
import { Button, Card, DateValue, Dropdown, MoneyValue, Tag, Tooltip } from "../../../components/ui";
import { HiArrowNarrowRight, HiArrowRight, HiCash, HiClipboardList, HiDotsHorizontal, HiExternalLink, HiLibrary, HiOutlineChevronRight, HiOutlinePencil, HiOutlineTrash, HiPencil, HiTrash } from "react-icons/hi";

const ReceivabletabIncoming = ({ loadIncoming, openIncomingUpsert }) => {

    const [incoming, setIncoming] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false)
    const [itemSelected, setItemSelected] = useState(null)

    const toggleExpand = (item = null) => {
        setIsExpanded(prev => !prev)
        setItemSelected(prev => prev != null ? null : item)
    }

    const load = () => {
        const result = loadIncoming();

        if (result?.data) {
            setIncoming(result.data)
        }
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div className='flex flex-col gap-2'>
            {incoming?.map((item, index) => {
                return (
                    <div className=''>
                        <Card className={`group ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                            <div className='flex items-center justify-between w-full'>
                                <div className='w-5/6 flex items-center'>
                                    <div className='w-5/8 flex items-center '>
                                        <div className='w-1/4 flex items-center gap-3'>
                                            <HiOutlineChevronRight size={16} className='hover:text-gray-600 cursor-pointer' onClick={() => toggleExpand(item)} />

                                            <div className='flex flex-col gap-1'>
                                                <Tooltip title='Data de Recebimento'>
                                                    <DateValue className='font-bold text-lg' value={item.date} />
                                                </Tooltip>

                                                <MoneyValue className='text-emerald-600 flex justify-center text-base font-semibold' value={item.amount} />
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

                                                {
                                                    !!item.isPartial &&
                                                    <Tag className='bg-emerald-600 text-gray-100'>Parcial</Tag>
                                                }
                                            </span>
                                            <span className='text-xs'>{item.description}</span>
                                        </span>
                                    </div>
                                    <div className='w-3/8 flex flex-col items-center'>
                                        <div className='flex items-center gap-1'>
                                            <HiCash />

                                            <span>{item.paymentType}</span>
                                            {
                                                item.installments > 0 &&
                                                <span className='flex items-center'>{' - '} {item.installments}x</span>
                                            }
                                            {
                                                !!item.cardBrand &&
                                                <span>({item.cardBrand})</span>
                                            }
                                        </div>

                                        <span className='w-full justify-center flex items-center font-semibold gap-1'><HiLibrary /> {item.bankName}</span>

                                        {
                                            item.transactionCategoryName &&
                                            <Tooltip title='Tipo de Conta'>
                                                <span className="flex items-center"><HiClipboardList /> {item.transactionCategoryName}</span>
                                            </Tooltip>

                                        }

                                    </div>
                                </div>

                                <div className='flex items-center justify-end gap-1'>
                                    <div className='flex justify-end items-center w-full gap-1'>
                                        <Button icon={<HiOutlinePencil className='text-sky-700' />} size="xs" />
                                        <Button icon={<HiOutlineTrash className='text-red-700' />} size="xs" />
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
                                <span className='flex items-center gap-1'>Recebido Por: <b>Fernando Meireles</b></span>
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

export default ReceivabletabIncoming;