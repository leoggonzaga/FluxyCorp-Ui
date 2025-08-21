import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle } from "react-icons/hi"
import { Button, Input, Notification, Select, toast, InputPhone, InputNationalDocument, MoneyInput, DatePicker } from '../../components/ui';
import { enterpriseApiGetGender, enterpriseApiGetJobTitles, enterpriseApiPostEmployees } from '../../api/enterprise/EnterpriseService';
import * as Yup from 'yup'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormNumericInput, Loading } from '../../components/shared';

const ReceivableUpsert = ({ onClose, data }) => {

    const [isLoading, setIsLoading] = useState(false);

    const [paymentType, setPaymentType] = useState([
        {
            label: 'Serviço Completo',
            options: [
                { value: 1, label: 'Tratamento Orto', color: '#00B8D9' },
                { value: 2, label: 'Tratamento Endo', color: '#00B8D9' },
            ],
        },
        {
            label: 'Serviço Unitário',
            options: [
                { value: 'vanilla', label: 'Avaliação', rating: 'safe' },
                { value: 'chocolate', label: 'Cárie', rating: 'good' },
                { value: 'chocolate', label: 'Cirurgia Emergencial', rating: 'good' },
            ],
        },
    ])

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Email inválido').required('Campo Obrigatório'),
        fullName: Yup.string().required('Campo Obrigatório'),
        nationalDocumentNumber: Yup.string().required('Campo Obrigatório'),
    })

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
            {({ touched, errors, resetForm }) => (
                <Form>
                    <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700'>
                        <Loading loading={isLoading}>
                            <h3 className='flex justify-center mt-2'>
                                {!data ? 'Cadastrar' : 'Editar'} Recebível
                            </h3>

                            <div className='mt-2'>
                                <FormItem
                                    label='Devedor'
                                    asterisk
                                    invalid={errors.patientId && touched.patientId}
                                    errorMessage={errors.patientId?.label || errors.patientId}
                                >
                                    <Field name="patientId">
                                        {({ field, form }) => (
                                            <Select
                                                placeholder='Devedor'
                                                options={[]}
                                                onChange={(option) => {
                                                    form.setFieldValue(field.name, option?.value)
                                                }}
                                                onBlur={() => form.setFieldTouched(field.name, true)}
                                            />
                                        )}
                                    </Field>
                                </FormItem>


                                <div className='flex items-center gap-4 justify-between'>
                                    <div className='w-1/2'>
                                        <FormItem
                                            label='Valor'
                                            asterisk
                                            invalid={errors.email && touched.email}
                                            errorMessage={errors.email}
                                        >
                                            <Field name="email">
                                                {({ field, form }) => (
                                                    <FormNumericInput
                                                        field={field}
                                                        form={form}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='w-1/2'>
                                        <FormItem
                                            label='Data Vencimento'
                                            asterisk
                                            invalid={errors.email && touched.email}
                                            errorMessage={errors.email}
                                        >
                                            <Field name="email">
                                                {({ field, form }) => (
                                                    <DatePicker
                                                        placeholder='Data Vencimento'
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </div>

                                <FormItem
                                    label='Tipo de Conta'
                                    asterisk
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field name="email">
                                        {({ field, form }) => (
                                            <Select
                                                placeholder='Tipo de Conta'
                                                options={paymentType}
                                            />
                                        )}
                                    </Field>
                                </FormItem>

                                <FormItem
                                    label='Observações'
                                    asterisk
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field name="email">
                                        {({ field, form }) => (
                                            <Input
                                                placeholder="Observações"
                                                textArea
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

export default ReceivableUpsert;