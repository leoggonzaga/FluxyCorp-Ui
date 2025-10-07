import { Formik, Form, Field } from "formik";
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlinePlus } from "react-icons/hi"
import { Button, Checkbox, Input, Select, Notification, toast, MoneyValue } from "../../../components/ui";
import * as Yup from 'yup'
import { FormNumericInput, Loading } from "../../../components/shared";
import { useEffect, useState } from "react";
import { catalogApiGetServiceCategories, catalogApiPostService, catalogApiPutService } from "../../../api/catalog/catalogService";

const ServiceUpsert = ({ data, onClose, load }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState([])

    const catalogs = [
        { id: 1, name: 'ortodonto 2025 uniodonto' },
        { id: 2, name: 'endo 2024 Uni' },
        { id: 3, name: 'endo 2024 Uni Lorem ipsum' },
        { id: 4, name: 'endo 2024 Uni teste teste teste' },
        { id: 5, name: 'endo 2024' }
    ]

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Campo Obrigatório'),
        price: Yup.number().required('Campo Obrigatório'),
        categoryId: Yup.string().required('Campo Obrigatório'),
    })

    const getServiceCategories = async () => {
        setIsLoading(true)
        debugger;
        const result = await catalogApiGetServiceCategories();

        if (result?.data) {
            debugger;
            setCategories(result.data.map(cat => {
                return {label: cat.name, value: cat.id}
            }));
        }

        setIsLoading(false)
    }

    const handleCreate = async (values) => {
        setIsSubmitting(true)
        const result = await catalogApiPostService({ ...values })
        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Serviço criado com sucesso!
                </Notification>
            )
            load();
            onClose();
        } else {
            toast.push(
                <Notification type="danger" title="Falha na Criação">
                    Falha na criação do serviço. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }
        setIsSubmitting(false)
    }

    const handleUpdate = async (values) => {
        setIsSubmitting(true)
        const result = await catalogApiPutService(values.publicId, values)
        if (result?.data) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Serviço atualizado com sucesso!
                </Notification>
            )
            load();
            onClose();
        } else {
            toast.push(
                <Notification type="danger" title="Falha na Atualização">
                    Falha na atualização do serviço. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }
        setIsSubmitting(false)
    }

    useEffect(() => {
        getServiceCategories();
    }, [])

    return (
        <Loading loading={isLoading}>
            <Formik
                initialValues={data || {}}
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
                                    {!data ? 'Cadastrar' : 'Editar'} Serviço
                                </h3>

                                <div className="flex gap-4 w-full mt-4">
                                    <div className='mt-2 w-5/10'>
                                        <FormItem
                                            label="Nome do Serviço"
                                            asterisk
                                            invalid={errors.name && touched.name}
                                            errorMessage={errors.name}
                                        >
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Nome do Serviço"
                                                component={Input}
                                            />
                                        </FormItem>

                                        <div className="flex items-center gap-2 justify-between">
                                            <div className="w-1/3">
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

                                            <div className="w-2/3">
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
                                                        placeholder="Descrição do Serviço"
                                                        onChange={(e) => {
                                                            form.setFieldValue(field.name, e?.target?.value)
                                                        }}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className="h-auto border-1 border-gray-800" />

                                    <div className="flex flex-col w-5/10">
                                        <span className="font-semibold text-base flex items-center gap-1">
                                            Catálogos
                                            {/* <Button shape="circle" className="w-[20px] h-[20px]" variant="solid" icon={<HiOutlinePlus size={14} />} /> */}
                                        </span>

                                        <div>
                                            {catalogs?.length == 0 && <span className="p-2 rounded-lg">Nenhum Catálogo Vinculado</span>}
                                            {catalogs?.map(catalog => (
                                                <div key={catalog.id} className="mt-2">
                                                    <div className="items-center flex justify-between w-full">
                                                        <div className="flex items-center">
                                                            <Checkbox defaultChecked={true} disabled={true} />
                                                            {catalog.name}
                                                        </div>

                                                        <div>
                                                            <FormNumericInput size='xs' className='w-[120px] ml-2' defaultValue={560} />
                                                        </div>

                                                        {/* <MoneyValue className='ml-2 text-emerald-600 text-sm font-semibold' value={560}/> */}
                                                    </div>
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

export default ServiceUpsert;
