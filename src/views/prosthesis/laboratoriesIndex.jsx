import { useEffect, useState } from 'react'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineArrowLeft,
    HiOutlineStar,
    HiOutlinePhone,
    HiOutlineMail,
} from 'react-icons/hi'
import { Button, Card, Dialog, Input, Notification, toast } from '@/components/ui'
import { ConfirmDialog, Loading } from '@/components/shared'
import { Field, Form, Formik } from 'formik'
import { FormContainer, FormItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import {
    getLaboratories,
    createLaboratory,
    updateLaboratory,
    deleteLaboratory,
} from '@/api/prosthesis/prosthesisService'
import { useNavigate } from 'react-router-dom'

const validationSchema = Yup.object({
    name: Yup.string().required('Obrigatório'),
})

const RatingStars = ({ rating }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <HiOutlineStar
                key={i}
                className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
            />
        ))}
    </div>
)

const LaboratoriesIndex = () => {
    const navigate = useNavigate()
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true)
    const [isUpsertOpen, setIsUpsertOpen] = useState(false)
    const [selectedLab, setSelectedLab] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const load = async () => {
        setLoading(true)
        const result = await getLaboratories()
        setLabs(Array.isArray(result) ? result : [])
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    const handleSubmit = async (values, { resetForm }) => {
        const payload = {
            ...values,
            averageDeliveryDays: values.averageDeliveryDays
                ? parseInt(values.averageDeliveryDays)
                : null,
            internalRating: values.internalRating ? parseInt(values.internalRating) : null,
        }
        const result = selectedLab
            ? await updateLaboratory(selectedLab.publicId, payload)
            : await createLaboratory(payload)

        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Laboratório {selectedLab ? 'atualizado' : 'cadastrado'}.
                </Notification>
            )
            resetForm()
            setIsUpsertOpen(false)
            setSelectedLab(null)
            load()
        }
    }

    const openEdit = lab => {
        setSelectedLab(lab)
        setIsUpsertOpen(true)
    }

    const handleDelete = async () => {
        const result = await deleteLaboratory(deleteId)
        if (result !== null) {
            toast.push(
                <Notification type="success" title="Removido">
                    Laboratório removido.
                </Notification>
            )
            setDeleteId(null)
            load()
        }
    }

    const initialValues = selectedLab
        ? {
              name: selectedLab.name || '',
              contactName: selectedLab.contactName || '',
              phone: selectedLab.phone || '',
              email: selectedLab.email || '',
              address: selectedLab.address || '',
              city: selectedLab.city || '',
              state: selectedLab.state || '',
              averageDeliveryDays: selectedLab.averageDeliveryDays || '',
              specialties: selectedLab.specialties || '',
              internalRating: selectedLab.internalRating || '',
          }
        : {
              name: '',
              contactName: '',
              phone: '',
              email: '',
              address: '',
              city: '',
              state: '',
              averageDeliveryDays: '',
              specialties: '',
              internalRating: '',
          }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="plain"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/prosthesis')}
                    />
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Laboratórios Protéticos</h2>
                        <p className="text-sm text-gray-500">Gerencie seus laboratórios parceiros</p>
                    </div>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => {
                        setSelectedLab(null)
                        setIsUpsertOpen(true)
                    }}
                >
                    Novo Laboratório
                </Button>
            </div>

            <Loading loading={loading}>
                {labs.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-sm">Nenhum laboratório cadastrado</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {labs.map(lab => (
                            <Card
                                key={lab.publicId}
                                className="hover:shadow-md transition-all duration-200 border border-gray-100"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-gray-800">{lab.name}</h5>
                                            {lab.internalRating && (
                                                <RatingStars rating={lab.internalRating} />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
                                            {lab.contactName && <span>{lab.contactName}</span>}
                                            {lab.phone && (
                                                <div className="flex items-center gap-1">
                                                    <HiOutlinePhone className="w-3.5 h-3.5" />
                                                    <span>{lab.phone}</span>
                                                </div>
                                            )}
                                            {lab.email && (
                                                <div className="flex items-center gap-1">
                                                    <HiOutlineMail className="w-3.5 h-3.5" />
                                                    <span>{lab.email}</span>
                                                </div>
                                            )}
                                            {(lab.city || lab.state) && (
                                                <span>
                                                    {[lab.city, lab.state].filter(Boolean).join(' - ')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-3 mt-3 flex-wrap">
                                            {lab.averageDeliveryDays && (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                    {lab.averageDeliveryDays}d prazo médio
                                                </span>
                                            )}
                                            {lab.delayCount > 0 && (
                                                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                                                    {lab.delayCount} atraso(s)
                                                </span>
                                            )}
                                            {lab.specialties && (
                                                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                                                    {lab.specialties}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1 ml-3">
                                        <Button
                                            size="xs"
                                            icon={<HiOutlinePencil className="text-sky-600" />}
                                            onClick={() => openEdit(lab)}
                                        />
                                        <Button
                                            size="xs"
                                            icon={<HiOutlineTrash className="text-red-500" />}
                                            onClick={() => setDeleteId(lab.publicId)}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Loading>

            {/* Upsert Dialog */}
            <Dialog
                isOpen={isUpsertOpen}
                onClose={() => {
                    setIsUpsertOpen(false)
                    setSelectedLab(null)
                }}
                onRequestClose={() => {
                    setIsUpsertOpen(false)
                    setSelectedLab(null)
                }}
                width={600}
            >
                <Formik
                    key={selectedLab?.publicId || 'new'}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <FormContainer>
                                <h5 className="font-semibold text-gray-800 mb-4">
                                    {selectedLab ? 'Editar Laboratório' : 'Novo Laboratório'}
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <FormItem
                                        label="Nome"
                                        asterisk
                                        invalid={errors.name && touched.name}
                                        errorMessage={errors.name}
                                        className="col-span-2"
                                    >
                                        <Field
                                            type="text"
                                            name="name"
                                            placeholder="Nome do laboratório"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Contato">
                                        <Field
                                            type="text"
                                            name="contactName"
                                            placeholder="Nome do responsável"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Telefone">
                                        <Field
                                            type="text"
                                            name="phone"
                                            placeholder="(00) 00000-0000"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="E-mail">
                                        <Field
                                            type="email"
                                            name="email"
                                            placeholder="email@lab.com"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Prazo médio (dias)">
                                        <Field
                                            type="number"
                                            name="averageDeliveryDays"
                                            placeholder="7"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Cidade">
                                        <Field
                                            type="text"
                                            name="city"
                                            placeholder="Cidade"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Estado">
                                        <Field
                                            type="text"
                                            name="state"
                                            placeholder="SP"
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Endereço" className="col-span-2">
                                        <Field
                                            type="text"
                                            name="address"
                                            placeholder="Rua, número..."
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Especialidades" className="col-span-2">
                                        <Field
                                            type="text"
                                            name="specialties"
                                            placeholder="Ex: Zircônia, Implantes, PPR..."
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem label="Avaliação interna (1-5)">
                                        <Field
                                            type="number"
                                            name="internalRating"
                                            min="1"
                                            max="5"
                                            placeholder="5"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setIsUpsertOpen(false)
                                            setSelectedLab(null)
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" variant="solid">
                                        Salvar
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Dialog>

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onRequestClose={() => setDeleteId(null)}
                type="danger"
                confirmText="Excluir"
                cancelText="Cancelar"
                onCancel={() => setDeleteId(null)}
                onConfirm={handleDelete}
            >
                Tem certeza que deseja remover este laboratório?
            </ConfirmDialog>
        </div>
    )
}

export default LaboratoriesIndex
