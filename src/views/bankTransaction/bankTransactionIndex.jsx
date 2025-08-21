import { Avatar, Tabs } from "../../components/ui";
import TabContent from "../../components/ui/Tabs/TabContent";
import TabList from "../../components/ui/Tabs/TabList";
import TabNav from "../../components/ui/Tabs/TabNav";
import BankTransactionTabAccount from "./bankTransactionTabAccount";

const BankTransactionIndex = () => {

    const bankAccounts = [
        { id: 1, name: 'Santander' },
        { id: 2, name: 'Bradesco' }
    ]

    return (
        <div>
            <h2 className='text-gray-800'>Transações Bancárias</h2>

            {
                !bankAccounts.length
                    ?
                    <div className='flex justify-center mt-4'>
                        Nenhuma conta bancária cadastrada!
                    </div>
                    :
                    <>
                        <Tabs defaultValue={bankAccounts[0].id}>
                            <TabList>
                                <div className='flex justify-center w-full'>
                                    {
                                        bankAccounts?.map(item => {
                                            return (
                                                <TabNav value={item.id} className="flex items-center gap-2">
                                                    <img width={20} src={`/img/bankLogos/${item.name}.png`} />
                                                    {item.name}
                                                </TabNav>
                                            )
                                        })
                                    }
                                </div>
                            </TabList>
                            <div className="p-4">
                                {
                                    bankAccounts?.map(item => {
                                        return (
                                            <TabContent value={item.id}>
                                                <BankTransactionTabAccount accountId={item.id} />
                                            </TabContent>
                                        )
                                    })
                                }
                            </div>
                        </Tabs>
                    </>
            }
        </div>
    )
}

export default BankTransactionIndex;