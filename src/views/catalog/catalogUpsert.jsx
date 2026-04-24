import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState } from 'react'
import { HiOutlineCheckCircle } from 'react-icons/hi'
import { Button, Input, Notification, toast } from '../../components/ui'
import { FormContainer, FormItem } from '@/components/ui/Form'
import { Loading } from '../../components/shared'
import DatePickerInputtable from '../../components/ui/DatePicker/DatePickerInputtable'
import { catalogApiPostCatalogs, catalogApiPutCatalogs } from '../../api/catalog/catalogService'

const isEdit = (data) => !!data?.publicId

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Campo obrigatório'),
})

const CatalogUpsert = ({ data, onClose, load }) => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const initialValues = {
        publicId:    data?.publicId    ?? null,
        name:        data?.name        ?? '',
        description: data?.description ?? '',
        validFrom:   data?.validFrom   ?? null,
        validTo:     data?.validTo     ?? null,
    }

    const handleSubmit = async (values) => {
        setIsSubmitting(true)

        const result = isEdit(data)
            ? await catalogApiPutCatalogs(values.publicId, values)
            : await catalogApiPostCatalogs(values)

        if (result) {
            toast.push(
                <Notification type='success' title={isEdit(data) ? 'Atualizado' : 'Criado'}>
                    Catálogo {isEdit(data) ? 'atualizado' : 'criado'} com sucesso!
                </Notification>
            )
            load()
            onClose()
        }

        setIsSubmitting(false)
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, touched, errors }) => (
                <Form>
                    <FormContainer>
                        <Loading loading={isSubmitting}>
                            <h5 className='font-semibold text-gray-700 text-center mb-4'>
                                {isEdit(data) ? 'Editar' : 'Novo'} Catálogo
                            </h5>

                            <FormItem
                                label='Nome'
                                asterisk
                                invalid={errors.name && touched.name}
                                errorMessage={errors.name}
                            >
                                <Field
                                    type='text'
                                    name='name'
                                    placeholder='Nome do catálogo'
                                    component={Input}
                                />
                            </FormItem>

                            <FormItem
                                label='Descrição'
                                invalid={errors.description && touched.description}
                                errorMessage={errors.description}
                            >
                                <Field name='description'>
                                    {({ field }) => (
                                        <Input
                                            textArea
                                            placeholder='Descrição'
                                            {...field}
                                        />
                                    )}
                                </Field>
                            </FormItem>

                            <div className='flex items-start gap-4'>
                                <FormItem
                                    className='flex-1'
                                    label='Válido de'
                                    invalid={errors.validFrom && touched.validFrom}
                                    errorMessage={errors.validFrom}
                                >
                                    <Field name='validFrom'>
                                        {({ field, form }) => (
                                            <DatePickerInputtable
                                                placeholder='Data início'
                                                name='validFrom'
                                                field={field}
                                                form={form}
                                                value={values.validFrom}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    className='flex-1'
                                    label='Válido até'
                                    invalid={errors.validTo && touched.validTo}
                                    errorMessage={errors.validTo}
                                >
                                    <Field name='validTo'>
                                        {({ field, form }) => (
                                            <DatePickerInputtable
                                                placeholder='Data fim'
                                                name='validTo'
                                                field={field}
                                                form={form}
                                                value={values.validTo}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </div>

                            <div className='flex items-center justify-center gap-2 mt-2'>
                                <Button type='button' onClick={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    type='submit'
                                    variant='solid'
                                    icon={<HiOutlineCheckCircle />}
                                    className={isEdit(data)
                                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-500'
                                        : 'bg-violet-600 hover:bg-violet-700 border-violet-600'
                                    }
                                    loading={isSubmitting}
                                >
                                    {isEdit(data) ? 'Atualizar' : 'Criar'}
                                </Button>
                            </div>
                        </Loading>
                    </FormContainer>
                </Form>
            )}
        </Formik>
    )
}

export default CatalogUpsert
