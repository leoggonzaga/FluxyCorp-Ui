import { useEffect, useState } from 'react'
import { Button, Dialog, Input, Notification, Select, toast } from '@/components/ui'
import { HiOutlineClock, HiOutlineUser, HiOutlineX } from 'react-icons/hi'
import {
    createStockMovement,
    fulfillStockRequest,
    getPendingRequestsByProduct,
} from '@/api/inventory/inventoryService'

const MOVEMENT_TYPES = [
    { value: 'Entrada', label: 'Entrada — recebimento de mercadoria' },
    { value: 'Saída', label: 'Saída — consumo em procedimento' },
    { value: 'Ajuste', label: 'Ajuste — correção de inventário' },
    { value: 'Perda', label: 'Perda — vencimento ou avaria' },
]

const TYPE_COLORS = {
    Entrada: 'text-emerald-600',
    Saída: 'text-red-600',
    Ajuste: 'text-indigo-600',
    Perda: 'text-amber-600',
}

const SAIDA_TYPE = MOVEMENT_TYPES.find(t => t.value === 'Saída')

const StockMovementDialog = ({ isOpen, product, onClose, onSuccess }) => {
    const [type, setType] = useState(null)
    const [quantity, setQuantity] = useState('')
    const [reason, setReason] = useState('')
    const [unitCost, setUnitCost] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [pendingRequests, setPendingRequests] = useState([])
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [loadingRequests, setLoadingRequests] = useState(false)

    useEffect(() => {
        if (isOpen && product?.publicId) {
            setLoadingRequests(true)
            getPendingRequestsByProduct(product.publicId)
                .then(res => setPendingRequests(Array.isArray(res) ? res : []))
                .finally(() => setLoadingRequests(false))
        }
        if (!isOpen) {
            setPendingRequests([])
            setSelectedRequest(null)
        }
    }, [isOpen, product?.publicId])

    const selectRequest = (req) => {
        if (selectedRequest?.publicId === req.publicId) {
            setSelectedRequest(null)
            setType(null)
            setQuantity('')
        } else {
            setSelectedRequest(req)
            setType(SAIDA_TYPE)
            setQuantity(String(req.quantity))
        }
    }

    const clearSelectedRequest = () => {
        setSelectedRequest(null)
        setType(null)
        setQuantity('')
    }

    const reset = () => {
        setType(null); setQuantity(''); setReason(''); setUnitCost('')
        setSelectedRequest(null); setPendingRequests([])
    }

    const handleClose = () => { reset(); onClose() }

    const handleSubmit = async () => {
        if (!type || !quantity || Number(quantity) <= 0) {
            toast.push(<Notification type="danger" title="Campos obrigatórios">Selecione o tipo e informe a quantidade.</Notification>)
            return
        }
        setSubmitting(true)
        let result
        if (selectedRequest) {
            result = await fulfillStockRequest(selectedRequest.publicId, {
                unitCost: unitCost ? parseFloat(unitCost) : null,
                reason: reason || null,
            })
        } else {
            result = await createStockMovement({
                productPublicId: product.publicId,
                type: type.value,
                quantity: parseInt(quantity),
                unitCost: unitCost ? parseFloat(unitCost) : null,
                reason: reason || null,
            })
        }
        setSubmitting(false)
        if (result) {
            toast.push(
                <Notification type="success" title="Movimentação registrada">
                    {selectedRequest
                        ? `Retirada de ${selectedRequest.quantity} ${product.unit} registrada para ${selectedRequest.requestedByEmployeeName}.`
                        : `Estoque atualizado: ${result.newStock} ${product.unit}`}
                </Notification>
            )
            handleClose()
            onSuccess?.()
        }
    }

    const preview = product && type && quantity
        ? type.value === 'Entrada' ? product.currentStock + parseInt(quantity || 0)
        : type.value === 'Ajuste' ? parseInt(quantity || 0)
        : Math.max(0, product.currentStock - parseInt(quantity || 0))
        : null

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        })
    }

    return (
        <Dialog isOpen={isOpen} onClose={handleClose} onRequestClose={handleClose} width={480}>
            <div className="p-1 space-y-4">
                <div>
                    <h5 className="font-bold text-gray-800 text-base">Movimentação de Estoque</h5>
                    {product && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            <span className="font-medium text-gray-700">{product.name}</span>
                            {' '}· SKU {product.sku}
                            {' '}· Atual:{' '}
                            <span className="font-semibold text-indigo-600">{product.currentStock} {product.unit}</span>
                        </p>
                    )}
                </div>

                {/* Pending Requests */}
                {!loadingRequests && pendingRequests.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide flex items-center gap-1.5">
                            <HiOutlineClock className="w-3.5 h-3.5" />
                            Solicitações aguardando retirada ({pendingRequests.length})
                        </p>

                        <div className="space-y-1.5">
                            {pendingRequests.map(req => (
                                <button
                                    key={req.publicId}
                                    type="button"
                                    onClick={() => selectRequest(req)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all duration-150 ${
                                        selectedRequest?.publicId === req.publicId
                                            ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-200'
                                            : 'bg-gray-50 border-gray-200 hover:border-orange-200 hover:bg-orange-50/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <HiOutlineUser className="w-3.5 h-3.5 text-orange-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800">
                                                {req.requestedByEmployeeName}
                                            </span>
                                        </div>
                                        <span className={`text-sm font-bold ${selectedRequest?.publicId === req.publicId ? 'text-orange-600' : 'text-gray-700'}`}>
                                            {req.quantity} {product?.unit}
                                        </span>
                                    </div>
                                    {req.reason && (
                                        <p className="text-xs text-gray-500 mt-1 ml-8 truncate">{req.reason}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-0.5 ml-8">{formatDate(req.createdAt)}</p>
                                </button>
                            ))}
                        </div>

                        {selectedRequest && (
                            <div className="flex items-center justify-between px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                                <p className="text-xs text-orange-700 font-medium">
                                    Movimentação para <strong>{selectedRequest.requestedByEmployeeName}</strong>
                                </p>
                                <button
                                    type="button"
                                    onClick={clearSelectedRequest}
                                    className="text-orange-400 hover:text-orange-600 transition-colors ml-2"
                                    title="Desselecionar"
                                >
                                    <HiOutlineX className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        <div className="pt-1 border-t border-gray-100">
                            <p className="text-xs text-gray-400">Ou registre uma movimentação avulsa:</p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipo de movimentação</label>
                    <Select
                        options={MOVEMENT_TYPES}
                        value={type}
                        onChange={v => { setType(v); if (selectedRequest) clearSelectedRequest() }}
                        placeholder="Selecione o tipo"
                        isDisabled={!!selectedRequest}
                    />
                    {selectedRequest && (
                        <p className="text-xs text-gray-400 mt-1">Fixado como Saída para atender a solicitação</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                            {type?.value === 'Ajuste' ? 'Novo saldo' : 'Quantidade'}
                        </label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="0"
                            value={quantity}
                            onChange={e => {
                                if (selectedRequest) clearSelectedRequest()
                                setQuantity(e.target.value)
                            }}
                            readOnly={!!selectedRequest}
                        />
                    </div>
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
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Motivo / Observação</label>
                    <Input
                        placeholder="Ex: Recebimento NF 1234, Utilizado no procedimento…"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                    />
                </div>

                {preview !== null && type && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-sm text-gray-500">Saldo após movimentação</span>
                        <span className={`text-lg font-bold ${TYPE_COLORS[type.value]}`}>
                            {preview} {product?.unit}
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="solid" loading={submitting} onClick={handleSubmit}>
                        Registrar
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default StockMovementDialog
