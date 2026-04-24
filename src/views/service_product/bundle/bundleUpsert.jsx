import { Formik, Form, Field } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle } from 'react-icons/hi'
import { Button, Input, Select, Notification, toast } from '../../../components/ui'
import * as Yup from 'yup'
import { FormNumericInput, Loading } from '../../../components/shared'
import { useEffect, useState } from 'react'
import { catalogApiGetBundleCategories, catalogApiGetProducts, catalogApiGetServices, catalogApiPostBundle, catalogApiPutBundle } from '../../../api/catalog/catalogService'

const isEdit = (data) => !!data?.publicId

const BundleUpsert = ({ data, onClose, load, onUpdate }) => {
    const [isLoading, setIsLoading]         = useState(false)
    const [isSubmitting, setIsSubmitting]   = useState(false)
    const [groupedItems, setGroupedItems]   = useState([])
    const [isSelectLoading, setIsSelectLoading] = useState(false)
    const [categories, setCategories]       = useState([])

    const validationSchema = Yup.object().shape({
        name:       Yup.string().required('Campo obrigatório'),
        price:      Yup.number().min(0, 'Valor inválido').required('Campo obrigatório'),
        categoryId: Yup.string().required('Campo obrigatório'),
        items:      Yup.array().min(1, 'Adicione pelo menos um item').required('Campo obrigatório'),
    })

    const buildGroupedItems = (products, services) => {
        const groups = []
        if (products?.length > 0)
            groups.push({ label: 'Produtos', options: products.map(p => ({ value: p.publicId, label: p.name, type: 'product' })) })
        if (services?.length > 0)
            groups.push({ label: 'Serviços', options: services.map(s => ({ value: s.publicId, label: s.name, type: 'service' })) })
        return groups
    }

    const loadSelectOptions = async () => {
        setIsSelectLoading(true)
        const [pRes, sRes] = await Promise.all([catalogApiGetProducts(), catalogApiGetServices()])
        const groups = buildGroupedItems(pRes?.data ?? [], sRes?.data ?? [])
        setGroupedItems(groups)
        setIsSelectLoading(false)
        return groups
    }

    const getBundleCategories = async () => {
        setIsLoading(true)
        const result = await catalogApiGetBundleCategories()
        if (result?.data) setCategories(result.data.map(cat => ({ label: cat.name, value: cat.id })))
        setIsLoading(false)
    }

    const handleCreate = async (values) => {
        setIsSubmitting(true)
        const result = await catalogApiPostBundle({ ...values })
        if (result) {
            toast.push(<Notification type='success' title='Criado'>Kit criado com sucesso!</Notification>)
            load()
            onClose()
        }
        setIsSubmitting(false)
    }

    const handleUpdate = async (values) => {
        setIsSubmitting(true)
        const apiItems = values.items?.map(i => ({ publicId: i.value ?? i.publicId, type: i.type }))
        await catalogApiPutBundle(values.publicId, { ...values, items: apiItems })
        await load()
        toast.push(<Notification type='success' title='Atualizado'>Kit atualizado com sucesso!</Notification>)
        onClose()
        setIsSubmitting(false)
    }

    useEffect(() => { getBundleCategories() }, [])

    const initialValues = {
        publicId:    data?.publicId    ?? null,
        name:        data?.name        ?? '',
        price:       data?.price       ?? 0,
        categoryId:  data?.categoryId  ?? '',
        description: data?.description ?? '',
        items:       data?.items?.map(item => ({ value: item.publicId, label: item.name, type: item.type })) ?? [],
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
                                {isEdit(data) ? 'Editar' : 'Novo'} Kit
                            </h5>

                            <div className='flex gap-6 w-full'>
                                <div className='flex flex-col flex-1 min-w-0'>
                                    <FormItem
                                        label='Nome do Kit'
                                        asterisk
                                        invalid={errors.name && touched.name}
                                        errorMessage={errors.name}
                                    >
                                        <Field type='text' name='name' placeholder='Nome do kit' component={Input} />
                                    </FormItem>

                                    <div className='flex gap-2'>
                                        <div className='w-1/2'>
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
                                        label='Itens do Kit'
                                        asterisk
                                        invalid={errors.items && touched.items}
                                        errorMessage={errors.items}
                                    >
                                        <Field name='items'>
                                            {({ field, form }) => (
                                                <Select
                                                    placeholder='Selecione os itens'
                                                    options={groupedItems}
                                                    isMulti
                                                    isClearable
                                                    isLoading={isSelectLoading}
                                                    onFocus={loadSelectOptions}
                                                    form={form}
                                                    field={field}
                                                    value={values.items}
                                                    onChange={option =>
                                                        form.setFieldValue(field.name, option?.map(opt => ({ ...opt, publicId: opt.value })))
                                                    }
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <FormItem
                                        label='Descrição'
                                        invalid={errors.description && touched.description}
                                        errorMessage={errors.description}
                                    >
                                        <Field name='description'>
                                            {({ field, form }) => (
                                                <Input
                                                    textArea
                                                    placeholder='Descrição do kit'
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

export default BundleUpsert
