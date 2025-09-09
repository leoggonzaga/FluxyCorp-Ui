import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle } from "react-icons/hi"
import { Button, Input } from '../../components/ui';
import * as Yup from 'yup'
import { useState } from 'react';
import { Loading } from '../../components/shared';
import DatePickerInputtable from '../../components/ui/DatePicker/DatePickerInputtable';
import { catalogApiPostCatalogs, catalogApiPutCatalogs } from '../../api/catalog/catalogService';


const CatalogUpsert = ({ data, onClose, load }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const validationSchema = Yup.object().shape({
        name: Yup.string().required('Campo Obrigatório'),
    })

    const handleCreate = async (values) => {
        debugger;
        setIsSubmitting(true)

        const result = await catalogApiPostCatalogs(values)

        if (!result) {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao criar catálogo. Verifique a validade dos campos e tente novamente, mais tarde.
                </Notification>
            )
        }

        onClose();
        load();
        setIsSubmitting(false);
    }

    const handleUpdate = async (values) => {
        debugger;
        setIsSubmitting(true)

        const result = await catalogApiPutCatalogs(values)

        if (!result) {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha ao atualizar catálogo. Verifique a validade dos campos e tente novamente, mais tarde.
                </Notification>
            )
        }

        onClose();
        load();
        setIsSubmitting(false);
    }

    return (
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
                        <Loading loading={isSubmitting}>
                            <h3 className='flex justify-center mt-2'>
                                {!data ? 'Cadastrar' : 'Editar'} Catálogo
                            </h3>

                            <div className='mt-2'>
                                <FormItem
                                    label="Nome"
                                    asterisk
                                    invalid={errors.name && touched.name}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Nome"
                                        component={Input}
                                    />
                                </FormItem>

                                <div className='flex items-center gap-4'>
                                    <div className='flex w-1/2'>
                                        <FormItem
                                            label='Válido De:'
                                            invalid={errors.validFrom && touched.validFrom}
                                            errorMessage={errors.validFrom}
                                        >
                                            <Field name="validFrom">
                                                {({ field, form }) => (
                                                    <DatePickerInputtable
                                                        placeholder='Início'
                                                        name='validFrom'
                                                        field={field}
                                                        form={form}
                                                        value={values.validFrom}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='flex w-1/2'>
                                        <FormItem
                                            label='Válido Até:'
                                            invalid={errors.validTo && touched.validTo}
                                            errorMessage={errors.validTo}
                                        >
                                            <Field name="validTo">
                                                {({ field, form }) => (
                                                    <DatePickerInputtable
                                                        placeholder='Fim'
                                                        name='validTo'
                                                        field={field}
                                                        form={form}
                                                        value={values.validTo}
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
                                                placeholder='Descrição'
                                                name='description'
                                                field={field}
                                                form={form}
                                                textArea
                                                value={values.description}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
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
                                    type='submit'
                                >
                                    Salvar
                                </Button>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default CatalogUpsert;