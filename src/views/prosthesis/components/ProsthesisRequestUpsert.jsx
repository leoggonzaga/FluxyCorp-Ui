import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import * as Yup from 'yup'
import { useState, useEffect } from 'react'
import { Button, Input, Notification, toast, Select, Tabs } from '@/components/ui'
import { Loading } from '@/components/shared'
import { createProsthesisRequest, updateProsthesisRequest, getProsthesisTypes } from '@/api/prosthesis/prosthesisService'
import {
    HiOutlineCheckCircle,
    HiOutlineUser,
    HiOutlineBeaker,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi'

const { TabList, TabNav, TabContent } = Tabs

const ARCH_OPTIONS = [
    { value: 'Superior', label: 'Superior' },
    { value: 'Inferior', label: 'Inferior' },
    { value: 'Ambas', label: 'Ambas' },
]

const MATERIAL_OPTIONS = [
    { value: 'Porcelana', label: 'Porcelana' },
    { value: 'Zircônia', label: 'Zircônia' },
    { value: 'Resina', label: 'Resina' },
    { value: 'Metal-cerâmica', label: 'Metal-cerâmica' },
    { value: 'E-max', label: 'E-max' },
    { value: 'PMMA', label: 'PMMA' },
    { value: 'Acrílico', label: 'Acrílico' },
]

const VITA_OPTIONS = [
    'A1','A2','A3','A3.5','A4',
    'B1','B2','B3','B4',
    'C1','C2','C3','C4',
    'D2','D3','D4',
    'Bleach BL1','Bleach BL2','Bleach BL3','Bleach BL4',
].map(v => ({ value: v, label: v }))

const validationSchema = Yup.object().shape({
    patientName: Yup.string().required('Campo obrigatório'),
    dentistName: Yup.string().required('Campo obrigatório'),
    moldingDate: Yup.date().required('Campo obrigatório'),
    prosthesisTypePublicId: Yup.mixed().required('Campo obrigatório'),
})

const TabLabel = ({ icon, label }) => (
    <span className="flex items-center gap-1.5">
        {icon}
        {label}
    </span>
)

const ProsthesisRequestUpsert = ({ data, onClose, load }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [types, setTypes] = useState([])
    const [activeTab, setActiveTab] = useState('clinico')

    useEffect(() => {
        getProsthesisTypes().then(res => {
            const list = Array.isArray(res) ? res : (res?.items ?? [])
            setTypes(list.map(t => ({ value: t.publicId, label: t.name })))
        })
    }, [])

    const initialValues = data ? {
        patientName: data.patientName || '',
        dentistName: data.dentistName || '',
        clinicUnit: data.clinicUnit || '',
        moldingDate: data.moldingDate ? new Date(data.moldingDate).toISOString().split('T')[0] : '',
        prosthesisTypePublicId: data.prosthesisTypePublicId ? { value: data.prosthesisTypePublicId, label: data.prosthesisTypeName } : null,
        arch: data.arch ? { value: data.arch, label: data.arch } : null,
        tooth: data.tooth || '',
        material: data.material ? { value: data.material, label: data.material } : null,
        vitaColor: data.vitaColor ? { value: data.vitaColor, label: data.vitaColor } : null,
        clinicalNotes: data.clinicalNotes || '',
        patientPrice: data.patientPrice || '',
        laboratoryPrice: data.laboratoryPrice || '',
        dentistCommission: data.dentistCommission || '',
        warrantyMonths: data.warrantyMonths || 12,
    } : {
        patientName: '',
        dentistName: '',
        clinicUnit: '',
        moldingDate: '',
        prosthesisTypePublicId: null,
        arch: null,
        tooth: '',
        material: null,
        vitaColor: null,
        clinicalNotes: '',
        patientPrice: '',
        laboratoryPrice: '',
        dentistCommission: '',
        warrantyMonths: 12,
    }

    const handleSubmit = async (values) => {
        setIsSubmitting(true)
        const payload = {
            ...values,
            prosthesisTypePublicId: values.prosthesisTypePublicId?.value,
            arch: values.arch?.value,
            material: values.material?.value,
            vitaColor: values.vitaColor?.value,
            patientPrice: values.patientPrice ? parseFloat(values.patientPrice) : null,
            laboratoryPrice: values.laboratoryPrice ? parseFloat(values.laboratoryPrice) : null,
            dentistCommission: values.dentistCommission ? parseFloat(values.dentistCommission) : null,
        }

        const result = data
            ? await updateProsthesisRequest(data.publicId, payload)
            : await createProsthesisRequest(payload)

        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Solicitação {data ? 'atualizada' : 'criada'} com sucesso.
                </Notification>
            )
            onClose()
            load()
        }
        setIsSubmitting(false)
    }

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, touched, errors, setFieldValue }) => (
                <Form>
                    <FormContainer>
                        <Loading loading={isSubmitting}>
                            <h4 className="text-base font-semibold text-gray-800 mb-4">
                                {data ? 'Editar Solicitação' : 'Nova Solicitação de Prótese'}
                            </h4>

                            <Tabs value={activeTab} onChange={setActiveTab} variant="underline">
                                <TabList>
                                    <TabNav value="clinico">
                                        <TabLabel icon={<HiOutlineUser className="w-4 h-4" />} label="Clínico" />
                                    </TabNav>
                                    <TabNav value="protese">
                                        <TabLabel icon={<HiOutlineBeaker className="w-4 h-4" />} label="Prótese" />
                                    </TabNav>
                                    <TabNav value="financeiro">
                                        <TabLabel icon={<HiOutlineCurrencyDollar className="w-4 h-4" />} label="Financeiro" />
                                    </TabNav>
                                </TabList>

                                {/* ABA 1 — Clínico */}
                                <TabContent value="clinico">
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <FormItem
                                            label="Paciente"
                                            asterisk
                                            invalid={errors.patientName && touched.patientName}
                                            errorMessage={errors.patientName}
                                        >
                                            <Field type="text" name="patientName" placeholder="Nome do paciente" component={Input} />
                                        </FormItem>
                                        <FormItem
                                            label="Dentista responsável"
                                            asterisk
                                            invalid={errors.dentistName && touched.dentistName}
                                            errorMessage={errors.dentistName}
                                        >
                                            <Field type="text" name="dentistName" placeholder="Nome do dentista" component={Input} />
                                        </FormItem>
                                        <FormItem label="Unidade / Clínica">
                                            <Field type="text" name="clinicUnit" placeholder="Unidade" component={Input} />
                                        </FormItem>
                                        <FormItem
                                            label="Data da Moldagem"
                                            asterisk
                                            invalid={errors.moldingDate && touched.moldingDate}
                                            errorMessage={errors.moldingDate}
                                        >
                                            <Field type="date" name="moldingDate" component={Input} />
                                        </FormItem>
                                    </div>
                                </TabContent>

                                {/* ABA 2 — Prótese */}
                                <TabContent value="protese">
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <FormItem
                                            label="Tipo de Prótese"
                                            asterisk
                                            invalid={errors.prosthesisTypePublicId && touched.prosthesisTypePublicId}
                                            errorMessage={errors.prosthesisTypePublicId}
                                        >
                                            <Select
                                                placeholder="Selecione o tipo"
                                                options={types}
                                                value={values.prosthesisTypePublicId}
                                                onChange={val => setFieldValue('prosthesisTypePublicId', val)}
                                            />
                                        </FormItem>
                                        <FormItem label="Arcada">
                                            <Select
                                                placeholder="Selecione a arcada"
                                                options={ARCH_OPTIONS}
                                                value={values.arch}
                                                onChange={val => setFieldValue('arch', val)}
                                            />
                                        </FormItem>
                                        <FormItem label="Dente(s)">
                                            <Field type="text" name="tooth" placeholder="Ex: 11, 12, 21" component={Input} />
                                        </FormItem>
                                        <FormItem label="Material">
                                            <Select
                                                placeholder="Selecione o material"
                                                options={MATERIAL_OPTIONS}
                                                value={values.material}
                                                onChange={val => setFieldValue('material', val)}
                                            />
                                        </FormItem>
                                        <FormItem label="Cor / Escala Vita">
                                            <Select
                                                placeholder="Selecione a cor"
                                                options={VITA_OPTIONS}
                                                value={values.vitaColor}
                                                onChange={val => setFieldValue('vitaColor', val)}
                                            />
                                        </FormItem>
                                        <FormItem label="Garantia (meses)">
                                            <Field type="number" name="warrantyMonths" placeholder="12" component={Input} />
                                        </FormItem>
                                        <FormItem label="Observações Clínicas" className="col-span-2">
                                            <Field name="clinicalNotes">
                                                {({ field, form }) => (
                                                    <Input
                                                        textArea
                                                        rows={3}
                                                        placeholder="Observações, detalhes técnicos..."
                                                        field={field}
                                                        form={form}
                                                        value={values.clinicalNotes}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </TabContent>

                                {/* ABA 3 — Financeiro */}
                                <TabContent value="financeiro">
                                    <div className="grid grid-cols-3 gap-3 pt-4">
                                        <FormItem label="Valor do Paciente (R$)">
                                            <Field type="number" name="patientPrice" placeholder="0,00" component={Input} />
                                        </FormItem>
                                        <FormItem label="Valor do Laboratório (R$)">
                                            <Field type="number" name="laboratoryPrice" placeholder="0,00" component={Input} />
                                        </FormItem>
                                        <FormItem label="Comissão Dentista (R$)">
                                            <Field type="number" name="dentistCommission" placeholder="0,00" component={Input} />
                                        </FormItem>
                                    </div>
                                    {values.patientPrice && values.laboratoryPrice && (
                                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                                            <span className="text-sm text-emerald-600">Margem estimada</span>
                                            <span className="text-lg font-bold text-emerald-700">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                    parseFloat(values.patientPrice || 0) -
                                                    parseFloat(values.laboratoryPrice || 0) -
                                                    parseFloat(values.dentistCommission || 0)
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </TabContent>
                            </Tabs>

                            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
                                <Button type="button" onClick={onClose}>Cancelar</Button>
                                <Button type="submit" variant="solid" icon={<HiOutlineCheckCircle />}>
                                    {data ? 'Atualizar' : 'Criar Solicitação'}
                                </Button>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default ProsthesisRequestUpsert
