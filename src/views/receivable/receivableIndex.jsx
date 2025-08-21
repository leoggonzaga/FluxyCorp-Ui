import { useState } from "react";
import { Button, Dialog, Dropdown, MoneyInput, Tabs } from "../../components/ui";
import { HiInformationCircle, HiOutlineInformationCircle, HiOutlinePlus, HiOutlineQuestionMarkCircle, HiOutlineX, HiPlus, HiPlusCircle } from "react-icons/hi";
import TabList from "../../components/ui/Tabs/TabList";
import TabNav from "../../components/ui/Tabs/TabNav";
import TabContent from "../../components/ui/Tabs/TabContent";
import ReceivableTabReceivable from "./tabs/receivableTabReceivable";
import ReceivabletabIncoming from "./tabs/receivableTabIncoming";
import ReceivableUpsert from "./receivableUpsert";
import { FormNumericInput } from "../../components/shared";
import ReceivableIncomingUpsert from "./receivableIncomingUpsert";

const ReceivableIndex = () => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const [isUpsertReceivableOpen, setIsUpsertReceivableOpen] = useState(false)
    const [selectedReceivable, setSelectedReceivable] = useState(null)

    const [isUpsertIncomingOpen, setIsUpsertIncomingOpen] = useState(false);
    const [selectedIncoming, setSelectedIncoming] = useState(null)

    const openReceivableUpsert = (item = null) => {
        setIsUpsertReceivableOpen(true)
        selectedReceivable(item)
    }

    const closeReceivableUpsert = () => {
        setIsUpsertReceivableOpen(false)
        selectedReceivable(null);
    }

    const openIncomingUpsert = (item = null) => {
        debugger;
        setIsUpsertIncomingOpen(true)
        setSelectedIncoming(item)
    }

    const closeIncomingUpsert = () => {
        setIsUpsertIncomingOpen(false)
        setSelectedIncoming(null)
    }

    const loadReceivable = () => {
        return {
            data: [
                { payerId: 5, payerName: 'Débora Martins', financiallyResponsibleName: 'Débora Martins', updatedAt: '2025-08-12', updatedBy: 'Felipe Barbosa', createdAt: '2025-08-25', personFullName: 'Alessandro Jacinto', amount: 456.78, dueDate: '2025-08-16', id: 1, description: 'Recebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergado' },
            ]
        }
    }

    const loadIncoming = () => {
        return {
            data: [
                { payerId: 5, payerName: 'Débora Martins', transactionCategoryName: 'Avaliação Endo', financiallyResponsibleName: 'Débora Martins', isPartial: true, cardBrand: 'Visa', updatedAt: '2025-08-16', updatedBy: 'Felipe Domizete', installments: 4, paymentType: 'Cartão de Crédito', createdAt: '2025-08-14', bankName: 'Bradesco', personFullName: 'Alessandro Jacinto', amount: 456.78, dueDate: '2025-08-16', id: 1, date: '2025-08-18', description: 'Recebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergadoRecebimento parcial, pagamento total postergado' },
                { payerId: 45, payerName: 'Martins Da silva', transactionCategoryName: 'Primeira Avaliação', paymentType: 'Boleto', createdAt: '2025-07-10', bankName: 'Banco do Brasil', personFullName: 'Maria Eduarda Vieira', amount: 1987.00, dueDate: '2025-09-05', id: 2, date: '2025-07-02', description: 'Paciente pagou adiantado devido ao desconto' },
                { payerId: 5087, payerName: 'Leopoldo Primeiro', transactionCategoryName: 'Cirurgia', paymentType: 'Débito', createdAt: '2025-08-09', bankName: 'Nubank', personFullName: 'Italo da Silva', amount: 100456.60, id: 3, date: '2025-09-26' },
            ]
        }
    }

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1'>
                    <h2 className='text-gray-800'>Recebíveis</h2>
                    <Dropdown
                        renderTitle={<Button
                            className='ml-2'
                            shape='circle'
                            variant='solid'
                            size='xs'
                            icon={<HiOutlinePlus />}
                        />}
                        placement="middle-start-top"

                    >
                        <Dropdown.Item eventKey="1" onClick={openReceivableUpsert}>Criar Recebível</Dropdown.Item>
                    </Dropdown>
                </div>

                <Button
                    className='ml-2'
                    shape='circle'
                    variant='solid'
                    size='xs'
                    icon={<HiOutlineQuestionMarkCircle size={25} />}
                    onClick={() => setIsInfoOpen(true)}
                />
            </div>


            <div className='my-3'>
                <Tabs defaultValue="tab1">
                    <TabList>
                        <div className='flex justify-center w-full'>
                            <TabNav value="tab1">Recebíveis</TabNav>
                            <TabNav value="tab2">Recebimentos</TabNav>
                        </div>

                    </TabList>
                    <div className="p-4">
                        <TabContent value="tab1">
                            <ReceivableTabReceivable loadReceivable={loadReceivable} openReceivableUpsert={openReceivableUpsert} openIncomingUpsert={openIncomingUpsert} />
                        </TabContent>
                        <TabContent value="tab2">
                            <ReceivabletabIncoming loadIncoming={loadIncoming} openIncomingUpsert={openIncomingUpsert} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>

            <Dialog
                isOpen={isUpsertReceivableOpen}
                onRequestClose={closeReceivableUpsert}
                onClose={closeReceivableUpsert}
            >
                <ReceivableUpsert onClose={() => closeReceivableUpsert()} load={() => loadReceivable()} data={selectedReceivable} />
            </Dialog>

            <Dialog
                isOpen={isUpsertIncomingOpen}
                onRequestClose={closeIncomingUpsert}
                onClose={closeIncomingUpsert}
            >
                <ReceivableIncomingUpsert onClose={() => closeIncomingUpsert()} load={() => loadIncoming()} data={selectedIncoming} />
            </Dialog>

            <Dialog
                isOpen={isInfoOpen}
                onRequestClose={() => setIsInfoOpen(false)}
                onClose={() => setIsInfoOpen(false)}
            >
                <div className='flex flex-col gap-4'>
                    <h2>Recebíveis</h2>

                    <div className='flex flex-col gap-2'>
                        <p>
                            Nesta tela, você poderá acompanhar todos os títulos a receber e recebidos! <br/>
                            Títulos são pendências financeiras que, neste cenário, representam débitos de terceiros para com a sua empresa. Aqui, você poderá criá-los, pagá-los e acompanhar os relatórios simplificados disponibilizados.<br/>
                            Títulos em aberto são criados aqui ou através do processo de aprovação de orçamento (dentro da ficha do cliente).
                        </p>
                        <p>
                            <span className='font-semibold'>Para mais informações, acesse:</span>
                            <iframe width="420" height="315" className="mt-2 flex justify-center w-full"
                                src="https://www.youtube.com/embed/tgbNymZ7vqY">
                            </iframe>
                        </p>
                    </div>

                    <Button icon={<HiOutlineX size={15}/>} onClick={() => setIsInfoOpen(false)}>Fechar</Button>
                </div>
            </Dialog>
        </div>
    )
}

export default ReceivableIndex;