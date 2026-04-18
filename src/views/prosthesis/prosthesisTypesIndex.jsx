import { useEffect, useState } from 'react'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi'
import { Button, Card, Dialog, Input, Notification, toast } from '@/components/ui'
import { ConfirmDialog, Loading } from '@/components/shared'
import { Field, Form, Formik } from 'formik'
import { FormContainer, FormItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import {
    getProsthesisTypes,
    createProsthesisType,
    deleteProsthesisType,
} from '@/api/prosthesis/prosthesisService'
import { useNavigate } from 'react-router-dom'

const DEFAULT_TYPES = [
    'Coroa unitária',
    'Ponte fixa',
    'Faceta',
    'Lente de contato dental',
    'Protocolo sobre implante',
    'PPR (Prótese Parcial Removível)',
    'PT (Dentadura total)',
    'Placa de bruxismo',
    'Guia cirúrgico',
    'Mockup estético',
]

const ProsthesisTypesIndex = () => {
    const navigate = useNavigate()
    const [types, setTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    const load = async () => {
        setLoading(true)
        const result = await getProsthesisTypes()
        setTypes(Array.isArray(result) ? result : (result?.items ?? []))
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    const handleCreate = async (values, { resetForm }) => {
        const result = await createProsthesisType({ ...values, isCustom: true })
        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Tipo criado com sucesso.
                </Notification>
            )
            resetForm()
            setIsCreateOpen(false)
            load()
        }
    }

    const handleDelete = async () => {
        const result = await deleteProsthesisType(deleteId)
        if (result !== null) {
            toast.push(
                <Notification type="success" title="Removido">
                    Tipo removido.
                </Notification>
            )
            setDeleteId(null)
            load()
        }
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
                        <h2 className="text-xl font-bold text-gray-800">Tipos de Prótese</h2>
                        <p className="text-sm text-gray-500">
                            Gerencie os tipos pré-cadastrados e personalizados
                        </p>
                    </div>
                </div>
                <Button variant="solid" icon={<HiOutlinePlus />} onClick={() => setIsCreateOpen(true)}>
                    Novo Tipo
                </Button>
            </div>

            {/* Default types info */}
            <Card className="bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-600 mb-2">Tipos padrão do sistema</p>
                <div className="flex flex-wrap gap-2">
                    {DEFAULT_TYPES.map(t => (
                        <span
                            key={t}
                            className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 text-xs rounded-full font-medium"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </Card>

            {/* Custom types */}
            <div>
                <p className="text-sm font-semibold text-gray-600 mb-3">Tipos personalizados</p>
                <Loading loading={loading}>
                    {types.filter(t => t.isCustom).length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">
                            Nenhum tipo personalizado cadastrado
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {types
                                .filter(t => t.isCustom)
                                .map(type => (
                                    <Card key={type.publicId}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {type.name}
                                                </p>
                                                {type.description && (
                                                    <p className="text-sm text-gray-500">
                                                        {type.description}
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                size="sm"
                                                icon={<HiOutlineTrash className="text-red-500" />}
                                                onClick={() => setDeleteId(type.publicId)}
                                            />
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    )}
                </Loading>
            </div>

            {/* Create Dialog */}
            <Dialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onRequestClose={() => setIsCreateOpen(false)}
            >
                <Formik
                    initialValues={{ name: '', description: '' }}
                    validationSchema={Yup.object({ name: Yup.string().required('Obrigatório') })}
                    onSubmit={handleCreate}
                >
                    {({ errors, touched }) => (
                        <Form>
                            <FormContainer>
                                <h5 className="font-semibold text-gray-800 mb-4">
                                    Novo Tipo de Prótese
                                </h5>
                                <FormItem
                                    label="Nome"
                                    asterisk
                                    invalid={errors.name && touched.name}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Ex: Coroa sobre implante"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem label="Descrição">
                                    <Field name="description">
                                        {({ field, form }) => (
                                            <Input
                                                textArea
                                                placeholder="Descrição opcional"
                                                field={field}
                                                form={form}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
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
                Tem certeza que deseja remover este tipo?
            </ConfirmDialog>
        </div>
    )
}

export default ProsthesisTypesIndex
