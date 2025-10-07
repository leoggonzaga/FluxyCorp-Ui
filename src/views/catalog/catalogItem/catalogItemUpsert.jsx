import { Formik, Form, Field } from "formik";
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle, HiOutlinePlus } from "react-icons/hi"
import { Button, Checkbox, Input, Select, Notification, toast, MoneyValue } from "../../../components/ui";
import * as Yup from 'yup'
import { FormNumericInput, Loading } from "../../../components/shared";
import { useState } from "react";
import { catalogApiPutCatalogItem } from "../../../api/catalog/catalogService";
import { useParams } from "react-router-dom";


const CatalogItemUpsert = ({ data, onClose }) => {
    debugger;
    const { id } = useParams();

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleUpdate = async (values) => {
        var param = {
            [values.itemType + 'Id']: values[values.itemType + 'Id'],
            price: values.price,
            catalogId: id
        }

        const result = await catalogApiPutCatalogItem(id, param);

        if (result?.data){
            toast.push(
                <Notification title="Item de Catálogo Atualizado" type="success">
                    Item de Catálogo atualizado com sucesso!
                </Notification>
            )

            onClose();
        }
        else{
            toast.push(
                <Notification title="Falha na Atualização" type="danger">
                    Ocorreu um problema ao se conectar com o servidor. Valide os campos e tente novamente.
                </Notification>
            )
        }
    }

    const validationSchema = Yup.object().shape({
        price: Yup.number().required('Campo Obrigatório'),
    })

    return (
        <Formik
            initialValues={data?.item || {}}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                !data?.item ? handleCreate(values) : handleUpdate(values)
            }}
        >
            {({ values, touched, errors }) => (
                <Form>
                    <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700'>
                        <Loading loading={false}>
                            <h3 className='flex justify-center'>
                                {!data?.item ? 'Cadastrar' : 'Editar'} Item de Catálogo
                            </h3>

                            <div className="mt-4">
                                <div className='mt-2'>
                                    <FormItem
                                        label="Nome do Serviço"
                                        asterisk
                                        invalid={errors.name && touched.name}
                                        errorMessage={errors.name}
                                    >
                                        <Field name="name">
                                            {({ field, form }) => (
                                                <Input
                                                    disabled={true}
                                                    field={field}
                                                    form={form}
                                                />
                                            )}
                                        </Field>
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
                                                            // options={categories}
                                                            isClearable
                                                            isDisabled={true}
                                                            form={form}
                                                            field={field}
                                                            onChange={option => {
                                                                form.setFieldValue(field.name, option?.value)
                                                            }}
                                                        // value={categories.find(x => x.value == values.categoryId)}
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
                                                    disabled
                                                    placeholder="Descrição do Serviço"
                                                    defaultValue={values.description}
                                                    onChange={(e) => {
                                                        form.setFieldValue(field.name, e?.target?.value)
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className='flex items-center gap-2 justify-center mt-3'>
                                    <Button type='button' onClick={onClose}>Cancelar</Button>
                                    <Button variant='solid' icon={<HiOutlineCheckCircle />} type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </div>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default CatalogItemUpsert;