import { useState } from 'react'
import { Button, Dialog, Input, Notification, toast } from '@/components/ui'
import { HiOutlineUser } from 'react-icons/hi'
import { useAppSelector } from '@/store'
import { createStockRequest } from '@/api/inventory/inventoryService'

const StockRequestDialog = ({ isOpen, product, onClose, onSuccess }) => {
    const { userName, email, employeePublicId } = useAppSelector(state => state.auth.user)
    const displayName = userName || email || '—'
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const reset = () => { setQuantity(''); setReason('') }
    const handleClose = () => { reset(); onClose() }

    const handleSubmit = async () => {
        if (!quantity || Number(quantity) <= 0) {
            toast.push(<Notification type="danger" title="Campo obrigatório">Informe a quantidade desejada.</Notification>)
            return
        }
        setSubmitting(true)
        const result = await createStockRequest({
            productPublicId: product.publicId,
            requestedByEmployeePublicId: employeePublicId,
            requestedByEmployeeName: userName,
            quantity: parseInt(quantity),
            reason: reason || null,
        })
        setSubmitting(false)
        if (result) {
            toast.push(<Notification type="success" title="Solicitação registrada">Aguardando retirada no estoque.</Notification>)
            handleClose()
            onSuccess?.()
        }
    }

    const initial = displayName?.charAt(0)?.toUpperCase() || '?'

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose} width={440}>
            <div className="p-1 space-y-4">
                <div>
                    <h5 className="font-bold text-gray-800 text-base">Solicitar Item do Estoque</h5>
                    {product && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700">{product.name}</span>
                            {' '}· SKU {product.sku}
                            {' '}· Disponível:{' '}
                            <span className="font-semibold text-indigo-600">{product.currentStock} {product.unit}</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                        {initial !== '?' ? (
                            <span className="text-orange-700 text-sm font-bold">{initial}</span>
                        ) : (
                            <HiOutlineUser className="w-4 h-4 text-orange-600" />
                        )}
                    </div>
                    <div>
                        <p className="text-xs text-orange-500 font-medium">Solicitante</p>
                        <p className="text-sm font-semibold text-orange-700">{displayName}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        Quantidade <span className="text-red-400">*</span>
                    </label>
                    <Input
                        type="number"
                        min="1"
                        placeholder="0"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        suffix={product?.unit ? <span className="text-gray-400 text-xs pr-1">{product.unit}</span> : undefined}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Motivo / Observação</label>
                    <Input
                        placeholder="Ex: Para o procedimento de amanhã…"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                        Solicitar
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default StockRequestDialog
