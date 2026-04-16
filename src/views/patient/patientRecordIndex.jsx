import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Badge, Tabs, Notification, toast } from '@/components/ui'
import {
    HiOutlineSearch,
    HiOutlineCurrencyDollar,
    HiOutlineClipboardList,
    HiOutlinePlay,
    HiOutlinePrinter,
    HiOutlineCalendar,
    HiOutlineClock,
    HiOutlineExclamation,
    HiOutlinePhone,
    HiOutlineMail,
    HiOutlineLocationMarker,
    HiOutlineIdentification,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlinePlus,
} from 'react-icons/hi'

// ─── Mock data ───────────────────────────────────────────────────────────────

const PATIENTS = [
    {
        id: 1,
        name: 'João Silva',
        birthDate: '1985-03-15',
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        email: 'joao.silva@email.com',
        address: 'Rua das Flores, 123 - São Paulo/SP',
        bloodType: 'A+',
        allergies: ['Penicilina', 'Ibuprofeno'],
        insurance: 'Unimed',
        insuranceNumber: '123456',
        financial: {
            balance: -320.0,
            history: [
                { id: 1, date: '2026-04-01', description: 'Consulta Geral', value: -150.0, status: 'paid' },
                { id: 2, date: '2026-03-15', description: 'Limpeza Dental', value: -200.0, status: 'paid' },
                { id: 3, date: '2026-04-10', description: 'Retorno', value: -120.0, status: 'pending' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-04-01', time: '10:00', service: 'Consulta Geral', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Paciente relatou dores nas costas.',
                procedures: [
                    { id: 1, name: 'Consulta Clínica', qty: 1, value: 150.0, status: 'done', executedBy: 'Dr. Carlos' },
                    { id: 2, name: 'Eletrocardiograma', qty: 1, value: 80.0, status: 'done', executedBy: 'Dra. Fernanda' },
                    { id: 3, name: 'Aplicação de Injeção', qty: 2, value: 30.0, status: 'done', executedBy: 'Enf. Paulo' },
                ],
            },
            {
                id: 2, date: '2026-03-15', time: '09:30', service: 'Limpeza Dental', professional: 'Dra. Ana', status: 'completed',
                notes: 'Procedimento sem intercorrências.',
                procedures: [
                    { id: 1, name: 'Profilaxia Dental', qty: 1, value: 120.0, status: 'done', executedBy: 'Dra. Ana' },
                    { id: 2, name: 'Aplicação de Flúor', qty: 1, value: 50.0, status: 'done', executedBy: 'Dra. Ana' },
                    { id: 3, name: 'Restauração Resina', qty: 2, value: 200.0, status: 'cancelled', executedBy: 'Dra. Ana' },
                ],
            },
            {
                id: 3, date: '2026-02-10', time: '11:00', service: 'Avaliação', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Solicitado exame de sangue.',
                procedures: [
                    { id: 1, name: 'Avaliação Inicial', qty: 1, value: 100.0, status: 'done', executedBy: 'Dr. Bruno' },
                ],
            },
        ],
        nextAppointments: [
            { id: 4, date: '2026-04-20', time: '10:00', service: 'Retorno', professional: 'Dr. Carlos' },
            { id: 5, date: '2026-05-05', time: '14:30', service: 'Limpeza', professional: 'Dra. Ana' },
        ],
        pendingTreatments: [
            { id: 1, treatment: 'Exame de Sangue', priority: 'high', requestedBy: 'Dr. Bruno', requestedAt: '2026-02-10', notes: 'Solicitar hemograma completo e glicemia.' },
            { id: 2, treatment: 'Raio-X Coluna', priority: 'medium', requestedBy: 'Dr. Carlos', requestedAt: '2026-04-01', notes: 'Coluna lombar e torácica.' },
        ],
    },
    {
        id: 2,
        name: 'Maria Santos',
        birthDate: '1992-07-22',
        cpf: '987.654.321-00',
        phone: '(11) 99876-5432',
        email: 'maria.santos@email.com',
        address: 'Av. Paulista, 500 - São Paulo/SP',
        bloodType: 'O-',
        allergies: [],
        insurance: 'Bradesco Saúde',
        insuranceNumber: '789012',
        financial: {
            balance: 50.0,
            history: [
                { id: 1, date: '2026-03-20', description: 'Consulta', value: -200.0, status: 'paid' },
                { id: 2, date: '2026-03-20', description: 'Crédito', value: 250.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-20', time: '15:00', service: 'Consulta', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Sem queixas relevantes.',
                procedures: [
                    { id: 1, name: 'Consulta Clínica', qty: 1, value: 200.0, status: 'done', executedBy: 'Dr. Carlos' },
                ],
            },
        ],
        nextAppointments: [
            { id: 2, date: '2026-04-25', time: '09:00', service: 'Revisão', professional: 'Dr. Carlos' },
        ],
        pendingTreatments: [],
    },
    {
        id: 3,
        name: 'Pedro Oliveira',
        birthDate: '1978-11-08',
        cpf: '456.789.123-00',
        phone: '(11) 97654-3210',
        email: 'pedro.oliveira@email.com',
        address: 'Rua Augusta, 90 - São Paulo/SP',
        bloodType: 'B+',
        allergies: ['Dipirona'],
        insurance: 'SulAmérica',
        insuranceNumber: '345678',
        financial: {
            balance: -80.0,
            history: [
                { id: 1, date: '2026-04-05', description: 'Tratamento', value: -300.0, status: 'paid' },
                { id: 2, date: '2026-04-05', description: 'Crédito Plano', value: 220.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-04-05', time: '11:00', service: 'Avaliação', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Tratamento iniciado.',
                procedures: [
                    { id: 1, name: 'Avaliação Clínica', qty: 1, value: 120.0, status: 'done', executedBy: 'Dr. Bruno' },
                    { id: 2, name: 'Curativo Simples', qty: 3, value: 60.0, status: 'done', executedBy: 'Enf. Carla' },
                ],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [
            { id: 1, treatment: 'Ultrassom Abdominal', priority: 'low', requestedBy: 'Dr. Bruno', requestedAt: '2026-04-05', notes: 'Acompanhamento de rotina.' },
        ],
    },
]

const MOCK_IMAGE_SOURCES = [
    '/img/thumbs/layouts/modern.jpg',
    '/img/thumbs/layouts/classic.jpg',
    '/img/thumbs/layouts/simple.jpg',
    '/img/thumbs/layouts/decked.jpg',
    '/img/thumbs/layouts/stackedSide.jpg',
]

const buildMockImages = () =>
    Array.from({ length: 20 }, (_, index) => {
        const month = String((index % 12) + 1).padStart(2, '0')
        const day = String((index % 28) + 1).padStart(2, '0')
        return {
            id: `img-${index + 1}`,
            name: `Imagem Clinica ${String(index + 1).padStart(2, '0')}`,
            url: MOCK_IMAGE_SOURCES[index % MOCK_IMAGE_SOURCES.length],
            createdAt: `2026-${month}-${day}`,
            size: 250000 + index * 11000,
        }
    })

const buildMockDocuments = () =>
    Array.from({ length: 20 }, (_, index) => {
        const month = String((index % 12) + 1).padStart(2, '0')
        const day = String((index % 28) + 1).padStart(2, '0')
        return {
            id: `doc-${index + 1}`,
            name: `Documento Clinico ${String(index + 1).padStart(2, '0')}.pdf`,
            createdAt: `2026-${month}-${day}`,
            size: 180000 + index * 9000,
        }
    })

const INITIAL_PATIENT_FILES = {
    1: {
        images: buildMockImages(),
        documents: buildMockDocuments(),
    },
    2: {
        images: [
            { id: 'img-3', name: 'Imagem Revisao', url: '/img/thumbs/layouts/simple.jpg', createdAt: '2026-03-20' },
        ],
        documents: [
            { id: 'doc-3', name: 'Comprovante Atendimento.pdf', createdAt: '2026-03-20', size: 180000 },
        ],
    },
    3: {
        images: [],
        documents: [],
    },
}

// ─── Helper components ────────────────────────────────────────────────────────

const priorityMap = {
    high: { label: 'Alta', color: 'red' },
    medium: { label: 'Média', color: 'amber' },
    low: { label: 'Baixa', color: 'blue' },
}

const statusFinancialMap = {
    paid: { label: 'Pago', color: 'green' },
    pending: { label: 'Pendente', color: 'amber' },
}

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const formatDateTime = (isoDateTime) => {
    const date = new Date(isoDateTime)
    const dd = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    const hh = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '0 KB'
    const sizeInKb = sizeInBytes / 1024
    if (sizeInKb < 1024) return `${Math.round(sizeInKb)} KB`
    return `${(sizeInKb / 1024).toFixed(1)} MB`
}

const calcAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

// ─── Main component ───────────────────────────────────────────────────────────

const PatientRecordIndex = () => {
    const { TabNav, TabList, TabContent } = Tabs

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchParams] = useSearchParams()
    const [expandedAppointmentKey, setExpandedAppointmentKey] = useState(null)
    const [patientImages, setPatientImages] = useState([])
    const [patientDocuments, setPatientDocuments] = useState([])
    const [imageViewMode, setImageViewMode] = useState('list')
    const [printTemplates, setPrintTemplates] = useState([])

    const imageInputRef = useRef(null)
    const documentInputRef = useRef(null)

    // Auto-select patient from URL param ?id=X
    useEffect(() => {
        const patientId = searchParams.get('id')
        if (patientId) {
            const found = PATIENTS.find(p => String(p.id) === patientId)
            if (found) setSelectedPatient(found)
        }
    }, [searchParams])

    const filteredPatients = PATIENTS.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cpf.includes(searchTerm)
    )

    useEffect(() => {
        const raw = localStorage.getItem('patient_record_templates')
        if (!raw) return

        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) {
                setPrintTemplates(parsed)
            }
        } catch (error) {
            // Keep empty if invalid.
        }
    }, [])

    useEffect(() => {
        if (!selectedPatient) {
            setPatientImages([])
            setPatientDocuments([])
            return
        }

        const baseFiles = INITIAL_PATIENT_FILES[selectedPatient.id] || { images: [], documents: [] }
        setPatientImages(baseFiles.images)
        setPatientDocuments(baseFiles.documents)
        setExpandedAppointmentKey(null)
        setImageViewMode('list')
    }, [selectedPatient])

    const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date))
    const sortByDateAsc = (items) => [...items].sort((a, b) => new Date(a.date) - new Date(b.date))

    const handleStartAppointment = () => {
        alert(`Iniciando atendimento para ${selectedPatient.name}`)
    }

    const handleUploadImages = (event) => {
        const files = Array.from(event.target.files || [])
        if (!files.length) return

        const newImages = files.map((file, index) => ({
            id: `new-img-${Date.now()}-${index}`,
            name: file.name,
            url: URL.createObjectURL(file),
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
        }))

        setPatientImages((prev) => [...newImages, ...prev])
        event.target.value = ''
    }

    const handleUploadDocuments = (event) => {
        const files = Array.from(event.target.files || [])
        if (!files.length) return

        const newDocuments = files.map((file, index) => ({
            id: `new-doc-${Date.now()}-${index}`,
            name: file.name,
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
        }))

        setPatientDocuments((prev) => [...newDocuments, ...prev])
        event.target.value = ''
    }

    const applyPatientVariables = (content, templateTitle = '') => {
        if (!selectedPatient) return content

        const todayIso = new Date().toISOString().slice(0, 10)
        const replacements = {
            '[PACIENTE_NOME]': selectedPatient.name,
            '[PACIENTE_CPF]': selectedPatient.cpf,
            '[PACIENTE_NASCIMENTO]': formatDate(selectedPatient.birthDate),
            '[PROFISSIONAL_NOME]': 'Profissional Responsavel',
            '[CLINICA_NOME]': 'Fluxy Clinic',
            '[CLINICA_CNPJ]': '00.000.000/0001-00',
            '[DATA_ATUAL]': formatDate(todayIso),
            '[VALOR_TOTAL]': 'R$ 0,00',
            '[FORMA_PAGAMENTO]': 'A definir',
            '[VIGENCIA_CONTRATO]': '12 meses',
            '[TEMPLATE_NOME]': templateTitle,
        }

        return Object.entries(replacements).reduce(
            (acc, [token, value]) => acc.split(token).join(value),
            content,
        )
    }

    const buildPrintHtml = (title, content) => `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; padding: 32px; color: #111827; line-height: 1.5; }
    h1,h2,h3 { margin: 0 0 8px; }
    .meta { font-size: 12px; color: #6b7280; margin-bottom: 18px; }
    .content { white-space: pre-wrap; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">Paciente: ${selectedPatient?.name || ''} | Emitido em: ${formatDateTime(new Date().toISOString())}</div>
  <div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body>
</html>`

    const handlePrintTemplate = (templateId) => {
        if (!selectedPatient) return

        const fallbackTemplateId = printTemplates[0]?.id
        const template = printTemplates.find((item) => String(item.id) === String(templateId || fallbackTemplateId))
        if (!template) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Nenhum template de contrato ou receita encontrado para impressao.
                </Notification>,
            )
            return
        }

        const renderedContent = applyPatientVariables(template.content, template.title)
        const printTitle = `${template.type === 'contract' ? 'Contrato' : 'Receita'} - ${template.title}`

        const printWindow = window.open('', '_blank', 'width=900,height=700')
        if (!printWindow) {
            toast.push(
                <Notification type='danger' title='Erro'>
                    Nao foi possivel abrir a janela de impressao.
                </Notification>,
            )
            return
        }

        const html = buildPrintHtml(printTitle, renderedContent)
        printWindow.document.open()
        printWindow.document.write(html)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()

        const now = new Date().toISOString()
        const trackName = `${printTitle} - ${selectedPatient.name}.pdf`
        setPatientDocuments((prev) => [
            {
                id: `print-${Date.now()}`,
                name: trackName,
                createdAt: now.slice(0, 10),
                createdAtDateTime: now,
                size: Math.max(180000, renderedContent.length * 20),
                source: 'print',
                templateType: template.type,
                templateTitle: template.title,
            },
            ...prev,
        ])

        toast.push(
            <Notification type='success' title='Impresso e Registrado'>
                Documento impresso e registrado no gerenciador de documentos.
            </Notification>,
        )
    }

    const handleSchedule = () => {
        toast.push(
            <Notification type='info' title='Agendar'>
                Encaminhe para a aba de agendamento para criar uma nova consulta.
            </Notification>,
        )
    }

    const renderProceduresTable = (appointment) => (
        <div className='rounded-lg border border-gray-200 overflow-hidden'>
            <table className='w-full text-sm'>
                <thead>
                    <tr className='bg-gray-100 text-gray-600 text-xs'>
                        <th className='text-left px-3 py-2 font-semibold'>Procedimento</th>
                        <th className='text-left px-3 py-2 font-semibold'>Profissional</th>
                        <th className='text-center px-3 py-2 font-semibold'>Qtd.</th>
                        <th className='text-right px-3 py-2 font-semibold'>Valor</th>
                        <th className='text-center px-3 py-2 font-semibold'>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointment.procedures.map((proc, idx) => (
                        <tr key={proc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className='px-3 py-2 text-gray-800 font-medium'>{proc.name}</td>
                            <td className='px-3 py-2 text-gray-700'>{proc.executedBy || appointment.professional}</td>
                            <td className='px-3 py-2 text-center text-gray-600'>{proc.qty}</td>
                            <td className='px-3 py-2 text-right text-gray-700'>R$ {proc.value.toFixed(2).replace('.', ',')}</td>
                            <td className='px-3 py-2 text-center'>
                                <Badge color={proc.status === 'done' ? 'green' : 'red'}>
                                    {proc.status === 'done' ? 'Realizado' : 'Cancelado'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className='bg-gray-100 border-t border-gray-200'>
                        <td colSpan={3} className='px-3 py-2 text-xs font-bold text-gray-600 uppercase'>Total</td>
                        <td className='px-3 py-2 text-right font-bold text-gray-800'>
                            R$ {appointment.procedures
                                .filter((p) => p.status === 'done')
                                .reduce((sum, p) => sum + p.value * p.qty, 0)
                                .toFixed(2)
                                .replace('.', ',')}
                        </td>
                        <td />
                    </tr>
                </tfoot>
            </table>
        </div>
    )

    const renderAppointmentCard = (appointment, keyPrefix = 'past') => {
        const itemKey = `${keyPrefix}-${appointment.id}`
        const isOpen = expandedAppointmentKey === itemKey

        return (
            <div key={itemKey} className='border border-gray-200 rounded-xl overflow-hidden'>
                <button
                    className='w-full flex items-center gap-4 p-3 hover:bg-gray-50 transition text-left'
                    onClick={() => setExpandedAppointmentKey(isOpen ? null : itemKey)}
                >
                    <div className='bg-gray-700 text-white rounded-lg p-2 text-center min-w-14 flex-shrink-0'>
                        <p className='text-xs'>{formatDate(appointment.date).slice(3)}</p>
                        <p className='font-bold text-lg leading-none'>{formatDate(appointment.date).slice(0, 2)}</p>
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-gray-800 text-sm truncate'>{appointment.service}</p>
                        <p className='text-xs text-gray-500'>{appointment.time} · {appointment.professional}</p>
                    </div>
                    <div className='flex items-center gap-2 flex-shrink-0'>
                        <Badge color='green'>Concluído</Badge>
                        {isOpen ? <HiOutlineChevronUp className='text-gray-400' /> : <HiOutlineChevronDown className='text-gray-400' />}
                    </div>
                </button>

                {isOpen && (
                    <div className='bg-gray-50 border-t border-gray-200'>
                        <div className='px-4 pt-3 pb-2'>
                            <p className='text-xs font-semibold text-gray-500 uppercase mb-1'>Anotações</p>
                            <p className='text-sm text-gray-700'>{appointment.notes || 'Sem anotações.'}</p>
                        </div>

                        {appointment.procedures && appointment.procedures.length > 0 && (
                            <div className='px-4 pb-4'>
                                <p className='text-xs font-semibold text-gray-500 uppercase mb-2'>Procedimentos Realizados</p>
                                {renderProceduresTable(appointment)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className='w-full p-4 space-y-6'>


            {/* ── Patient Content ── */}
            {selectedPatient && (
                <>
                    {/* ── Patient Header Card ── */}
                    <div className='relative rounded-2xl overflow-hidden shadow-sm border border-white/80'
                        style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 50%, #f5f0ff 100%)' }}>

                        {/* Decorative blobs */}
                        <div className='absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 pointer-events-none'
                            style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
                        <div className='absolute bottom-0 left-48 w-40 h-40 rounded-full opacity-20 pointer-events-none'
                            style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)', transform: 'translateY(40%)' }} />

                        <div className='relative p-6 flex flex-col md:flex-row md:items-start gap-6'>

                            {/* Avatar */}
                            <div className='flex-shrink-0'>
                                <div className='w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-md select-none'
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div className='mt-2 text-center'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-indigo-400'>Prontuário</span>
                                    <p className='text-[10px] text-gray-400'>#{String(selectedPatient.id).padStart(5, '0')}</p>
                                </div>
                            </div>

                            {/* Main info */}
                            <div className='flex-1 min-w-0'>
                                <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
                                    <div>
                                        <h2 className='text-xl font-bold text-gray-900 leading-tight'>{selectedPatient.name}</h2>
                                        <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                            <span className='text-xs text-gray-500'>{formatDate(selectedPatient.birthDate)} · {calcAge(selectedPatient.birthDate)} anos</span>
                                            <span className='w-1 h-1 rounded-full bg-gray-300 inline-block'></span>
                                            <span className='text-xs font-mono text-gray-500'>{selectedPatient.cpf}</span>
                                        </div>
                                    </div>

                                    {/* Action bar */}
                                    <div className='flex items-center gap-1 p-1 rounded-xl border border-white/80 bg-white/60 backdrop-blur-sm shadow-sm'>
                                        <button
                                            title='Iniciar atendimento'
                                            onClick={handleStartAppointment}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-700 hover:bg-green-50 transition'
                                        >
                                            <HiOutlinePlay className='w-4 h-4' />
                                        </button>
                                        <button
                                            title='Imprimir e registrar'
                                            onClick={() => handlePrintTemplate(printTemplates[0]?.id)}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition'
                                        >
                                            <HiOutlinePrinter className='w-4 h-4' />
                                        </button>
                                        <button
                                            title='Agendar'
                                            onClick={handleSchedule}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition'
                                        >
                                            <HiOutlineCalendar className='w-4 h-4' />
                                        </button>
                                    </div>
                                </div>

                                {/* Data grid */}
                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                    <div className='flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80'>
                                        <div className='w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlinePhone className='w-3.5 h-3.5 text-indigo-400' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>Telefone</p>
                                            <p className='text-sm font-semibold text-gray-700 truncate'>{selectedPatient.phone}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80'>
                                        <div className='w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineMail className='w-3.5 h-3.5 text-purple-400' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>E-mail</p>
                                            <p className='text-sm font-semibold text-gray-700 truncate'>{selectedPatient.email}</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80'>
                                        <div className='w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0'>
                                            <HiOutlineLocationMarker className='w-3.5 h-3.5 text-sky-400' />
                                        </div>
                                        <div className='min-w-0'>
                                            <p className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>Endereço</p>
                                            <p className='text-sm font-semibold text-gray-700 truncate'>{selectedPatient.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags row */}
                                <div className='flex flex-wrap items-center gap-2 mt-3'>
                                    <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200'>
                                        🩸 {selectedPatient.bloodType}
                                    </span>
                                    <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200'>
                                        {selectedPatient.insurance}
                                    </span>
                                    {selectedPatient.allergies.length > 0 && (
                                        <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200'>
                                            ⚠ Alergias: {selectedPatient.allergies.join(', ')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Card>
                        <Tabs defaultValue='dashboard'>
                            <TabList>
                                <div className='flex flex-wrap items-center gap-2 w-full'>
                                    <TabNav value='dashboard'>Dashboard</TabNav>
                                    <TabNav value='financial'>Financeiro</TabNav>
                                    <TabNav value='appointments'>Atendimentos</TabNav>
                                    <TabNav value='media'>Imagens e Documentos</TabNav>
                                </div>
                            </TabList>

                            <div className='pt-4'>
                                <TabContent value='dashboard'>
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineCurrencyDollar className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Ultimos Financeiros</h3>
                                            </div>
                                            <div className={`p-3 mb-3 rounded-lg font-bold text-lg flex items-center justify-between ${selectedPatient.financial.balance >= 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                <span className='text-sm font-semibold'>Saldo Atual</span>
                                                {selectedPatient.financial.balance >= 0 ? '+' : ''}
                                                R$ {selectedPatient.financial.balance.toFixed(2).replace('.', ',')}
                                            </div>
                                            <div className='space-y-2'>
                                                {sortByDateDesc(selectedPatient.financial.history).slice(0, 4).map((item) => (
                                                    <div key={item.id} className='flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100'>
                                                        <div>
                                                            <p className='text-sm font-semibold text-gray-800'>{item.description}</p>
                                                            <p className='text-xs text-gray-500'>{formatDate(item.date)}</p>
                                                        </div>
                                                        <div className='text-right'>
                                                            <p className={`font-bold text-sm ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {item.value >= 0 ? '+' : ''}R$ {Math.abs(item.value).toFixed(2).replace('.', ',')}
                                                            </p>
                                                            <Badge color={statusFinancialMap[item.status].color}>{statusFinancialMap[item.status].label}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>

                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineClock className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Proximos Atendimentos</h3>
                                            </div>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum agendamento futuro</p>
                                                ) : (
                                                    sortByDateAsc(selectedPatient.nextAppointments).map((apt) => (
                                                        <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
                                                            <div className='bg-blue-600 text-white rounded-lg p-2 text-center min-w-14'>
                                                                <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                                <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                            </div>
                                                            <div className='flex-1'>
                                                                <p className='font-semibold text-gray-800 text-sm'>{apt.service}</p>
                                                                <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                            </div>
                                                            <Badge color='blue'>Agendado</Badge>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>
                                    </div>

                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineExclamation className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Tratamentos Pendentes</h3>
                                            </div>
                                            {selectedPatient.pendingTreatments.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhum tratamento pendente</p>
                                            ) : (
                                                <div className='space-y-3'>
                                                    {selectedPatient.pendingTreatments.map((treatment) => (
                                                        <div key={treatment.id} className='p-3 rounded-lg border border-gray-200 bg-gray-50'>
                                                            <div className='flex items-center justify-between'>
                                                                <p className='font-bold text-gray-800 text-sm'>{treatment.treatment}</p>
                                                                <Badge color={priorityMap[treatment.priority].color}>{priorityMap[treatment.priority].label}</Badge>
                                                            </div>
                                                            <p className='text-xs text-gray-600 mt-1'>{treatment.notes}</p>
                                                            <p className='text-xs text-gray-500 mt-2'>
                                                                Solicitado por {treatment.requestedBy} · {formatDate(treatment.requestedAt)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>

                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineClipboardList className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Ultimos 3 Atendimentos</h3>
                                            </div>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments).slice(0, 3).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum atendimento registrado</p>
                                                ) : (
                                                    sortByDateDesc(selectedPatient.pastAppointments).slice(0, 3).map((appointment) => renderAppointmentCard(appointment, 'dashboard'))
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </TabContent>

                                <TabContent value='financial'>
                                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                                        <Card className='lg:col-span-1'>
                                            <h3 className='text-lg font-bold text-gray-800 mb-3'>Resumo</h3>
                                            <div className={`p-4 rounded-lg font-bold text-xl ${selectedPatient.financial.balance >= 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                                <p className='text-sm font-semibold mb-1'>Saldo Atual</p>
                                                <p>
                                                    {selectedPatient.financial.balance >= 0 ? '+' : ''}
                                                    R$ {selectedPatient.financial.balance.toFixed(2).replace('.', ',')}
                                                </p>
                                            </div>
                                        </Card>

                                        <Card className='lg:col-span-2'>
                                            <h3 className='text-lg font-bold text-gray-800 mb-3'>Todo Financeiro</h3>
                                            <div className='space-y-2 max-h-[520px] overflow-y-auto pr-1'>
                                                {sortByDateDesc(selectedPatient.financial.history).map((item) => (
                                                    <div key={item.id} className='flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100'>
                                                        <div>
                                                            <p className='text-sm font-semibold text-gray-800'>{item.description}</p>
                                                            <p className='text-xs text-gray-500'>{formatDate(item.date)}</p>
                                                        </div>
                                                        <div className='text-right'>
                                                            <p className={`font-bold text-sm ${item.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {item.value >= 0 ? '+' : ''}R$ {Math.abs(item.value).toFixed(2).replace('.', ',')}
                                                            </p>
                                                            <Badge color={statusFinancialMap[item.status].color}>{statusFinancialMap[item.status].label}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </TabContent>

                                <TabContent value='appointments'>
                                    <div className='space-y-6'>
                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineClock className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Proximos Atendimentos</h3>
                                            </div>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum agendamento futuro</p>
                                                ) : (
                                                    sortByDateAsc(selectedPatient.nextAppointments).map((apt) => (
                                                        <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100'>
                                                            <div className='bg-blue-600 text-white rounded-lg p-2 text-center min-w-14'>
                                                                <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                                <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                            </div>
                                                            <div className='flex-1'>
                                                                <p className='font-semibold text-gray-800 text-sm'>{apt.service}</p>
                                                                <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                            </div>
                                                            <Badge color='blue'>Agendado</Badge>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </Card>

                                        <Card>
                                            <div className='flex items-center gap-2 mb-3'>
                                                <HiOutlineClipboardList className='w-5 h-5 text-blue-600' />
                                                <h3 className='text-lg font-bold text-gray-800'>Todos os Atendimentos</h3>
                                            </div>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum atendimento registrado</p>
                                                ) : (
                                                    sortByDateDesc(selectedPatient.pastAppointments).map((appointment) => renderAppointmentCard(appointment, 'all'))
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </TabContent>

                                <TabContent value='media'>
                                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                                        <Card>
                                            <div className='flex items-center justify-between mb-3'>
                                                <h3 className='text-lg font-bold text-gray-800'>Documentos do Paciente</h3>
                                                <div>
                                                    <input
                                                        ref={documentInputRef}
                                                        type='file'
                                                        multiple
                                                        className='hidden'
                                                        onChange={handleUploadDocuments}
                                                    />
                                                    <button
                                                        onClick={() => documentInputRef.current?.click()}
                                                        className='flex items-center gap-2 px-3 py-2 border-2 border-dashed border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition'
                                                    >
                                                        <HiOutlinePlus className='w-4 h-4' />
                                                        Incluir Documentos
                                                    </button>
                                                </div>
                                            </div>

                                            {patientDocuments.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhum documento cadastrado.</p>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {patientDocuments.map((doc) => (
                                                        <div key={doc.id} className='p-3 rounded-lg border border-gray-200 bg-gray-50'>
                                                            <div className='flex items-center justify-between gap-2'>
                                                                <p className='text-sm font-semibold text-gray-800'>{doc.name}</p>
                                                                {doc.source === 'print' && <Badge color='blue'>Impresso</Badge>}
                                                            </div>
                                                            <p className='text-xs text-gray-500 mt-1'>
                                                                Adicionado em {formatDate(doc.createdAt)} · {formatFileSize(doc.size)}
                                                            </p>
                                                            {doc.source === 'print' && (
                                                                <p className='text-xs text-blue-700 mt-1'>
                                                                    Rastro: {doc.templateType === 'contract' ? 'Contrato' : 'Receita'} "{doc.templateTitle}" impresso em {formatDateTime(doc.createdAtDateTime || `${doc.createdAt}T00:00:00`)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </Card>

                                        <Card>
                                            <div className='flex items-center justify-between mb-3'>
                                                <h3 className='text-lg font-bold text-gray-800'>Imagens do Paciente</h3>
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex items-center rounded-lg border border-gray-200 overflow-hidden'>
                                                        <button
                                                            onClick={() => setImageViewMode('list')}
                                                            className={`px-2 py-1 text-xs font-semibold transition ${imageViewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            Lista
                                                        </button>
                                                        <button
                                                            onClick={() => setImageViewMode('thumbs')}
                                                            className={`px-2 py-1 text-xs font-semibold transition ${imageViewMode === 'thumbs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                                        >
                                                            Thumbs
                                                        </button>
                                                    </div>
                                                    <input
                                                        ref={imageInputRef}
                                                        type='file'
                                                        accept='image/*'
                                                        multiple
                                                        className='hidden'
                                                        onChange={handleUploadImages}
                                                    />
                                                    <button
                                                        onClick={() => imageInputRef.current?.click()}
                                                        className='flex items-center gap-2 px-3 py-2 border-2 border-dashed border-blue-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition'
                                                    >
                                                        <HiOutlinePlus className='w-4 h-4' />
                                                        Incluir Imagens
                                                    </button>
                                                </div>
                                            </div>

                                            {patientImages.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhuma imagem cadastrada.</p>
                                            ) : (
                                                imageViewMode === 'list' ? (
                                                    <div className='space-y-2'>
                                                        {patientImages.map((image) => (
                                                            <div key={image.id} className='p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3'>
                                                                <img src={image.url} alt={image.name} className='w-12 h-12 rounded object-cover border border-gray-200 flex-shrink-0' />
                                                                <div className='min-w-0'>
                                                                    <p className='text-sm font-semibold text-gray-800 truncate'>{image.name}</p>
                                                                    <p className='text-xs text-gray-500 mt-1'>
                                                                        Adicionado em {formatDate(image.createdAt)} · {formatFileSize(image.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                        {patientImages.map((image) => (
                                                            <div key={image.id} className='rounded-lg border border-gray-200 overflow-hidden bg-gray-50'>
                                                                <img src={image.url} alt={image.name} className='w-full h-36 object-cover' />
                                                                <div className='p-2'>
                                                                    <p className='text-sm font-semibold text-gray-800 truncate'>{image.name}</p>
                                                                    <p className='text-xs text-gray-500'>Adicionado em {formatDate(image.createdAt)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )}
                                        </Card>
                                    </div>
                                </TabContent>
                            </div>
                        </Tabs>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {!selectedPatient && (
                <Card className='py-16'>
                    <div className='text-center text-gray-400'>
                        <HiOutlineIdentification className='w-16 h-16 mx-auto mb-4 opacity-40' />
                        <p className='text-lg font-semibold'>Nenhum paciente selecionado</p>
                        <p className='text-sm mt-1'>Use a barra de pesquisa no topo para encontrar um prontuário</p>
                    </div>
                </Card>
            )}
        </div>
    )
}

export default PatientRecordIndex
