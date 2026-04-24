import { Formik, Form, Field } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle } from 'react-icons/hi'
import { Button, Checkbox, Input, Select, Notification, toast } from '../../../components/ui'
import * as Yup from 'yup'
import { FormNumericInput, Loading } from '../../../components/shared'
import { useEffect, useState } from 'react'
import { catalogApiGetServiceCategories, catalogApiPostService, catalogApiPutService } from '../../../api/catalog/catalogService'

const isEdit = (data) => !!data?.publicId

const ServiceUpsert = ({ data, onClose, load, onUpdate }) => {
    const [isLoading, setIsLoading]     = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categories, setCategories]   = useState([])

    const validationSchema = Yup.object().shape({
        name:       Yup.string().required('Campo obrigatório'),
        price:      Yup.number().min(0, 'Valor inválido').required('Campo obrigatório'),
        categoryId: Yup.string().required('Campo obrigatório'),
    })

    const getServiceCategories = async () => {
        setIsLoading(true)
        const result = await catalogApiGetServiceCategories()
        if (result?.data) setCategories(result.data.map(cat => ({ label: cat.name, value: cat.id })))
        setIsLoading(false)
    }

    const handleCreate = async (values) => {
        setIsSubmitting(true)
        const result = await catalogApiPostService({ ...values })
        if (result) {
            toast.push(<Notification type='success' title='Criado'>Serviço criado com sucesso!</Notification>)
            load()
            onClose()
        }
        setIsSubmitting(false)
    }

    const handleUpdate = async (values) => {
        setIsSubmitting(true)
        await catalogApiPutService(values.publicId, values)
        await load()
        toast.push(<Notification type='success' title='Atualizado'>Serviço atualizado com sucesso!</Notification>)
        onClose()
        setIsSubmitting(false)
    }

    useEffect(() => { getServiceCategories() }, [])

    const initialValues = {
        publicId:    data?.publicId    ?? null,
        name:        data?.name        ?? '',
        price:       data?.price       ?? 0,
        categoryId:  data?.categoryId  ?? '',
        description: data?.description ?? '',
    }

    return (
        <Loading loading={isLoading}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => isEdit(data) ? handleUpdate(values) : handleCreate(values)}
            >
                {({ values, touched, errors }) => (
                    <Form>
                        <FormContainer className='text-gray-700'>
                            <h5 className='font-semibold text-gray-700 text-center mb-4'>
                                {isEdit(data) ? 'Editar' : 'Novo'} Serviço
                            </h5>

                            <div className='flex gap-6 w-full'>
                                <div className='flex flex-col flex-1 min-w-0'>
                                    <FormItem
                                        label='Nome do Serviço'
                                        asterisk
                                        invalid={errors.name && touched.name}
                                        errorMessage={errors.name}
                                    >
                                        <Field type='text' name='name' placeholder='Nome do serviço' component={Input} />
                                    </FormItem>

                                    <div className='flex gap-2'>
                                        <div className='w-1/3'>
                                            <FormItem
                                                label='Valor'
                                                asterisk
                                                invalid={errors.price && touched.price}
                                                errorMessage={errors.price}
                                            >
                                                <Field name='price'>
                                                    {({ field, form }) => (
                                                        <FormNumericInput
                                                            className='w-full'
                                                            value={values.price}
                                                            field={field}
                                                            form={form}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>

                                        <div className='flex-1'>
                                            <FormItem
                                                label='Categoria'
                                                asterisk
                                                invalid={errors.categoryId && touched.categoryId}
                                                errorMessage={errors.categoryId}
                                            >
                                                <Field name='categoryId'>
                                                    {({ field, form }) => (
                                                        <Select
                                                            placeholder='Selecione a categoria'
                                                            options={categories}
                                                            isClearable
                                                            form={form}
                                                            field={field}
                                                            onChange={option => form.setFieldValue(field.name, option?.value)}
                                                            value={categories.find(x => x.value === values.categoryId)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        </div>
                                    </div>

                                    <FormItem
                                        label='Descrição'
                                        invalid={errors.description && touched.description}
                                        errorMessage={errors.description}
                                    >
                                        <Field name='description'>
                                            {({ field, form }) => (
                                                <Input
                                                    textArea
                                                    placeholder='Descrição do serviço'
                                                    field={field}
                                                    form={form}
                                                    onChange={e => form.setFieldValue(field.name, e?.target?.value)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className='w-px bg-gray-200 self-stretch' />

                                <div className='w-56 shrink-0'>
                                    <span className='font-semibold text-sm text-gray-600'>Catálogos</span>
                                    <p className='text-xs text-gray-400 mt-1'>Nenhum catálogo vinculado</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 justify-center mt-4'>
                                <Button type='button' onClick={onClose}>Cancelar</Button>
                                <Button
                                    variant='solid'
                                    icon={<HiOutlineCheckCircle />}
                                    type='submit'
                                    loading={isSubmitting}
                                    className={isEdit(data)
                                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-500'
                                        : 'bg-violet-600 hover:bg-violet-700 border-violet-600'
                                    }
                                >
                                    {isEdit(data) ? 'Atualizar' : 'Criar'}
                                </Button>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </Loading>
    )
}

export default ServiceUpsert
