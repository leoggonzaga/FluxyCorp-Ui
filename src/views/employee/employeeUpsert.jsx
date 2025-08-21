import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { HiOutlineCheckCircle } from "react-icons/hi"
import { Button, Input, Notification, Select, toast, InputPhone, InputNationalDocument } from '../../components/ui';
import { enterpriseApiGetGender, enterpriseApiGetJobTitles, enterpriseApiPostEmployees } from '../../api/enterprise/EnterpriseService';
import * as Yup from 'yup'
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Loading } from '../../components/shared';


const EmployeeUpsert = ({ data, onClose, load }) => {

    const state = useSelector((state) => state)

    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [genders, setGenders] = useState([])
    const [jobTitles, setJobTitles] = useState([])

    const handleCreate = async (values) => {
        debugger;
        setIsSubmitting(true)

        const result = await enterpriseApiPostEmployees(values);

        if (result?.data) {
            toast.push(
                <Notification type='success' title='Funcionário Cadastrado'>
                    Funcionário Cadastrado com sucesso!
                </Notification>
            )

            onClose();
            load();
        }
        else {
            toast.push(
                <Notification type='danger' title='Falha'>
                    Falha na criação do Funcionário. Verifique a validade dos campos e tente novamente.
                </Notification>
            )
        }

        setIsSubmitting(false)
    }

    const handleUpdate = (values) => {
        debugger;
    }

    const getGender = async () => {
        const result = await enterpriseApiGetGender();

        if (result?.data) {
            setGenders(
                result.data.map(item => {
                    return { value: item.id, label: item.name }
                })
            )
        }
        else {
            return toast.push(
                <Notification type='danger' title='Falha'>
                    Falha na comunicação com o servidor. Por favor tente novamente mais tarde.
                </Notification>
            )
        }
    }

    const getJobTitles = async () => {
        const result = await enterpriseApiGetJobTitles(state?.auth?.user?.companyTypeId);

        if (result?.data) {
            setJobTitles(result.data.map((item) => { return { value: item.id, label: item.name } }))
        }
        else {
            return toast.push(
                <Notification type='danger' title='Falha'>
                    Falha na comunicação com o servidor. Por favor tente novamente mais tarde.
                </Notification>
            )
        }
    }

    useEffect(() => {
        setLoading(true)

        Promise.all([
            getGender(),
            getJobTitles()
        ]).then(() => setLoading(false))
    }, [])

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
                        <Loading loading={loading}>
                            <h3 className='flex justify-center mt-2'>
                                {!data ? 'Cadastrar' : 'Editar'} Funcionário
                            </h3>

                            <div className='mt-2'>
                                <FormItem
                                    label="Nome Completo"
                                    asterisk
                                    invalid={errors.fullName && touched.fullName}
                                    errorMessage={errors.fullName}
                                >
                                    <Field
                                        type="text"
                                        name="fullName"
                                        placeholder="Nome Completo"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    label='Email'
                                    asterisk
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}

                                >
                                    <Field name="email">
                                        {({ field, form }) => (
                                            <Input
                                                placeholder='Email'
                                                name='email'
                                                field={field}
                                                form={form}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <div className='flex items-center gap-4 justify-between'>
                                    <div className='w-3/6'>
                                        <FormItem
                                            label='Telefone'
                                            invalid={errors.phone && touched.phone}
                                            errorMessage={errors.phone}
                                        >
                                            <Field name="phone">
                                                {({ field, form }) => (
                                                    <InputPhone
                                                        placeholder='Telefone'
                                                        name='phone'
                                                        type='tel'
                                                        field={field}
                                                        form={form}
                                                    />
                                                    // <Input
                                                    //     placeholder='Telefone'
                                                    //     name='phone'
                                                    //     type='tel'
                                                    //     field={field}
                                                    //     form={form}
                                                    // />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label='Sexo'
                                            asterisk
                                            invalid={errors.genderId && touched.genderId}
                                            errorMessage={errors.genderId?.label || errors.genderId}
                                        >
                                            <Field name="genderId">
                                                {({ field, form }) => (
                                                    <Select
                                                        placeholder='Sexo'
                                                        options={genders}
                                                        onChange={(option) => {
                                                            debugger;
                                                            form.setFieldValue(field.name, option?.value)
                                                        }}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='w-3/6'>
                                        <FormItem
                                            label='CPF'
                                            asterisk
                                            invalid={errors.nationalDocumentNumber && touched.nationalDocumentNumber}
                                            errorMessage={errors.nationalDocumentNumber}
                                        >
                                            <Field name="nationalDocumentNumber">
                                                {({ field, form }) => (
                                                    <InputNationalDocument
                                                        placeholder='CPF'
                                                        name='nationalDocumentNumber'
                                                        field={field}
                                                        form={form}
                                                    />
                                                    // <Input
                                                    //     placeholder='CPF'
                                                    //     name='nationalDocumentNumber'
                                                    //     field={field}
                                                    //     form={form}
                                                    // />
                                                )}
                                            </Field>

                                        </FormItem>

                                        <FormItem
                                            label='Cargo'
                                            asterisk
                                            invalid={errors.jobTitleId && touched.jobTitleId}
                                            errorMessage={errors.jobTitleId?.label || errors.jobTitleId}
                                        >
                                            <Field name="jobTitleId">
                                                {({ field, form }) => (
                                                    <Select
                                                        placeholder="Cargo"
                                                        options={jobTitles}
                                                        onChange={(option) => form.setFieldValue(field.name, option.value)}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
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

export default EmployeeUpsert;