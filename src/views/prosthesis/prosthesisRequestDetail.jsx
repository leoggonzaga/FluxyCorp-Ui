import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    HiOutlineArrowLeft,
    HiOutlinePencil,
    HiOutlineClipboardList,
    HiOutlineTruck,
    HiOutlineCurrencyDollar,
    HiOutlineCheckCircle,
    HiOutlineCalendar,
} from 'react-icons/hi'
import { Button, Card, Dialog, Notification, toast, Select } from '@/components/ui'
import { Loading, ConfirmDialog } from '@/components/shared'
import {
    getProsthesisRequestById,
    updateProsthesisStatus,
    getServiceOrdersByRequest,
    createServiceOrder,
    getLaboratories,
    deleteProsthesisRequest,
} from '@/api/prosthesis/prosthesisService'
import ProsthesisStatusBadge from './components/ProsthesisStatusBadge'
import ProsthesisRequestUpsert from './components/ProsthesisRequestUpsert'

const STATUSES = [
    'Solicitado',
    'Em produção',
    'Em prova',
    'Ajuste solicitado',
    'Finalizado no laboratório',
    'Recebido na clínica',
    'Instalado no paciente',
    'Entregue',
    'Garantia / manutenção',
]

const ACTIVE_DOT_COLORS = {
    'Solicitado': 'bg-blue-500',
    'Em produção': 'bg-amber-500',
    'Em prova': 'bg-purple-500',
    'Ajuste solicitado': 'bg-orange-500',
    'Finalizado no laboratório': 'bg-teal-500',
    'Recebido na clínica': 'bg-indigo-500',
    'Instalado no paciente': 'bg-green-500',
    'Entregue': 'bg-emerald-500',
    'Garantia / manutenção': 'bg-red-500',
}

const TimelineDot = ({ status, isLast, active }) => {
    const dotColor = active ? (ACTIVE_DOT_COLORS[status] || 'bg-indigo-500') : 'bg-gray-200'

    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-3 h-3 rounded-full ${dotColor} ring-2 ${
                    active ? 'ring-white shadow-md' : 'ring-gray-100'
                } z-10`}
            />
            {!isLast && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
        </div>
    )
}

const ProsthesisRequestDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [request, setRequest] = useState(null)
    const [serviceOrders, setServiceOrders] = useState([])
    const [laboratories, setLaboratories] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [isOrderOpen, setIsOrderOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState(null)
    const [statusNotes, setStatusNotes] = useState('')
    const [selectedLab, setSelectedLab] = useState(null)
    const [orderNotes, setOrderNotes] = useState('')
    const [expectedDate, setExpectedDate] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const request = await getProsthesisRequestById(id)
            setRequest(request)

            const orders = await getServiceOrdersByRequest(id)
            setServiceOrders(orders || [])

            const labs = await getLaboratories()
            setLaboratories((labs || []).map(l => ({ value: l.publicId, label: l.name })))
        } catch (error) {
            console.error('Erro ao carregar detalhe de prótese:', error)
            toast.push(
                <Notification type="danger" title="Falha ao carregar">
                    Não foi possível carregar os dados da prótese.
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [id])

    const handleUpdateStatus = async () => {
        if (!selectedStatus) return
        const result = await updateProsthesisStatus(id, {
            status: selectedStatus.value,
            notes: statusNotes,
            installedAt:
                selectedStatus.value === 'Instalado no paciente' ? new Date().toISOString() : null,
        })
        if (result) {
            toast.push(
                <Notification type="success" title="Status atualizado">
                    Prótese movida para: {selectedStatus.value}
                </Notification>
            )
            setIsStatusOpen(false)
            setSelectedStatus(null)
            setStatusNotes('')
            load()
        }
    }

    const handleCreateOrder = async () => {
        if (!selectedLab) return
        const result = await createServiceOrder({
            prosthesisRequestPublicId: id,
            laboratoryPublicId: selectedLab.value,
            sentAt: new Date().toISOString(),
            expectedDeliveryDate: expectedDate ? new Date(expectedDate).toISOString() : null,
            notes: orderNotes,
        })
        if (result) {
            toast.push(
                <Notification type="success" title="OS criada">
                    Ordem de serviço enviada ao laboratório.
                </Notification>
            )
            setIsOrderOpen(false)
            setSelectedLab(null)
            setOrderNotes('')
            setExpectedDate('')
            load()
        }
    }

    const handleDelete = async () => {
        const result = await deleteProsthesisRequest(id)
        if (result !== null) {
            toast.push(
                <Notification type="success" title="Excluído">
                    Solicitação removida.
                </Notification>
            )
            navigate('/prosthesis')
        }
    }

    if (loading) return <Loading loading={true}><div className="h-64" /></Loading>
    if (!request)
        return (
            <div className="text-center py-16 text-gray-400">Solicitação não encontrada</div>
        )

    const margin =
        (request.patientPrice || 0) -
        (request.laboratoryPrice || 0) -
        (request.dentistCommission || 0)

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/prosthesis')}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-800">{request.patientName}</h2>
                            <ProsthesisStatusBadge status={request.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                            {request.prosthesisTypeName} · Dr(a). {request.dentistName}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="plain"
                        onClick={() => setIsOrderOpen(true)}
                        icon={<HiOutlineTruck />}
                    >
                        Enviar para Lab
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        onClick={() => setIsStatusOpen(true)}
                        icon={<HiOutlineCheckCircle />}
                    >
                        Atualizar Status
                    </Button>
                    <Button
                        size="sm"
                        variant="plain"
                        onClick={() => setIsEditOpen(true)}
                        icon={<HiOutlinePencil />}
                    >
                        Editar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: Details */}
                <div className="col-span-2 flex flex-col gap-4">
                    {/* Clinical Info */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineClipboardList className="w-5 h-5 text-indigo-500" />
                            <h5 className="font-semibold text-gray-700">Informações Clínicas</h5>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Tipo</p>
                                <p className="font-medium text-gray-700">{request.prosthesisTypeName}</p>
                            </div>
                            {request.arch && (
                                <div>
                                    <p className="text-xs text-gray-400">Arcada</p>
                                    <p className="font-medium text-gray-700">{request.arch}</p>
                                </div>
                            )}
                            {request.tooth && (
                                <div>
                                    <p className="text-xs text-gray-400">Dente(s)</p>
                                    <p className="font-medium text-gray-700">{request.tooth}</p>
                                </div>
                            )}
                            {request.material && (
                                <div>
                                    <p className="text-xs text-gray-400">Material</p>
                                    <p className="font-medium text-gray-700">{request.material}</p>
                                </div>
                            )}
                            {request.vitaColor && (
                                <div>
                                    <p className="text-xs text-gray-400">Cor Vita</p>
                                    <p className="font-medium text-gray-700">{request.vitaColor}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-400">Moldagem</p>
                                <p className="font-medium text-gray-700">
                                    {new Date(request.moldingDate).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                            {request.clinicUnit && (
                                <div>
                                    <p className="text-xs text-gray-400">Unidade</p>
                                    <p className="font-medium text-gray-700">{request.clinicUnit}</p>
                                </div>
                            )}
                            {request.warrantyMonths && (
                                <div>
                                    <p className="text-xs text-gray-400">Garantia</p>
                                    <p className="font-medium text-gray-700">{request.warrantyMonths} meses</p>
                                </div>
                            )}
                            {request.installedAt && (
                                <div>
                                    <p className="text-xs text-gray-400">Instalado em</p>
                                    <p className="font-medium text-gray-700">
                                        {new Date(request.installedAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                        {request.clinicalNotes && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-xs text-amber-600 font-medium mb-1">
                                    Observações Clínicas
                                </p>
                                <p className="text-sm text-gray-700">{request.clinicalNotes}</p>
                            </div>
                        )}
                    </Card>

                    {/* Financial */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-500" />
                            <h5 className="font-semibold text-gray-700">Financeiro</h5>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-center">
                                <p className="text-xs text-blue-500">Valor Paciente</p>
                                <p className="font-bold text-blue-700 text-lg">
                                    {request.patientPrice
                                        ? new Intl.NumberFormat('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          }).format(request.patientPrice)
                                        : '-'}
                                </p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl text-center">
                                <p className="text-xs text-amber-500">Custo Lab</p>
                                <p className="font-bold text-amber-700 text-lg">
                                    {request.laboratoryPrice
                                        ? new Intl.NumberFormat('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          }).format(request.laboratoryPrice)
                                        : '-'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl text-center">
                                <p className="text-xs text-purple-500">Comissão</p>
                                <p className="font-bold text-purple-700 text-lg">
                                    {request.dentistCommission
                                        ? new Intl.NumberFormat('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          }).format(request.dentistCommission)
                                        : '-'}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl text-center border-2 border-emerald-200">
                                <p className="text-xs text-emerald-500">Margem</p>
                                <p className="font-bold text-emerald-700 text-lg">
                                    {request.patientPrice
                                        ? new Intl.NumberFormat('pt-BR', {
                                              style: 'currency',
                                              currency: 'BRL',
                                          }).format(margin)
                                        : '-'}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Service Orders */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <HiOutlineTruck className="w-5 h-5 text-teal-500" />
                                <h5 className="font-semibold text-gray-700">Ordens de Serviço</h5>
                            </div>
                            <Button
                                size="xs"
                                variant="plain"
                                onClick={() => setIsOrderOpen(true)}
                                icon={<HiOutlineTruck />}
                            >
                                Nova OS
                            </Button>
                        </div>
                        {serviceOrders.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">
                                Nenhuma OS gerada ainda
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {serviceOrders.map(order => (
                                    <div
                                        key={order.publicId}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700">
                                                {order.orderNumber}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {order.laboratoryName} · Enviada em{' '}
                                                {new Date(order.sentAt).toLocaleDateString('pt-BR')}
                                            </p>
                                            {order.expectedDeliveryDate && (
                                                <p className="text-xs text-gray-400">
                                                    Previsão:{' '}
                                                    {new Date(
                                                        order.expectedDeliveryDate
                                                    ).toLocaleDateString('pt-BR')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                                                {order.status}
                                            </span>
                                            {order.price && (
                                                <span className="text-xs text-gray-500">
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL',
                                                    }).format(order.price)}
                                                </span>
                                            )}
                                            {order.isRework && (
                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    Retrabalho
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right: Status Timeline */}
                <div className="flex flex-col gap-4">
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <HiOutlineCalendar className="w-5 h-5 text-indigo-500" />
                            <h5 className="font-semibold text-gray-700">Histórico de Status</h5>
                        </div>
                        <div className="flex flex-col gap-0">
                            {STATUSES.map((status, idx) => {
                                const histEntry = request.statusHistory?.find(
                                    h => h.status === status
                                )
                                const isCurrent = request.status === status
                                const isDone = request.statusHistory?.some(
                                    h => h.status === status
                                )
                                const isLast = idx === STATUSES.length - 1
                                return (
                                    <div key={status} className="flex items-start gap-3">
                                        <TimelineDot
                                            status={status}
                                            isLast={isLast}
                                            active={isDone || isCurrent}
                                        />
                                        <div
                                            className={`pb-6 ${isLast ? 'pb-0' : ''} flex-1`}
                                        >
                                            <p
                                                className={`text-xs font-semibold ${
                                                    isCurrent
                                                        ? 'text-indigo-700'
                                                        : isDone
                                                          ? 'text-gray-600'
                                                          : 'text-gray-300'
                                                }`}
                                            >
                                                {status}
                                            </p>
                                            {histEntry && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(histEntry.changedAt).toLocaleDateString(
                                                        'pt-BR',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </p>
                                            )}
                                            {histEntry?.notes && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    {histEntry.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onRequestClose={() => setIsEditOpen(false)}
                width={700}
            >
                <ProsthesisRequestUpsert
                    data={request}
                    onClose={() => setIsEditOpen(false)}
                    load={load}
                />
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                onRequestClose={() => setIsStatusOpen(false)}
            >
                <div className="p-2">
                    <h5 className="font-semibold text-gray-800 mb-4">Atualizar Status</h5>
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Novo status</p>
                        <Select
                            placeholder="Selecione o status"
                            options={STATUSES.map(s => ({ value: s, label: s }))}
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                        />
                    </div>
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Observações (opcional)</p>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            rows={3}
                            placeholder="Adicione observações sobre a mudança de status..."
                            value={statusNotes}
                            onChange={e => setStatusNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsStatusOpen(false)}>Cancelar</Button>
                        <Button
                            variant="solid"
                            onClick={handleUpdateStatus}
                            disabled={!selectedStatus}
                        >
                            Confirmar
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Create Service Order Dialog */}
            <Dialog
                isOpen={isOrderOpen}
                onClose={() => setIsOrderOpen(false)}
                onRequestClose={() => setIsOrderOpen(false)}
            >
                <div className="p-2">
                    <h5 className="font-semibold text-gray-800 mb-4">Enviar para Laboratório</h5>
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Laboratório</p>
                        <Select
                            placeholder="Selecione o laboratório"
                            options={laboratories}
                            value={selectedLab}
                            onChange={setSelectedLab}
                        />
                    </div>
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Prazo de entrega esperado</p>
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            value={expectedDate}
                            onChange={e => setExpectedDate(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Observações</p>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            rows={3}
                            value={orderNotes}
                            onChange={e => setOrderNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setIsOrderOpen(false)}>Cancelar</Button>
                        <Button variant="solid" onClick={handleCreateOrder} disabled={!selectedLab}>
                            Enviar OS
                        </Button>
                    </div>
                </div>
            </Dialog>

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onRequestClose={() => setIsDeleteOpen(false)}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onCancel={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
            >
                Tem certeza que deseja excluir esta solicitação?
            </ConfirmDialog>
        </div>
    )
}

export default ProsthesisRequestDetail
