import { Formik, Form, Field } from "formik";
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlinePlus } from "react-icons/hi"
import { Button, Checkbox, Input, Select, Notification, toast } from "../../../components/ui";
import * as Yup from 'yup'
import { FormNumericInput, Loading } from "../../../components/shared";
import { useEffect, useState } from "react";
import { catalogApiGetBundleCategories, catalogApiGetProducts, catalogApiGetServices, catalogApiPostBundle, catalogApiPutBundle } from "../../../api/catalog/catalogService";
import AsyncSelect from 'react-select/async'


const BundleUpsert = ({ data, onClose, load }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [groupedBundleItems, setGroupedBundleItems] = useState([])
    const [isSelectLoading, setIsSelectLoading] = useState(false)
    const [categories, setCategories] = useState([])

    const catalogs = [
        { id: 1, name: 'ortodonto 2025 uniodonto' },
        { id: 2, name: 'endo 2024 Uni' }
    ]

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Campo Obrigatório'),
        price: Yup.number().required('Campo Obrigatório'),
        categoryId: Yup.string().required('Campo Obrigatório'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    value: Yup.string().required(),
                    label: Yup.string().required()
                })
            )
            .min(1, 'É necessário ter pelo menos um item')
    })

    const getServicesAndProducts = async (inputFilter) => {
        setIsSelectLoading(true)

        let products = []
        let services = []

        const productsResult = await catalogApiGetProducts()
        if (productsResult?.data) products = productsResult.data

        const servicesResult = await catalogApiGetServices()
        if (servicesResult?.data) services = servicesResult.data

        var bundleItems = returnGroupedItems(products, services)

        setIsSelectLoading(false)
        setGroupedBundleItems(bundleItems)
        return bundleItems
    }

    const handleGroupItems = (items) => {
        if (!items)
            return [];

        const products = [];
        const services = [];

        items?.map((item) => {
            if (item.type == "Service")
                services.push(item)
            else if (item.type == "Product")
                products.push(item)
        })
        debugger;
        return returnGroupedItems(products, services);
    }

    const returnGroupedItems = (products, services) => {
        const bundleItems = []

        if (products?.length > 0) {
            bundleItems.push({
                label: 'Produtos',
                options: products.map(p => ({
                    value: p.publicId,
                    label: p.name,
                    type: 'product'
                }))
            })
        }

        if (services?.length > 0) {
            bundleItems.push({
                label: 'Serviços',
                options: services.map(s => ({
                    value: s.publicId,
                    label: s.name,
                    type: 'service'
                }))
            })
        }

        return bundleItems;
    }

    const loadOptions = async (inputValue) => {
        await getServicesAndProducts(inputValue)
    }

    const handleCreate = async (values) => {
        setIsSubmitting(true)
        debugger;
        const result = await catalogApiPostBundle({ ...values })
        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Kit criado com sucesso!
                </Notification>
            )
            load();
            onClose();
        } else {
            toast.push(
                <Notification type="danger" title="Falha na Criação">
                    Falha na criação do kit. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }
        setIsSubmitting(false)
    }

    const handleUpdate = async (values) => {
        setIsSubmitting(true)
        debugger;

        if (values.items?.length > 0) {
            values.items = values.items?.map(item => { return { publicId: item.value, type: item.type } })
        }

        const result = await catalogApiPutBundle(values.publicId, values)
        if (result?.data) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Kit atualizado com sucesso!
                </Notification>
            )
            load();
            onClose();
        } else {
            toast.push(
                <Notification type="danger" title="Falha na Atualização">
                    Falha na atualização do kit. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }
        setIsSubmitting(false)
    }

    const getBundleCategories = async () => {
        setIsLoading(true)

        const result = await catalogApiGetBundleCategories();

        if (result?.data) {
            setCategories(result.data.map(cat => {
                return { label: cat.name, value: cat.id }
            }));
        }

        setIsLoading(false)
    }

    useEffect(() => {
        getBundleCategories();
    }, [])

    return (
        <Loading loading={isLoading}>
            <Formik
                initialValues={
                    data != null

                        ?

                        {
                            ...data,
                            // items: handleGroupItems(data.items)
                            items: data.items?.map(item => ({ label: item.name, value: item.publicId, type: item.type }))
                        }

                        :

                        {}
                }
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    !data ? handleCreate(values) : handleUpdate(values)
                }}
            >
                {({ values, touched, errors }) => (
                    <Form>
                        <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700'>
                            <Loading loading={isLoading}>
                                <h3 className='flex justify-center'>
                                    {!data ? 'Cadastrar' : 'Editar'} Kit
                                </h3>

                                <div className="flex gap-4 w-full mt-4">
                                    <div className='mt-2 w-6/10'>
                                        <FormItem
                                            label="Nome do Kit"
                                            asterisk
                                            invalid={errors.name && touched.name}
                                            errorMessage={errors.name}
                                        >
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Nome do Kit"
                                                component={Input}
                                            />
                                        </FormItem>

                                        <div className="flex items-center gap-2 justify-between">
                                            <div className="w-1/2">
                                                <FormItem
                                                    label='Valor'
                                                    asterisk
                                                    invalid={errors.price && touched.price}
                                                    errorMessage={errors.price}
                                                >
                                                    <Field name="price">
                                                        {({ field, form }) => (
                                                            <FormNumericInput
                                                                className='w-full flex'
                                                                value={values.price}
                                                                field={field}
                                                                form={form}
                                                            />
                                                        )}
                                                    </Field>
                                                </FormItem>
                                            </div>

                                            <div className="w-1/2">
                                                <FormItem
                                                    label='Categoria'
                                                    asterisk
                                                    invalid={errors.categoryId && touched.categoryId}
                                                    errorMessage={errors.categoryId}
                                                >
                                                    <Field name="categoryId">
                                                        {({ field, form }) => (
                                                            <Select
                                                                placeholder='Selecione a Categoria'
                                                                options={categories}
                                                                isClearable
                                                                form={form}
                                                                field={field}
                                                                onChange={option => {
                                                                    form.setFieldValue(field.name, option?.value)
                                                                }}
                                                                value={categories.find(x => x.value == values.categoryId)}
                                                            />
                                                        )}
                                                    </Field>
                                                </FormItem>
                                            </div>
                                        </div>

                                        <FormItem
                                            label='Itens'
                                            asterisk
                                            invalid={errors.items && touched.items}
                                            errorMessage={errors.items}
                                        >
                                            <Field name="items">
                                                {({ field, form }) => (
                                                    <Select
                                                        placeholder='Selecione os Itens'
                                                        options={groupedBundleItems}
                                                        isMulti
                                                        isClearable
                                                        // componentAs={AsyncSelect}
                                                        // loadOptions={loadOptions}
                                                        isLoading={isSelectLoading}
                                                        onFocus={loadOptions}
                                                        form={form}
                                                        field={field}
                                                        defaultValue={
                                                            groupedBundleItems?.flatMap(bundleGroup =>
                                                                bundleGroup?.options?.filter(opt =>
                                                                    values?.items?.some(v => v?.value === opt?.value)
                                                                ) || []
                                                            )
                                                        }
                                                        onChange={option => {
                                                            form.setFieldValue(field.name, option?.map(opt => { return { ...opt, publicId: opt.value } }))
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label='Descrição'
                                            invalid={errors.description && touched.description}
                                            errorMessage={errors.description}
                                        >
                                            <Field name="description">
                                                {({ field, form }) => (
                                                    <Input
                                                        textArea
                                                        field={field}
                                                        form={form}
                                                        placeholder="Descrição do Kit"
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e?.target?.value)
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className="h-auto border-1 border-gray-800" />

                                    <div className="flex flex-col w-4/10">
                                        <span className="font-semibold text-base flex items-center gap-1">
                                            Catálogos
                                            <Button shape="circle" className="w-[20px] h-[20px]" variant="solid" icon={<HiOutlinePlus size={14} />} />
                                        </span>

                                        <div>
                                            {catalogs?.length == 0 && <span className="p-2 rounded-lg">Nenhum Catálogo Vinculado</span>}
                                            {catalogs?.map(catalog => (
                                                <div key={catalog.id} className="mt-2">
                                                    <span className="items-center flex">
                                                        <Checkbox defaultChecked={true} disabled={true} />
                                                        {catalog.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 justify-center mt-3'>
                                    <Button type='button' onClick={onClose}>Cancelar</Button>
                                    <Button variant='solid' icon={<HiOutlineCheckCircle />} type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </div>
                            </Loading>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </Loading>
    )
}

export default BundleUpsert;
