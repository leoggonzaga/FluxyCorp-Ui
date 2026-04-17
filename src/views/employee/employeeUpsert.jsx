import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineArrowRight, HiOutlineUserAdd } from 'react-icons/hi'
import { Button, Input, Notification, Select, toast, InputPhone, InputNationalDocument } from '../../components/ui'
import { enterpriseApiGetGender, enterpriseApiGetJobTitles, enterpriseApiPostEmployees } from '../../api/enterprise/EnterpriseService'
import * as Yup from 'yup'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Loading } from '../../components/shared'

const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Campo obrigatório'),
    email: Yup.string().email('E-mail inválido').required('Campo obrigatório'),
    nationalDocumentNumber: Yup.string().required('Campo obrigatório'),
    jobTitleId: Yup.mixed().required('Campo obrigatório'),
    genderId: Yup.mixed().required('Campo obrigatório'),
})

const EmployeeUpsert = ({ onClose }) => {
    const companyTypeId = useSelector((s) => s?.auth?.user?.companyTypeId)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [jobTitles, setJobTitles] = useState([])
    const [genders, setGenders] = useState([])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const [jobsResult, gendersResult] = await Promise.all([
                enterpriseApiGetJobTitles(companyTypeId),
                enterpriseApiGetGender(),
            ])
            if (jobsResult?.data) {
                setJobTitles(jobsResult.data.map((item) => ({ value: item.id, label: item.name })))
            }
            if (gendersResult?.data) {
                setGenders(gendersResult.data.map((item) => ({ value: item.genderId, label: item.name })))
            }
            if (!jobsResult?.data || !gendersResult?.data) {
                toast.push(
                    <Notification type='danger' title='Falha'>
                        Não foi possível carregar os dados. Tente novamente.
                    </Notification>
                )
            }
            setLoading(false)
        }
        load()
    }, [])

    const handleCreate = async (values) => {
        setIsSubmitting(true)
        const result = await enterpriseApiPostEmployees(values)

        if (result?.data) {
            toast.push(
                <Notification type='success' title='Funcionário cadastrado'>
                    Cadastro criado. Complete as informações abaixo.
                </Notification>
            )
            onClose()
            navigate(`/employee-view/${result.data.publicId}`, { state: { editMode: true } })
        } else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Verifique os campos e tente novamente.
                </Notification>
            )
        }
        setIsSubmitting(false)
    }

    return (
        <Formik
            initialValues={{ fullName: '', email: '', phone: '', nationalDocumentNumber: '', jobTitleId: '', genderId: null }}
            validationSchema={validationSchema}
            onSubmit={handleCreate}
        >
            {({ touched, errors }) => (
                <Form>
                    <FormContainer>
                        <Loading loading={loading}>
                            {/* Header */}
                            <div className='flex items-center gap-3 mb-6'>
                                <div className='w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0'>
                                    <HiOutlineUserAdd className='text-indigo-500 text-xl' />
                                </div>
                                <div>
                                    <h4 className='text-base font-bold text-gray-800 dark:text-gray-100 leading-tight'>
                                        Novo Funcionário
                                    </h4>
                                    <p className='text-xs text-gray-400 mt-0.5'>
                                        Preencha o essencial. Você completará o restante logo em seguida.
                                    </p>
                                </div>
                            </div>

                            {/* Campos */}
                            <div className='space-y-4'>
                                <FormItem
                                    label='Nome Completo'
                                    asterisk
                                    invalid={errors.fullName && touched.fullName}
                                    errorMessage={errors.fullName}
                                >
                                    <Field
                                        type='text'
                                        name='fullName'
                                        placeholder='Ex: Maria Oliveira Santos'
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label='E-mail'
                                    asterisk
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field name='email'>
                                        {({ field, form }) => (
                                            <Input
                                                placeholder='funcionario@clinica.com'
                                                name='email'
                                                field={field}
                                                form={form}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <div className='grid grid-cols-2 gap-4'>
                                    <FormItem
                                        label='CPF'
                                        asterisk
                                        invalid={errors.nationalDocumentNumber && touched.nationalDocumentNumber}
                                        errorMessage={errors.nationalDocumentNumber}
                                    >
                                        <Field name='nationalDocumentNumber'>
                                            {({ field, form }) => (
                                                <InputNationalDocument
                                                    placeholder='000.000.000-00'
                                                    name='nationalDocumentNumber'
                                                    field={field}
                                                    form={form}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label='Telefone'
                                        invalid={errors.phone && touched.phone}
                                        errorMessage={errors.phone}
                                    >
                                        <Field name='phone'>
                                            {({ field, form }) => (
                                                <InputPhone
                                                    placeholder='(00) 00000-0000'
                                                    name='phone'
                                                    field={field}
                                                    form={form}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <FormItem
                                        label='Cargo'
                                        asterisk
                                        invalid={errors.jobTitleId && touched.jobTitleId}
                                        errorMessage={errors.jobTitleId?.label || errors.jobTitleId}
                                    >
                                        <Field name='jobTitleId'>
                                            {({ field, form }) => (
                                                <Select
                                                    placeholder='Selecione o cargo'
                                                    options={jobTitles}
                                                    value={jobTitles.find((o) => o.value === field.value) || null}
                                                    onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label='Gênero'
                                        asterisk
                                        invalid={errors.genderId && touched.genderId}
                                        errorMessage={errors.genderId?.label || errors.genderId}
                                    >
                                        <Field name='genderId'>
                                            {({ field, form }) => (
                                                <Select
                                                    placeholder='Selecione'
                                                    options={genders}
                                                    value={genders.find((o) => o.value === field.value) || null}
                                                    onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                    onBlur={() => form.setFieldTouched(field.name, true)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>
                            </div>

                            {/* Hint */}
                            <div className='mt-5 flex items-start gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 px-4 py-3'>
                                <HiOutlineArrowRight className='text-indigo-400 mt-0.5 flex-shrink-0' />
                                <p className='text-xs text-indigo-600 dark:text-indigo-300 leading-relaxed'>
                                    Após salvar, você será direcionado para o perfil do funcionário já em modo de edição para completar todas as informações.
                                </p>
                            </div>

                            {/* Ações */}
                            <div className='flex items-center justify-end gap-3 mt-6'>
                                <Button type='button' onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant='solid'
                                    type='submit'
                                    loading={isSubmitting}
                                    icon={<HiOutlineArrowRight />}
                                >
                                    Salvar e Continuar
                                </Button>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default EmployeeUpsert
