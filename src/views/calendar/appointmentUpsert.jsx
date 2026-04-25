import { Formik, Field, Form } from 'formik'
import { FormItem, FormContainer } from '@/components/ui/Form'
import {
    HiOutlineBan,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineTrash,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineRefresh,
    HiOutlineX,
} from 'react-icons/hi'
import dayjs from 'dayjs'
import { Button, Input, Notification, Select, toast, InputPhone, Avatar } from '../../components/ui'
import * as Yup from 'yup'
import DatePickerInputtable from '../../components/ui/DatePicker/DatePickerInputtable'
import TimeInputRange from '../../components/ui/TimeInput/TimeInputRange'
import { components } from 'react-select'
import Loading from '../../components/shared/Loading'
import ConsumerSearchInput from '@/components/shared/ConsumerSearchInput'
import { enterpriseApiGetEmployees, roomsGetAll } from '../../api/enterprise/EnterpriseService'
import { useEffect, useState } from 'react'
import { consultationTypeApiGetTypes } from '../../api/consultation/consultationService'
import {
    appointmentApiCreateService,
    appointmentApiEditService,
    appointmentApiConfirm,
    appointmentApiCancel,
    appointmentApiDelete,
} from '../../api/appointment/appointmentService'
import {
    patientReturnGetByPatient,
    patientReturnSchedule,
} from '../../api/consultation/consultationService'

const { Control } = components

const RETURN_TYPE_LABELS = {
    0: 'Pós-operatório',    1: 'Canal (continuação)',  2: 'Revisão de Aparelho',
    3: 'Profilaxia',         4: 'Avaliação Implante',   5: 'Clareamento',
    6: 'Trat. Pendente',     7: 'Manutenção',
}

const CustomControl = ({ children, ...props }) => (
    <Control {...props}>
        <Avatar className='ltr:ml-4 rtl:mr-4' shape='circle' size={25} icon={<HiOutlineUser size={15} />} />
        {children}
    </Control>
)

const getInitialValues = (data) => {
    if (!data) return {}
    const timeRange = data.start && data.end
        ? [new Date(data.start), new Date(data.end)]
        : [null, null]
    return { ...data, timeRange }
}

const validationSchema = Yup.object().shape({
    consumerName: Yup.string().required('Paciente é obrigatório'),
    start: Yup.mixed().required('Data é obrigatória'),
    timeRange: Yup.mixed().required('Horário é obrigatório'),
    roomPublicId: Yup.mixed().required('Sala é obrigatória').test('not-empty', 'Sala é obrigatória', v => v != null && v !== ''),
    consultationTypePublicId: Yup.mixed().required('Tipo de atendimento é obrigatório').test('not-empty', 'Tipo de atendimento é obrigatório', v => v != null && v !== ''),
    employeePublicId: Yup.mixed().required('Profissional é obrigatório').test('not-empty', 'Profissional é obrigatório', v => v != null && v !== ''),
})

const buildScheduledTimes = (values) => {
    const [tStart, tEnd] = Array.isArray(values.timeRange) ? values.timeRange : [null, null]
    const baseDate = dayjs(values.start)
    if (!baseDate.isValid()) throw new Error('Data inválida')

    if (tStart instanceof Date && tEnd instanceof Date) {
        return {
            scheduledAt:  baseDate.hour(tStart.getHours()).minute(tStart.getMinutes()).second(0).millisecond(0).toISOString(),
            scheduledEnd: baseDate.hour(tEnd.getHours()).minute(tEnd.getMinutes()).second(0).millisecond(0).toISOString(),
        }
    }

    const endDate = values.end ? dayjs(values.end) : baseDate.add(1, 'hour')
    return {
        scheduledAt:  baseDate.startOf('minute').toISOString(),
        scheduledEnd: endDate.startOf('minute').toISOString(),
    }
}

const AppointmentUpsert = ({ data, onClose, onRefresh }) => {
    const isEdit = !!data?.publicId

    const [isLoading, setIsLoading]     = useState(false)
    const [phoneKey, setPhoneKey]       = useState(0)
    const [employees, setEmployees]     = useState([])
    const [consultationTypes, setConsultationTypes] = useState([])
    const [rooms, setRooms]             = useState([])

    // Return link state
    const [currentPatientId, setCurrentPatientId]   = useState(data?.consumerPublicId ?? null)
    const [patientReturns, setPatientReturns]       = useState([])
    const [loadingReturns, setLoadingReturns]       = useState(false)
    const [selectedReturn, setSelectedReturn]       = useState(null)

    const getEmployees = async () => {
        const result = await enterpriseApiGetEmployees()
        if (result?.data)
            setEmployees(result.data.map(x => ({ label: x.fullName, value: x.publicId })))
    }

    const getConsultationTypes = async () => {
        const result = await consultationTypeApiGetTypes()
        const list = Array.isArray(result) ? result : result?.data
        if (Array.isArray(list))
            setConsultationTypes(list.map(x => ({ label: x.name, value: x.publicId })))
    }

    const getRooms = async () => {
        const result = await roomsGetAll()
        const list = Array.isArray(result) ? result : result?.data
        if (Array.isArray(list))
            setRooms(list.filter(x => x.isAvailable).map(x => ({ label: x.name, value: x.publicId })))
    }

    useEffect(() => {
        setIsLoading(true)
        Promise.all([getEmployees(), getConsultationTypes(), getRooms()])
            .finally(() => setIsLoading(false))
    }, [])

    // Load pending returns when patient changes
    useEffect(() => {
        if (!currentPatientId) { setPatientReturns([]); setSelectedReturn(null); return }
        setLoadingReturns(true)
        patientReturnGetByPatient(currentPatientId)
            .then(res => {
                const list = Array.isArray(res) ? res : (res?.data ?? [])
                const linkedId = data?.returnPublicId
                // Show: Pending (0), Scheduled without link (1), or already linked to THIS appointment
                setPatientReturns(list.filter(r =>
                    r.status === 0 ||
                    (r.status === 1 && !r.appointmentPublicId) ||
                    (linkedId && r.publicId === linkedId)
                ))
                // Pre-select the already-linked return when editing
                if (linkedId && !selectedReturn) {
                    const linked = list.find(r => r.publicId === linkedId)
                    if (linked) setSelectedReturn(linked)
                }
            })
            .catch(() => setPatientReturns([]))
            .finally(() => setLoadingReturns(false))
    }, [currentPatientId]) // eslint-disable-line react-hooks/exhaustive-deps

    const showToast = (title, type) =>
        toast.push(<Notification title={title} type={type} />, { placement: 'top-center' })

    const linkReturnToAppointment = async (appointmentPublicId, scheduledAt, employeeName) => {
        if (!selectedReturn) return
        try {
            await patientReturnSchedule(selectedReturn.publicId, {
                returnDate:                 scheduledAt,
                appointmentPublicId:        appointmentPublicId,
                appointmentScheduledAt:     scheduledAt,
                appointmentProfessionalName: employeeName,
            })
        } catch {
            // Link failure is non-blocking — appointment was saved
            toast.push(
                <Notification title='Agendamento salvo, mas falha ao vincular retorno' type='warning' />,
                { placement: 'top-center' }
            )
        }
    }

    const handleCreate = async (values) => {
        try {
            setIsLoading(true)
            const employee    = employees.find(e => e.value === values.employeePublicId)
            const room        = rooms.find(r => r.value === values.roomPublicId)
            const consultType = consultationTypes.find(c => c.value === values.consultationTypePublicId)
            const { scheduledAt, scheduledEnd } = buildScheduledTimes(values)

            const dto = {
                employeePublicId:          values.employeePublicId,
                employeeName:              employee?.label ?? '',
                consumerPublicId:          values.consumerPublicId ?? null,
                consumerName:              values.consumerName ?? '',
                consumerEmail:             values.email ?? '',
                consumerPhone:             (values.customerPhone ?? '').replace(/\D/g, ''),
                roomPublicId:              values.roomPublicId,
                roomName:                  room?.label ?? '',
                scheduledAt,
                scheduledEnd,
                note:                      values.note ?? null,
                consultationTypePublicId:  values.consultationTypePublicId,
                consultationType:          consultType?.label ?? '',
                returnPublicId:            selectedReturn?.publicId ?? null,
            }

            const result = await appointmentApiCreateService(dto)
            if (result === null) return

            showToast('Agendamento criado com sucesso!', 'success')
            onRefresh?.()
            onClose?.()
        } catch (e) {
            console.error('[handleCreate]', e)
            showToast('Erro ao criar agendamento', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async (values) => {
        try {
            setIsLoading(true)
            const employee    = employees.find(e => e.value === values.employeePublicId)
            const room        = rooms.find(r => r.value === values.roomPublicId)
            const consultType = consultationTypes.find(c => c.value === values.consultationTypePublicId)
            const { scheduledAt, scheduledEnd } = buildScheduledTimes(values)

            const dto = {
                publicId:                  data.publicId,
                employeePublicId:          values.employeePublicId,
                employeeName:              employee?.label ?? '',
                consumerPublicId:          values.consumerPublicId ?? null,
                consumerName:              values.consumerName ?? '',
                consumerEmail:             values.email ?? '',
                consumerCellPhone:         (values.customerPhone ?? '').replace(/\D/g, ''),
                roomPublicId:              values.roomPublicId,
                roomName:                  room?.label ?? '',
                scheduledAt,
                scheduledEnd,
                note:                      values.note ?? null,
                consultationTypePublicId:  values.consultationTypePublicId,
                consultationType:          consultType?.label ?? '',
                returnPublicId:            selectedReturn?.publicId ?? data.returnPublicId ?? null,
            }

            const result = await appointmentApiEditService(data.publicId, dto)
            if (result === null) return

            showToast('Agendamento atualizado!', 'success')
            onRefresh?.()
            onClose?.()
        } catch (e) {
            console.error('[handleUpdate]', e)
            showToast('Erro ao atualizar agendamento', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConfirm = async () => {
        try {
            setIsLoading(true)
            await appointmentApiConfirm(data.publicId)
            showToast('Agendamento confirmado!', 'success')
            onRefresh?.()
            onClose?.()
        } catch {
            showToast('Erro ao confirmar agendamento', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async () => {
        try {
            setIsLoading(true)
            await appointmentApiCancel(data.publicId)
            showToast('Agendamento desmarcado!', 'success')
            onRefresh?.()
            onClose?.()
        } catch {
            showToast('Erro ao desmarcar agendamento', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setIsLoading(true)
            await appointmentApiDelete(data.publicId)
            showToast('Agendamento removido!', 'success')
            onRefresh?.()
            onClose?.()
        } catch {
            showToast('Erro ao remover agendamento', 'danger')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Loading loading={isLoading}>
                <div className='flex w-full justify-center'>
                    <h3>{isEdit ? 'Editar' : 'Cadastrar'} Agendamento</h3>
                </div>

                {data?.timeRange && (
                    <div className='flex items-center gap-2 px-3 py-2 mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40'>
                        <HiOutlineCalendar className='w-4 h-4 text-indigo-500 shrink-0' />
                        <span className='text-xs text-indigo-700 dark:text-indigo-300'>
                            Horário selecionado:{' '}
                            <strong>
                                {dayjs(data.start).format('DD/MM/YYYY')}
                                {' · '}
                                {dayjs(data.start).format('HH:mm')}
                                {' – '}
                                {dayjs(data.end).format('HH:mm')}
                            </strong>
                        </span>
                    </div>
                )}

                <Formik
                    enableReinitialize
                    initialValues={getInitialValues(data) || {}}
                    validationSchema={validationSchema}
                    onSubmit={(values) => isEdit ? handleUpdate(values) : handleCreate(values)}
                >
                    {({ values, touched, errors }) => (
                        <Form>
                            <FormContainer>
                                <div className='mt-4'>
                                    <FormItem
                                        label='Paciente'
                                        asterisk
                                        invalid={errors.consumerName && touched.consumerName}
                                        errorMessage={errors.consumerName}
                                    >
                                        <Field name='consumerName'>
                                            {({ field, form }) => (
                                                <ConsumerSearchInput
                                                    value={field.value || ''}
                                                    onChange={(term) => {
                                                        form.setFieldValue(field.name, term)
                                                        if (!term) { setCurrentPatientId(null); setSelectedReturn(null) }
                                                    }}
                                                    onSelect={(consumer) => {
                                                        form.setFieldValue('consumerPublicId', consumer.publicId ?? null)
                                                        form.setFieldValue('consumerName', consumer.socialName || consumer.name)
                                                        form.setFieldValue('email', consumer.email || '')
                                                        form.setFieldValue('customerPhone', consumer.phoneNumber || '')
                                                        setPhoneKey(k => k + 1)
                                                        setCurrentPatientId(consumer.publicId ?? null)
                                                        setSelectedReturn(null)
                                                    }}
                                                    allowFreeText
                                                    placeholder='Buscar por nome, nome social ou CPF…'
                                                    className='w-full'
                                                />
                                            )}
                                        </Field>
                                    </FormItem>

                                    <div className='flex items-center justify-between'>
                                        <FormItem
                                            label='Email'
                                            invalid={errors.email && touched.email}
                                            errorMessage={errors.email}
                                        >
                                            <Field name='email'>
                                                {({ field }) => (
                                                    <Input {...field} placeholder='Email' className='w-[380px]' />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label='Telefone'
                                            invalid={errors.customerPhone && touched.customerPhone}
                                            errorMessage={errors.customerPhone}
                                        >
                                            <Field name='customerPhone'>
                                                {({ field, form }) => (
                                                    <InputPhone
                                                        key={phoneKey}
                                                        field={field}
                                                        form={form}
                                                        mask='(00) 00000-0000'
                                                        className='w-[190px]'
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <FormItem
                                            asterisk
                                            label='Data'
                                            invalid={errors.start && touched.start}
                                            errorMessage={errors.start}
                                        >
                                            <Field name='start'>
                                                {({ field, form }) => (
                                                    <DatePickerInputtable
                                                        inputtable
                                                        defaultValue={values?.start}
                                                        placeholder='Data'
                                                        name='start'
                                                        field={field}
                                                        form={form}
                                                        onChange={(value) => form.setFieldValue(field.name, value)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            asterisk
                                            label='Horário'
                                            invalid={errors.timeRange && touched.timeRange}
                                            errorMessage={errors.timeRange}
                                        >
                                            <Field name='timeRange'>
                                                {({ field, form }) => (
                                                    <TimeInputRange
                                                        suffix={null}
                                                        prefix={null}
                                                        defaultValue={values?.timeRange}
                                                        field={field}
                                                        form={form}
                                                        onChange={(value) => form.setFieldValue(field.name, value)}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            label='Sala'
                                            asterisk
                                            invalid={errors.roomPublicId && touched.roomPublicId}
                                            errorMessage={errors.roomPublicId}
                                        >
                                            <Field name='roomPublicId'>
                                                {({ field, form }) => (
                                                    <Select
                                                        options={rooms}
                                                        placeholder='Sala'
                                                        className='w-[180px]'
                                                        size='lg'
                                                        onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
                                                        defaultValue={values?.roomPublicId ? rooms.find(x => x.value === values.roomPublicId) : null}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <FormItem
                                            asterisk
                                            label='Tipo de Atendimento'
                                            invalid={errors.consultationTypePublicId && touched.consultationTypePublicId}
                                            errorMessage={errors.consultationTypePublicId}
                                            className='w-full'
                                        >
                                            <Field name='consultationTypePublicId'>
                                                {({ field, form }) => (
                                                    <Select
                                                        options={consultationTypes}
                                                        placeholder='Tipo de Atendimento'
                                                        onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
                                                        defaultValue={values?.consultationTypePublicId ? consultationTypes.find(x => x.value === values.consultationTypePublicId) : null}
                                                        className='w-[290px]'
                                                        size='lg'
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            asterisk
                                            label='Profissional'
                                            invalid={errors.employeePublicId && touched.employeePublicId}
                                            errorMessage={errors.employeePublicId}
                                            className='w-full'
                                        >
                                            <Field name='employeePublicId'>
                                                {({ field, form }) => (
                                                    <Select
                                                        options={employees}
                                                        placeholder='Selecione o Profissional'
                                                        onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
                                                        defaultValue={values?.employeePublicId ? employees.find(x => x.value === values.employeePublicId) : null}
                                                        className='w-[280px]'
                                                        size='lg'
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>

                                    <FormItem
                                        label='Observações'
                                        invalid={errors.note && touched.note}
                                        errorMessage={errors.note}
                                    >
                                        <Field name='note'>
                                            {({ field }) => (
                                                <Input textArea {...field} placeholder='Observações' />
                                            )}
                                        </Field>
                                    </FormItem>

                                    {/* ── Retorno pendente ────────────────────────────── */}
                                    {currentPatientId && (
                                        <div className='mt-1 mb-2'>
                                            <div className='flex items-center gap-1.5 mb-2'>
                                                <HiOutlineRefresh className='w-3.5 h-3.5 text-violet-500' />
                                                <span className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                                                    Vincular Retorno Pendente
                                                </span>
                                            </div>

                                            {loadingReturns ? (
                                                <div className='flex items-center gap-2 text-xs text-gray-400 py-2'>
                                                    <div className='w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin' />
                                                    Buscando retornos…
                                                </div>
                                            ) : patientReturns.length === 0 ? (
                                                <p className='text-xs text-gray-400 py-1.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50'>
                                                    Nenhum retorno pendente encontrado para este paciente.
                                                </p>
                                            ) : selectedReturn ? (
                                                <div className='flex items-center justify-between px-3 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700/50'>
                                                    <div className='flex items-center gap-2 min-w-0'>
                                                        <HiOutlineRefresh className='w-3.5 h-3.5 text-violet-500 flex-shrink-0' />
                                                        <div className='min-w-0'>
                                                            <p className='text-xs font-semibold text-violet-700 dark:text-violet-300 truncate'>
                                                                {RETURN_TYPE_LABELS[selectedReturn.type] ?? 'Retorno'}
                                                            </p>
                                                            <p className='text-[11px] text-violet-500 dark:text-violet-400'>
                                                                Previsto: {new Date(selectedReturn.returnDate).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type='button'
                                                        onClick={() => setSelectedReturn(null)}
                                                        title='Remover vínculo'
                                                        className='p-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-400 hover:text-violet-600 transition flex-shrink-0 ml-2'
                                                    >
                                                        <HiOutlineX className='w-3.5 h-3.5' />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className='max-h-36 overflow-y-auto space-y-1.5 rounded-xl border border-gray-100 dark:border-gray-700/50 p-1.5'>
                                                    {patientReturns.map(r => (
                                                        <button
                                                            key={r.publicId}
                                                            type='button'
                                                            onClick={() => setSelectedReturn(r)}
                                                            className='w-full flex items-center justify-between px-3 py-2 rounded-lg border border-transparent hover:border-violet-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition text-left group'
                                                        >
                                                            <div className='min-w-0 flex-1'>
                                                                <p className='text-xs font-medium text-gray-700 dark:text-gray-200 truncate'>
                                                                    {RETURN_TYPE_LABELS[r.type] ?? 'Retorno'}
                                                                </p>
                                                                <p className='text-[11px] text-gray-400 truncate'>
                                                                    Previsto: {new Date(r.returnDate).toLocaleDateString('pt-BR')}
                                                                    {r.professionalName ? ` · ${r.professionalName}` : ''}
                                                                    {r.lastProcedure ? ` · ${r.lastProcedure}` : ''}
                                                                </p>
                                                            </div>
                                                            <div className='flex items-center gap-1.5 flex-shrink-0 ml-2'>
                                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.status === 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>
                                                                    {r.status === 0 ? 'Pendente' : 'Agendado'}
                                                                </span>
                                                                <span className='text-violet-400 opacity-0 group-hover:opacity-100 transition text-[10px] font-medium'>
                                                                    vincular
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className='flex items-center gap-2 justify-between mt-3'>
                                    <div className='flex items-center gap-2'>
                                        {isEdit && (
                                            <>
                                                <Button
                                                    type='button'
                                                    variant='twoTone'
                                                    icon={<HiOutlineCheckCircle />}
                                                    size='sm'
                                                    color='emerald-500'
                                                    onClick={handleConfirm}
                                                >
                                                    Confirmar
                                                </Button>

                                                <Button
                                                    type='button'
                                                    variant='twoTone'
                                                    icon={<HiOutlineBan />}
                                                    size='sm'
                                                    color='orange-500'
                                                    onClick={handleCancel}
                                                >
                                                    Desmarcar
                                                </Button>

                                                <Button
                                                    type='button'
                                                    variant='twoTone'
                                                    icon={<HiOutlineTrash />}
                                                    size='sm'
                                                    color='red-500'
                                                    onClick={handleDelete}
                                                >
                                                    Excluir
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    <Button
                                        type='submit'
                                        variant='solid'
                                        icon={<HiOutlineCheckCircle />}
                                        size='sm'
                                    >
                                        Salvar
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Loading>
        </div>
    )
}

export default AppointmentUpsert
