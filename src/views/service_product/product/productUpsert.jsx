import { Formik, Form, Field } from "formik";
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlinePlusSm } from "react-icons/hi"
import { Button, Checkbox, Input, InputPhone, MoneyInput, Notification, Select, toast } from "../../../components/ui";
import * as Yup from 'yup'
import { FormNumericInput, Loading } from "../../../components/shared";
import { useEffect, useState } from "react";
import { catalogApiGetProductCategories, catalogApiGetProducts, catalogApiPostProduct, catalogApiPutProduct } from "../../../api/catalog/catalogService";

const ProductUpsert = ({ data, onClose, load }) => {
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const catalogs = [
        {
            id: 1,
            name: 'ortodonto 2025 uniodonto'
        },
        {
            id: 2,
            name: 'endo 2024 Uni'
        }
    ]


    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Campo Obrigatório'),
        price: Yup.number().required('Campo Obrigatório'),
        categoryId: Yup.string().required('Campo Obrigatório'),
    })

    const handleCreate = async (values) => {
        setIsSubmitting(true)

        const result = await catalogApiPostProduct({ ...values, sku: '' })

        if (result) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Produto criado com sucesso!
                </Notification>
            )
            load();
            onClose();
        }
        else {
            toast.push(
                <Notification type="danger" title="Falha na Criação">
                    Falha na criação do produto. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }

        setIsSubmitting(false)
    }

    const handleUpdate = async (values) => {
        setIsSubmitting(true)

        const result = await catalogApiPutProduct(values.publicId, values)

        if (result.data) {
            toast.push(
                <Notification type="success" title="Sucesso">
                    Produto atualizado com sucesso!
                </Notification>
            )
            load();
            onClose();
        }
        else {
            toast.push(
                <Notification type="danger" title="Falha na Criação">
                    Falha na atualização do produto. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }

        setIsSubmitting(false)
    }

    const getProductCategories = async () => {
        setIsLoading(true)

        const result = await catalogApiGetProductCategories();

        if (result?.data) {
            setCategories(result.data.map(cat => {
                return { label: cat.name, value: cat.id }
            }));
        }

        setIsLoading(false)
    }

    useEffect(() => {
        getProductCategories();
    }, [])

    return (
        <Loading loading={isLoading}>
            <Formik
                initialValues={data || {}}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                    !data ?
                        handleCreate(values)
                        :
                        handleUpdate(values)
                }}
            >
                {({ values, touched, errors, resetForm }) => (
                    <Form>
                        <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700'>
                            <Loading loading={isLoading}>
                                <h3 className='flex justify-center'>
                                    {!data ? 'Cadastrar' : 'Editar'} Produto
                                </h3>

                                <div className="flex gap-4 w-full mt-4">
                                    <div className='mt-2 w-6/10'>
                                        <FormItem
                                            label="Nome do Produto"
                                            asterisk
                                            invalid={errors.name && touched.name}
                                            errorMessage={errors.name}
                                        >
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Nome do Produto"
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
                                                        placeholder="Descrição do Produto"
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

                                        <div className="">
                                            {
                                                catalogs?.length == 0 &&
                                                <span className=" p-2 rounded-lg">Nenhum Catálogo Vinculado</span>
                                            }

                                            {
                                                catalogs?.map(catalog => {
                                                    return (
                                                        <div className="mt-2">
                                                            <span className="items-center flex">
                                                                <Checkbox defaultChecked={true} disabled={true} />
                                                                {catalog.name}
                                                            </span>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-2 justify-center mt-3'>
                                    <Button
                                        type='button'
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant='solid'
                                        icon={<HiOutlineCheckCircle />}
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
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

export default ProductUpsert;