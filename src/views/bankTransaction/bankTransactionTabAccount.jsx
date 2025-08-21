import { useEffect, useState } from "react";
import { Badge, Card, Dialog, Input, MoneyValue, Pagination, Tabs } from "../../components/ui";
import DatePickerRange from "../../components/ui/DatePicker/DatePickerRange";
import { HiExternalLink, HiOutlineSearch, HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import TabNav from "../../components/ui/Tabs/TabNav";
import TabContent from "../../components/ui/Tabs/TabContent";
import TabList from "../../components/ui/Tabs/TabList";
import TabAccountCreditCard from "./tabAccountTabs/tabAccountCreditCard";
import TabAccountBankAccount from "./tabAccountTabs/tabAccountBankAccount";

const BankTransactionTabAccount = ({ accountId }) => {
    const [accountInfo, setTransactions] = useState({
        id: 1,
        name: 'Santander',
        amount: 5600.00,
        transactions: [
            {
                id: 1,
                status: 1, //ingoing
                amount: 56.90,
                patientFullName: 'Débora Martins',
                paymentTypeName: 'Cartão de Crédito',
                installments: 5,
                date: '2025-08-20 13:00:00',
                auto: true
            },
            {
                id: 2,
                status: 1, //ingoing
                amount: 56.90,
                patientFullName: 'Felipe Barbosa',
                paymentTypeName: 'Pix',
                date: '2025-08-20 13:00:00'
            },
            {
                id: 3,
                status: 1, //ingoing
                amount: 56.90,
                patientFullName: 'Maria Eduarda Vieira Gomes',
                paymentTypeName: 'Boleto',
                date: '2025-08-20 13:00:00',
                auto: true
            },
            {
                id: 4,
                status: 2, //ingoing
                amount: 99.90,
                patientFullName: 'Débora Martins',
                date: '2025-08-20 13:00:00',
                auto: true
            },
            {
                id: 5,
                status: 2, //ingoing
                amount: 1456.90,
                patientFullName: 'Fernando Henrique Cardoso',
                date: '2025-08-20 13:00:00'
            },
            {
                id: 6,
                status: 1, //ingoing
                amount: 172.99,
                patientFullName: 'Stefany Pereira',
                date: '2025-08-20 13:00:00'
            }
        ],
        creditCards: [
            {
                id: 1,
                name: 'Cartão Black PJ',
                amount: 4500.98
            },
            {
                id: 2,
                name: 'Cartão Crédito Milhas',
                amount: 3456.67
            }
        ]
    })


    const loadBankAccountInfo = () => {

    }

    useEffect(() => {
        loadBankAccountInfo()
    }, [])

    return (
        <div>
            <div className='mt-4 flex flex-col gap-2'>
                <Tabs variant='pill' defaultValue='bankAccount'>
                    <div className="flex justify-center">
                        <TabList>
                            <div className='flex justify-center w-full'>
                                <TabNav value='bankAccount' className="flex items-center gap-2">
                                    Conta Bancária
                                </TabNav>
                                {
                                    accountInfo.creditCards?.map(card => {
                                        return (
                                            <TabNav value={card.id}>
                                                <TabAccountCreditCard creditCard={card} />
                                            </TabNav>
                                        )
                                    })
                                }
                                <TabNav value='pluggy' className="flex items-start gap-1">
                                    <span>Extrato Automatizado</span>
                                    <Badge />
                                </TabNav>
                            </div>
                        </TabList>
                    </div>

                    <div className="p-4">
                        <TabContent value='bankAccount'>
                            <TabAccountBankAccount bankAccount={accountInfo} />
                        </TabContent>

                        {
                            accountInfo.creditCards?.map(item => {
                                return (
                                    <TabContent value={item.id}>
                                        {item.name}
                                    </TabContent>
                                )
                            })
                        }
                    </div>
                </Tabs>
            </div>

            <div className='flex justify-center mt-4'>
                <Pagination
                    total={10}
                    pageSize={30}
                    currentPage={1}
                />
            </div>
        </div>
    )
}

export default BankTransactionTabAccount;