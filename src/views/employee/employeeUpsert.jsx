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

    const sexTypeOptions = [
        { value: 1, label: 'Masculino' },
        { value: 2, label: 'Feminino' },
        { value: 3, label: 'Outro' },
    ]

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
                    return { value: item.genderId, label: item.name }
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
        motherName: Yup.string().required('Campo Obrigatório'),
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
                    <FormContainer className='min-h-[300px] flex flex-col justify-center text-gray-700 bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-2xl mx-auto'>
                        <Loading loading={loading}>
                            <h3 className='flex justify-center mt-2 text-2xl font-bold text-primary mb-6'>
                                {!data ? 'Cadastrar' : 'Editar'} Funcionário
                            </h3>

                            <div className='mt-2 space-y-6'>
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
                                        className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
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
                                                className="rounded-lg border-gray-300 focus:border-primary focus:ring-primary shadow-sm"
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
                                            invalid={errors.sexyType && touched.sexyType}
                                            errorMessage={errors.sexyType?.label || errors.sexyType}
                                        >
                                            <Field name="sexyType">
                                                {({ field, form }) => (
                                                    <Select
                                                        placeholder='Sexo Biológico'
                                                        options={sexTypeOptions}
                                                        value={sexTypeOptions.find((option) => option.value === field.value) || null}
                                                        onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label='Gênero'
                                            asterisk
                                            invalid={errors.genderId && touched.genderId}
                                            errorMessage={errors.genderId?.label || errors.genderId}
                                        >
                                            <Field name="genderId">
                                                {({ field, form }) => (
                                                    <Select
                                                        placeholder='Gênero'
                                                        options={genders}
                                                        value={genders.find((option) => option.value === field.value) || null}
                                                        onChange={(option) => {
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
                                                        value={jobTitles.find((option) => option.value === field.value) || null}
                                                        onChange={(option) => form.setFieldValue(field.name, option.value)}
                                                        onBlur={() => form.setFieldTouched(field.name, true)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <FormItem
                                        label="Nome Social"
                                        invalid={errors.socialName && touched.socialName}
                                        errorMessage={errors.socialName}
                                    >
                                        <Field type="text" name="socialName" placeholder="Nome Social" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Apelido"
                                        invalid={errors.nickname && touched.nickname}
                                        errorMessage={errors.nickname}
                                    >
                                        <Field type="text" name="nickname" placeholder="Apelido" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Nome da Mãe"
                                        asterisk
                                        invalid={errors.motherName && touched.motherName}
                                        errorMessage={errors.motherName}
                                    >
                                        <Field type="text" name="motherName" placeholder="Nome da Mãe" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Data de Nascimento"
                                        invalid={errors.birthDate && touched.birthDate}
                                        errorMessage={errors.birthDate}
                                    >
                                        <Field type="date" name="birthDate" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Raça (Id)"
                                        invalid={errors.raceId && touched.raceId}
                                        errorMessage={errors.raceId}
                                    >
                                        <Field type="number" name="raceId" placeholder="Raça Id" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Nacionalidade"
                                        invalid={errors.nationality && touched.nationality}
                                        errorMessage={errors.nationality}
                                    >
                                        <Field type="text" name="nationality" placeholder="Nacionalidade" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Cidade Natal"
                                        invalid={errors.hometown && touched.hometown}
                                        errorMessage={errors.hometown}
                                    >
                                        <Field type="text" name="hometown" placeholder="Cidade Natal" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="País Natal"
                                        invalid={errors.homeCountry && touched.homeCountry}
                                        errorMessage={errors.homeCountry}
                                    >
                                        <Field type="text" name="homeCountry" placeholder="País Natal" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Data de Naturalização"
                                        invalid={errors.naturalizationDate && touched.naturalizationDate}
                                        errorMessage={errors.naturalizationDate}
                                    >
                                        <Field type="date" name="naturalizationDate" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="RG"
                                        invalid={errors.nationalDocumentNumberSec && touched.nationalDocumentNumberSec}
                                        errorMessage={errors.nationalDocumentNumberSec}
                                    >
                                        <Field type="text" name="nationalDocumentNumberSec" placeholder="RG" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="RG - Órgão Emissor"
                                        invalid={errors.nationalIdDepartment && touched.nationalIdDepartment}
                                        errorMessage={errors.nationalIdDepartment}
                                    >
                                        <Field type="text" name="nationalIdDepartment" placeholder="Órgão Emissor" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="RG - UF"
                                        invalid={errors.nationalIdUF && touched.nationalIdUF}
                                        errorMessage={errors.nationalIdUF}
                                    >
                                        <Field type="text" name="nationalIdUF" placeholder="UF" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="RG - Data de Emissão"
                                        invalid={errors.nationalIdDate && touched.nationalIdDate}
                                        errorMessage={errors.nationalIdDate}
                                    >
                                        <Field type="date" name="nationalIdDate" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="CNS"
                                        invalid={errors.cns && touched.cns}
                                        errorMessage={errors.cns}
                                    >
                                        <Field type="text" name="cns" placeholder="Cartão Nacional de Saúde" component={Input} />
                                    </FormItem>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <FormItem
                                        label="Passaporte"
                                        invalid={errors.passportNumber && touched.passportNumber}
                                        errorMessage={errors.passportNumber}
                                    >
                                        <Field type="text" name="passportNumber" placeholder="Número do Passaporte" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="País Emissor do Passaporte"
                                        invalid={errors.passportIssuingCountry && touched.passportIssuingCountry}
                                        errorMessage={errors.passportIssuingCountry}
                                    >
                                        <Field type="text" name="passportIssuingCountry" placeholder="País Emissor" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Data de Emissão do Passaporte"
                                        invalid={errors.passportIssueDate && touched.passportIssueDate}
                                        errorMessage={errors.passportIssueDate}
                                    >
                                        <Field type="date" name="passportIssueDate" component={Input} />
                                    </FormItem>

                                    <FormItem
                                        label="Data de Validade do Passaporte"
                                        invalid={errors.passportExpiryDate && touched.passportExpiryDate}
                                        errorMessage={errors.passportExpiryDate}
                                    >
                                        <Field type="date" name="passportExpiryDate" component={Input} />
                                    </FormItem>
                                </div>
                            </div>

                            <div className='flex items-center gap-4 justify-center mt-8'>
                                <Button
                                    type='button'
                                    onClick={onClose}
                                    className='px-6 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all shadow-sm font-semibold'
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant='solid'
                                    icon={<HiOutlineCheckCircle />}
                                    className='px-6 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-all shadow-md font-semibold flex items-center gap-2'
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