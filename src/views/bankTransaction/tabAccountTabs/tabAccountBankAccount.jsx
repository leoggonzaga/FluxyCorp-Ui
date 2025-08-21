import { useEffect, useState } from "react";

import { HiExternalLink, HiOutlineCalendar, HiOutlineChevronRight, HiOutlineChevronUp, HiOutlineSearch, HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { Card, DateValue, Input, MoneyValue, Tooltip } from "../../../components/ui";
import DatePickerRange from "../../../components/ui/DatePicker/DatePickerRange";
import { FaRobot } from "react-icons/fa";

const TabAccountBankAccount = ({ bankAccount }) => {
    const [expandedTransactionId, setExpandedTransactionId] = useState(null);

    const toggleExpandTransaction = (id) => {
        setExpandedTransactionId(prev => prev == id ? null : id)
    }

    return (
        <div>
            <div className="flex justify-end gap-2">
                <Input
                    className="w-[220px]"
                    placeholder="Pesquisar por..."
                    prefix={<HiOutlineSearch />}
                />

                <DatePickerRange
                    value={[new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]}
                    className="w-[260px]"
                    inputPrefix={<HiOutlineCalendar />}
                />
            </div>

            <div className='flex justify-center gap-2 mt-5'>
                <Card className='bg-emerald-100 border-2 border-emerald-400'>
                    <span className='flex justify-center'>Entradas</span>
                    <MoneyValue value={1345.78} />
                </Card>

                <Card className='bg-red-100 border-2 border-red-400'>
                    <span className='flex justify-center'>Saídas</span>
                    <MoneyValue value={50005.78} />
                </Card>
            </div>



            <div className='flex flex-col gap-2 mt-4'>
                {
                    bankAccount?.transactions?.map(transaction => {
                        const isOpen = expandedTransactionId == transaction.id;

                        return (
                            <div className='flex flex-col'>
                                <Card key={transaction.id}>
                                    <div className='flex items-center w-full justify-between'>
                                        <div className='flex items-center gap-2'>
                                            {
                                                isOpen
                                                    ?
                                                    <HiOutlineChevronUp
                                                        onClick={() => toggleExpandTransaction(transaction.id)}
                                                        className='cursor-pointer hover:text-gray-700 transition-transform duration-150 active:scale-95'
                                                        size={16}
                                                    />
                                                    :
                                                    <HiOutlineChevronRight
                                                        onClick={() => toggleExpandTransaction(transaction.id)}
                                                        className='cursor-pointer hover:text-gray-700 transition-transform duration-150 active:scale-95'
                                                        size={16}
                                                    />
                                            }

                                            <DateValue className='font-semibold text-xs ml-3' value={transaction.date} />

                                            <div className="ml-4">
                                                <span className='text-gray-600 flex items-center gap-1 hover:underline cursor-pointer'>
                                                    <HiExternalLink />
                                                    <b>{transaction.patientFullName}</b>
                                                </span>

                                                <span className='flex gap-1'>
                                                    <span>{transaction.paymentTypeName}</span>
                                                    {
                                                        transaction.installments &&
                                                        <>- {transaction.installments}x</>
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            {
                                                transaction.auto &&
                                                <Tooltip title='Coletado Automaticamente'>
                                                    <span className='border-1 rounded-lg p-1'><FaRobot size={20} /></span>
                                                </Tooltip>
                                            }

                                            <span className={`flex gap-1 items-center border-1 p-2 rounded-lg ${transaction.status == 1 ? 'border-emerald-400 bg-emerald-600/10 text-emerald-600' : 'border-red-400 bg-red-600/10 text-red-600'}`}>
                                                {transaction.status == 1 ? <HiTrendingUp size={20} /> : <HiTrendingDown size={20} />}
                                                <MoneyValue className='font-semibold' value={transaction.amount} />
                                            </span>
                                        </div>
                                    </div>
                                </Card>

                                <div
                                    className={`flex justify-center overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out
                                        ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'}`}
                                    aria-hidden={!isOpen}
                                >
                                    <div className="border-b-1 border-l-1 border-r-1 w-[99%] rounded-bl-lg rounded-br-lg bg-gray-50 px-5 py-2 flex flex-col gap-1 text-xs">
                                        <span>Título Id: <b>1234</b></span>
                                        <span>Recebivel Id: <b>1234</b></span>
                                        <span className="flex items-center gap-1">Fechamento de Caixa: <DateValue className='font-bold' value={'2025-07-05T00:00:00'} timeOrientation="horizontal" /></span>
                                        <span className="mt-2">Informação Coletada Automaticamente</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>

    )
}

export default TabAccountBankAccount;
