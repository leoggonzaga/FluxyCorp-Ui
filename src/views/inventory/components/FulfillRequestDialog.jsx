import { useState } from 'react'
import { Button, Dialog, Input, Notification, toast } from '@/components/ui'
import { HiOutlineUser, HiOutlineCube } from 'react-icons/hi'
import { fulfillStockRequest } from '@/api/inventory/inventoryService'

const FulfillRequestDialog = ({ isOpen, request, onClose, onSuccess }) => {
    const [unitCost, setUnitCost] = useState('')
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const reset = () => { setUnitCost(''); setReason('') }
    const handleClose = () => { reset(); onClose() }

    const handleSubmit = async () => {
        setSubmitting(true)
        const result = await fulfillStockRequest(request.publicId, {
            unitCost: unitCost ? parseFloat(unitCost) : null,
            reason: reason || null,
        })
        setSubmitting(false)
        if (result) {
            toast.push(
                <Notification type="success" title="Retirada registrada">
                    {request.quantity} {request.productUnit} retirado para {request.requestedByEmployeeName}.
                </Notification>
            )
            handleClose()
            onSuccess?.()
        }
    }

    const initial = request?.requestedByEmployeeName?.charAt(0)?.toUpperCase() || '?'

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose} width={440}>
            <div className="p-1 space-y-4">
                <div>
                    <h5 className="font-bold text-gray-800 text-base">Confirmar Retirada</h5>
                    <p className="text-sm text-gray-500 mt-0.5">Registrar saída do estoque para o solicitante</p>
                </div>

                {/* Produto */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <HiOutlineCube className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-medium">Produto</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{request?.productName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-indigo-600">{request?.quantity}</p>
                        <p className="text-xs text-gray-400">{request?.productUnit}</p>
                    </div>
                </div>

                {/* Solicitante */}
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-700 text-sm font-bold">{initial}</span>
                    </div>
                    <div>
                        <p className="text-xs text-orange-500 font-medium">Esta retirada será registrada para</p>
                        <p className="text-sm font-bold text-orange-700">{request?.requestedByEmployeeName}</p>
                    </div>
                </div>

                {request?.reason && (
                    <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-400 font-medium mb-0.5">Motivo da solicitação</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Custo unitário (R$)</label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={unitCost}
                            onChange={e => setUnitCost(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Observação</label>
                        <Input
                            placeholder="Opcional…"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                        Confirmar Retirada
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default FulfillRequestDialog
