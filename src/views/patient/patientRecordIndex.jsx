import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Card, Notification, Tabs, toast } from '@/components/ui'
import {
    HiOutlineCalendar,
    HiOutlineClipboardList,
    HiOutlineClock,
    HiOutlineCollection,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentText,
    HiOutlineExclamation,
    HiOutlineIdentification,
    HiOutlineLocationMarker,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlinePhotograph,
    HiOutlinePlay,
    HiOutlinePlus,
    HiOutlinePrinter,
    HiOutlineSearch,
} from 'react-icons/hi'
import SectionCard from './components/SectionCard'
import AppointmentCard from './components/AppointmentCard'
import FilePermissionPopover from './components/FilePermissionPopover'

// ─── Mock data ────────────────────────────────────────────────────────────────

const PATIENTS = [
    {
        id: 1,
        name: 'João Silva',
        gender: 'male',
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
        id: 2, name: 'Maria Santos', gender: 'female', birthDate: '1992-07-22', cpf: '987.654.321-00',
        phone: '(11) 99876-5432', email: 'maria.santos@email.com', address: 'Av. Paulista, 500 - São Paulo/SP',
        bloodType: 'O-', allergies: [], insurance: 'Bradesco Saúde', insuranceNumber: '789012',
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
                procedures: [{ id: 1, name: 'Consulta Clínica', qty: 1, value: 200.0, status: 'done', executedBy: 'Dr. Carlos' }],
            },
        ],
        nextAppointments: [{ id: 2, date: '2026-04-25', time: '09:00', service: 'Revisão', professional: 'Dr. Carlos' }],
        pendingTreatments: [],
    },
    {
        id: 3, name: 'Pedro Oliveira', gender: 'male', birthDate: '1978-11-08', cpf: '456.789.123-00',
        phone: '(11) 97654-3210', email: 'pedro.oliveira@email.com', address: 'Rua Augusta, 90 - São Paulo/SP',
        bloodType: 'B+', allergies: ['Dipirona'], insurance: 'SulAmérica', insuranceNumber: '345678',
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
    {
        id: 4, name: 'Ana Costa', gender: 'female', birthDate: '1995-01-12', cpf: '321.654.987-00',
        phone: '(11) 96543-2109', email: 'ana.costa@email.com', address: 'Av. Brasil, 456 - São Paulo/SP',
        bloodType: 'AB-', allergies: [], insurance: 'Sulamerica', insuranceNumber: '567890',
        financial: {
            balance: 0.0,
            history: [
                { id: 1, date: '2026-03-05', description: 'Limpeza', value: -100.0, status: 'paid' },
                { id: 2, date: '2026-03-05', description: 'Reembolso', value: 100.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-05', time: '11:00', service: 'Limpeza Dental', professional: 'Dra. Ana', status: 'completed',
                notes: 'Paciente jovem, sem problemas.',
                procedures: [{ id: 1, name: 'Profilaxia Dental', qty: 1, value: 100.0, status: 'done', executedBy: 'Dra. Ana' }],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [],
    },
    {
        id: 5, name: 'Carlos Mendes', gender: 'male', birthDate: '1980-09-30', cpf: '789.123.456-00',
        phone: '(11) 95432-1098', email: 'carlos.mendes@email.com', address: 'Rua Verde, 321 - São Paulo/SP',
        bloodType: 'O+', allergies: ['Penicilina'], insurance: 'Unimed', insuranceNumber: '901234',
        financial: {
            balance: -200.0,
            history: [{ id: 1, date: '2026-02-20', description: 'Extração', value: -200.0, status: 'paid' }],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-02-20', time: '16:00', service: 'Cirurgia', professional: 'Dr. Bruno', status: 'completed',
                notes: 'Extração de dente do siso.',
                procedures: [{ id: 1, name: 'Extração Dental', qty: 1, value: 200.0, status: 'done', executedBy: 'Dr. Bruno' }],
            },
        ],
        nextAppointments: [{ id: 2, date: '2026-05-01', time: '16:00', service: 'Retorno', professional: 'Dr. Bruno' }],
        pendingTreatments: [],
    },
    {
        id: 6, name: 'Fernanda Lima', gender: 'female', birthDate: '1988-05-18', cpf: '654.321.987-00',
        phone: '(11) 94321-0987', email: 'fernanda.lima@email.com', address: 'Rua Azul, 654 - São Paulo/SP',
        bloodType: 'A-', allergies: ['Ibuprofeno'], insurance: 'Bradesco Saúde', insuranceNumber: '123789',
        financial: {
            balance: 75.0,
            history: [
                { id: 1, date: '2026-03-01', description: 'Consulta', value: -150.0, status: 'paid' },
                { id: 2, date: '2026-03-01', description: 'Desconto', value: 225.0, status: 'paid' },
            ],
        },
        pastAppointments: [
            {
                id: 1, date: '2026-03-01', time: '10:30', service: 'Consulta Geral', professional: 'Dr. Carlos', status: 'completed',
                notes: 'Paciente com dores de dente.',
                procedures: [{ id: 1, name: 'Consulta Clínica', qty: 1, value: 150.0, status: 'done', executedBy: 'Dr. Carlos' }],
            },
        ],
        nextAppointments: [],
        pendingTreatments: [
            { id: 1, treatment: 'Canal', priority: 'medium', requestedBy: 'Dr. Carlos', requestedAt: '2026-03-01', notes: 'Dente 14 necessita tratamento de canal.' },
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
    Array.from({ length: 20 }, (_, i) => ({
        id: `img-${i + 1}`,
        name: `Imagem Clinica ${String(i + 1).padStart(2, '0')}`,
        url: MOCK_IMAGE_SOURCES[i % MOCK_IMAGE_SOURCES.length],
        createdAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        size: 250000 + i * 11000,
        permissions: [],
    }))

const buildMockDocuments = () =>
    Array.from({ length: 20 }, (_, i) => ({
        id: `doc-${i + 1}`,
        name: `Documento Clinico ${String(i + 1).padStart(2, '0')}.pdf`,
        createdAt: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        size: 180000 + i * 9000,
        permissions: [],
    }))

const INITIAL_PATIENT_FILES = {
    1: { images: buildMockImages(), documents: buildMockDocuments() },
    2: {
        images: [{ id: 'img-3', name: 'Imagem Revisao', url: '/img/thumbs/layouts/simple.jpg', createdAt: '2026-03-20' }],
        documents: [{ id: 'doc-3', name: 'Comprovante Atendimento.pdf', createdAt: '2026-03-20', size: 180000 }],
    },
    3: { images: [], documents: [] },
}

// ─── Maps / helpers ───────────────────────────────────────────────────────────

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

const formatDateTime = (iso) => {
    const dt = new Date(iso)
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()} ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB'
    const kb = bytes / 1024
    return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

const calcAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

const sortByDateDesc = (items) => [...items].sort((a, b) => new Date(b.date) - new Date(a.date))
const sortByDateAsc  = (items) => [...items].sort((a, b) => new Date(a.date) - new Date(b.date))

// ─── Main component ───────────────────────────────────────────────────────────

const PatientRecordIndex = () => {
    const { TabNav, TabList, TabContent } = Tabs

    const navigate = useNavigate()

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchParams] = useSearchParams()
    const [patientImages, setPatientImages] = useState([])
    const [patientDocuments, setPatientDocuments] = useState([])
    const [imageViewMode, setImageViewMode] = useState('list')
    const [printTemplates, setPrintTemplates] = useState([])

    const imageInputRef    = useRef(null)
    const documentInputRef = useRef(null)

    useEffect(() => {
        const patientId = searchParams.get('id')
        if (patientId) {
            const found = PATIENTS.find((p) => String(p.id) === patientId)
            if (found) setSelectedPatient(found)
        }
    }, [searchParams])

    useEffect(() => {
        const raw = localStorage.getItem('patient_record_templates')
        if (!raw) return
        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) setPrintTemplates(parsed)
        } catch (_) {}
    }, [])

    useEffect(() => {
        if (!selectedPatient) {
            setPatientImages([])
            setPatientDocuments([])
            return
        }
        const base = INITIAL_PATIENT_FILES[selectedPatient.id] || { images: [], documents: [] }
        setPatientImages(base.images)
        setPatientDocuments(base.documents)
        setImageViewMode('list')
    }, [selectedPatient])

    const filteredPatients = PATIENTS.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.cpf.includes(searchTerm),
    )

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleStartAppointment = () =>
        navigate(`/attendance?patientId=${selectedPatient.id}`)

    const handleUploadImages = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const newImages = files.map((file, i) => ({
            id: `new-img-${Date.now()}-${i}`,
            name: file.name,
            url: URL.createObjectURL(file),
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
            permissions: [],
        }))
        setPatientImages((prev) => [...newImages, ...prev])
        e.target.value = ''
    }

    const handleUploadDocuments = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return
        const newDocs = files.map((file, i) => ({
            id: `new-doc-${Date.now()}-${i}`,
            name: file.name,
            createdAt: new Date().toISOString().slice(0, 10),
            size: file.size,
            permissions: [],
        }))
        setPatientDocuments((prev) => [...newDocs, ...prev])
        e.target.value = ''
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
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:32px;color:#111827;line-height:1.5}h1{margin:0 0 8px}.meta{font-size:12px;color:#6b7280;margin-bottom:18px}.content{white-space:pre-wrap;font-size:14px}</style>
</head><body>
<h1>${title}</h1>
<div class="meta">Paciente: ${selectedPatient?.name || ''} | Emitido em: ${formatDateTime(new Date().toISOString())}</div>
<div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body></html>`

    const handlePrintTemplate = (templateId) => {
        if (!selectedPatient) return
        const template = printTemplates.find((t) => String(t.id) === String(templateId || printTemplates[0]?.id))
        if (!template) {
            toast.push(<Notification type='warning' title='Aviso'>Nenhum template encontrado.</Notification>)
            return
        }
        const content = applyPatientVariables(template.content, template.title)
        const title = `${template.type === 'contract' ? 'Contrato' : 'Receita'} - ${template.title}`
        const win = window.open('', '_blank', 'width=900,height=700')
        if (!win) {
            toast.push(<Notification type='danger' title='Erro'>Não foi possível abrir a janela de impressão.</Notification>)
            return
        }
        win.document.open()
        win.document.write(buildPrintHtml(title, content))
        win.document.close()
        win.focus()
        win.print()

        const now = new Date().toISOString()
        setPatientDocuments((prev) => [{
            id: `print-${Date.now()}`,
            name: `${title} - ${selectedPatient.name}.pdf`,
            createdAt: now.slice(0, 10),
            createdAtDateTime: now,
            size: Math.max(180000, content.length * 20),
            source: 'print',
            templateType: template.type,
            templateTitle: template.title,
            permissions: [],
        }, ...prev])
        toast.push(<Notification type='success' title='Impresso e Registrado'>Documento registrado no gerenciador.</Notification>)
    }

    const handleSetFilePermissions = (id, type, permissions) => {
        if (type === 'image') {
            setPatientImages((prev) => prev.map((f) => f.id === id ? { ...f, permissions } : f))
        } else {
            setPatientDocuments((prev) => prev.map((f) => f.id === id ? { ...f, permissions } : f))
        }
    }

    const handleSchedule = () =>
        toast.push(<Notification type='info' title='Agendar'>Acesse a aba de agendamento.</Notification>)

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className='w-full p-4 space-y-6'>

            {/* ── Patient Content ── */}
            {selectedPatient && (
                <>
                    {/* ── Header ── */}
                    <div className={`relative rounded-2xl overflow-hidden shadow-sm border border-white/80 ${
                        selectedPatient.gender === 'female'
                            ? 'bg-gradient-to-br from-pink-50 via-red-50 to-rose-50'
                            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
                    }`}>
                        <div className='absolute top-0 right-0 w-64 h-64 rounded-full opacity-30 pointer-events-none'
                            style={{
                                background: selectedPatient.gender === 'female'
                                    ? 'radial-gradient(circle, #f87171 0%, transparent 70%)'
                                    : 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                                transform: 'translate(30%, -40%)',
                            }} />

                        <div className='relative p-6 flex flex-col md:flex-row md:items-start gap-6'>
                            {/* Avatar */}
                            <div className='flex-shrink-0'>
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-md select-none ${
                                    selectedPatient.gender === 'female'
                                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                }`}>
                                    {selectedPatient.name.charAt(0)}
                                </div>
                                <div className='mt-2 text-center'>
                                    <span className='text-[10px] font-semibold uppercase tracking-widest text-indigo-400'>Prontuário</span>
                                    <p className='text-[10px] text-gray-400'>#{String(selectedPatient.id).padStart(5, '0')}</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className='flex-1 min-w-0'>
                                <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
                                    <div>
                                        <h2 className='text-xl font-bold text-gray-900 leading-tight'>{selectedPatient.name}</h2>
                                        <div className='flex items-center gap-3 mt-1 flex-wrap'>
                                            <span className='text-xs text-gray-500'>{formatDate(selectedPatient.birthDate)} · {calcAge(selectedPatient.birthDate)} anos</span>
                                            <span className='w-1 h-1 rounded-full bg-gray-300 inline-block' />
                                            <span className='text-xs font-mono text-gray-500'>{selectedPatient.cpf}</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 p-1 rounded-xl border border-white/80 bg-white/60 backdrop-blur-sm shadow-sm'>
                                        <button title='Iniciar atendimento' onClick={handleStartAppointment}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-700 hover:bg-green-50 transition'>
                                            <HiOutlinePlay className='w-4 h-4' />
                                        </button>
                                        <button title='Imprimir e registrar' onClick={() => handlePrintTemplate(printTemplates[0]?.id)}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-700 hover:bg-indigo-50 transition'>
                                            <HiOutlinePrinter className='w-4 h-4' />
                                        </button>
                                        <button title='Agendar' onClick={handleSchedule}
                                            className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition'>
                                            <HiOutlineCalendar className='w-4 h-4' />
                                        </button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                                    {[
                                        { icon: <HiOutlinePhone />, label: 'Telefone', value: selectedPatient.phone, color: 'indigo' },
                                        { icon: <HiOutlineMail />, label: 'E-mail', value: selectedPatient.email, color: 'purple' },
                                        { icon: <HiOutlineLocationMarker />, label: 'Endereço', value: selectedPatient.address, color: 'sky' },
                                    ].map(({ icon, label, value, color }) => (
                                        <div key={label} className='flex items-center gap-2.5 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/80'>
                                            <div className={`w-7 h-7 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                                                <span className={`text-${color}-400 w-3.5 h-3.5 flex`}>{icon}</span>
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-[10px] text-gray-400 uppercase tracking-wider font-medium'>{label}</p>
                                                <p className='text-sm font-semibold text-gray-700 truncate'>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

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

                    {/* ── Tabs ── */}
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

                                {/* ── Dashboard ── */}
                                <TabContent value='dashboard'>
                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                                        <SectionCard icon={<HiOutlineCurrencyDollar />} title='Últimos Financeiros' subtitle='Extrato recente da conta' color='emerald'>
                                            <div className={`p-3 mb-4 rounded-xl font-bold text-lg flex items-center justify-between ${
                                                selectedPatient.financial.balance >= 0
                                                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:border-green-800 dark:text-green-400'
                                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400'
                                            }`}>
                                                <span className='text-sm font-semibold'>Saldo Atual</span>
                                                {selectedPatient.financial.balance >= 0 ? '+' : ''}R$ {selectedPatient.financial.balance.toFixed(2).replace('.', ',')}
                                            </div>
                                            <div className='space-y-2'>
                                                {sortByDateDesc(selectedPatient.financial.history).slice(0, 4).map((item) => (
                                                    <div key={item.id} className='flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50'>
                                                        <div>
                                                            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>{item.description}</p>
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
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClock />} title='Próximos Atendimentos' subtitle='Agenda futura do paciente' color='blue'>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum agendamento futuro</p>
                                                ) : sortByDateAsc(selectedPatient.nextAppointments).map((apt) => (
                                                    <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50'>
                                                        <div className='bg-blue-600 text-white rounded-xl p-2 text-center min-w-14'>
                                                            <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                            <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>{apt.service}</p>
                                                            <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                        </div>
                                                        <Badge color='blue'>Agendado</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>

                                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5'>
                                        <SectionCard icon={<HiOutlineExclamation />} title='Tratamentos Pendentes' subtitle='Aguardando realização' color='amber'>
                                            {selectedPatient.pendingTreatments.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhum tratamento pendente</p>
                                            ) : (
                                                <div className='space-y-3'>
                                                    {selectedPatient.pendingTreatments.map((t) => (
                                                        <div key={t.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40'>
                                                            <div className='flex items-center justify-between'>
                                                                <p className='font-bold text-gray-800 dark:text-gray-200 text-sm'>{t.treatment}</p>
                                                                <Badge color={priorityMap[t.priority].color}>{priorityMap[t.priority].label}</Badge>
                                                            </div>
                                                            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>{t.notes}</p>
                                                            <p className='text-xs text-gray-500 mt-2'>Solicitado por {t.requestedBy} · {formatDate(t.requestedAt)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClipboardList />} title='Últimos 3 Atendimentos' subtitle='Histórico mais recente' color='violet'>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments).slice(0, 3).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum atendimento registrado</p>
                                                ) : sortByDateDesc(selectedPatient.pastAppointments).slice(0, 3).map((apt) => (
                                                    <AppointmentCard key={apt.id} appointment={apt} />
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>
                                </TabContent>

                                {/* ── Financeiro ── */}
                                <TabContent value='financial'>
                                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
                                        <SectionCard icon={<HiOutlineCurrencyDollar />} title='Resumo' subtitle='Posição financeira atual' color='emerald' className='lg:col-span-1'>
                                            <div className={`p-4 rounded-xl font-bold text-xl ${
                                                selectedPatient.financial.balance >= 0
                                                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:border-green-800 dark:text-green-400'
                                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400'
                                            }`}>
                                                <p className='text-sm font-semibold mb-1'>Saldo Atual</p>
                                                <p>{selectedPatient.financial.balance >= 0 ? '+' : ''}R$ {selectedPatient.financial.balance.toFixed(2).replace('.', ',')}</p>
                                            </div>
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineCollection />} title='Todo Financeiro' subtitle='Histórico completo de movimentos' color='teal' className='lg:col-span-2'>
                                            <div className='space-y-2 max-h-[520px] overflow-y-auto pr-1'>
                                                {sortByDateDesc(selectedPatient.financial.history).map((item) => (
                                                    <div key={item.id} className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50'>
                                                        <div>
                                                            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>{item.description}</p>
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
                                        </SectionCard>
                                    </div>
                                </TabContent>

                                {/* ── Atendimentos ── */}
                                <TabContent value='appointments'>
                                    <div className='space-y-5'>
                                        <SectionCard icon={<HiOutlineClock />} title='Próximos Atendimentos' subtitle='Agenda futura do paciente' color='blue'>
                                            <div className='space-y-3'>
                                                {sortByDateAsc(selectedPatient.nextAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum agendamento futuro</p>
                                                ) : sortByDateAsc(selectedPatient.nextAppointments).map((apt) => (
                                                    <div key={apt.id} className='flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50'>
                                                        <div className='bg-blue-600 text-white rounded-xl p-2 text-center min-w-14'>
                                                            <p className='text-xs'>{formatDate(apt.date).slice(3)}</p>
                                                            <p className='font-bold text-lg leading-none'>{formatDate(apt.date).slice(0, 2)}</p>
                                                        </div>
                                                        <div className='flex-1'>
                                                            <p className='font-semibold text-gray-800 dark:text-gray-200 text-sm'>{apt.service}</p>
                                                            <p className='text-xs text-gray-500'>{apt.time} · {apt.professional}</p>
                                                        </div>
                                                        <Badge color='blue'>Agendado</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </SectionCard>

                                        <SectionCard icon={<HiOutlineClipboardList />} title='Todos os Atendimentos' subtitle='Histórico completo de consultas' color='violet'>
                                            <div className='space-y-3'>
                                                {sortByDateDesc(selectedPatient.pastAppointments).length === 0 ? (
                                                    <p className='text-gray-500 text-sm'>Nenhum atendimento registrado</p>
                                                ) : sortByDateDesc(selectedPatient.pastAppointments).map((apt) => (
                                                    <AppointmentCard key={apt.id} appointment={apt} />
                                                ))}
                                            </div>
                                        </SectionCard>
                                    </div>
                                </TabContent>

                                {/* ── Mídia ── */}
                                <TabContent value='media'>
                                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
                                        <SectionCard
                                            icon={<HiOutlineDocumentText />}
                                            title='Documentos do Paciente'
                                            subtitle='Arquivos e contratos'
                                            color='indigo'
                                            headerAction={
                                                <>
                                                    <input ref={documentInputRef} type='file' multiple className='hidden' onChange={handleUploadDocuments} />
                                                    <button onClick={() => documentInputRef.current?.click()}
                                                        className='flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition'>
                                                        <HiOutlinePlus className='w-3.5 h-3.5' />
                                                        Incluir
                                                    </button>
                                                </>
                                            }
                                        >
                                            {patientDocuments.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhum documento cadastrado.</p>
                                            ) : (
                                                <div className='space-y-2'>
                                                    {patientDocuments.map((doc) => (
                                                        <div key={doc.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40'>
                                                            <div className='flex items-center justify-between gap-2'>
                                                                <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-0 truncate'>{doc.name}</p>
                                                                <div className='flex items-center gap-2 flex-shrink-0'>
                                                                    {doc.source === 'print' && <Badge color='blue'>Impresso</Badge>}
                                                                    <FilePermissionPopover
                                                                        permissions={doc.permissions || []}
                                                                        onChange={(perms) => handleSetFilePermissions(doc.id, 'doc', perms)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className='text-xs text-gray-500 mt-1'>
                                                                Adicionado em {formatDate(doc.createdAt)} · {formatFileSize(doc.size)}
                                                            </p>
                                                            {doc.source === 'print' && (
                                                                <p className='text-xs text-indigo-600 dark:text-indigo-400 mt-1'>
                                                                    Rastro: {doc.templateType === 'contract' ? 'Contrato' : 'Receita'} "{doc.templateTitle}" impresso em {formatDateTime(doc.createdAtDateTime || `${doc.createdAt}T00:00:00`)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>

                                        <SectionCard
                                            icon={<HiOutlinePhotograph />}
                                            title='Imagens do Paciente'
                                            subtitle='Galeria clínica'
                                            color='rose'
                                            headerAction={
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex items-center rounded-xl border border-rose-200 dark:border-rose-800/50 overflow-hidden'>
                                                        {['list', 'thumbs'].map((mode) => (
                                                            <button key={mode} onClick={() => setImageViewMode(mode)}
                                                                className={`px-2.5 py-1.5 text-xs font-semibold transition ${
                                                                    imageViewMode === mode
                                                                        ? 'bg-rose-500 text-white'
                                                                        : 'bg-white dark:bg-transparent text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                                                                }`}>
                                                                {mode === 'list' ? 'Lista' : 'Thumbs'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input ref={imageInputRef} type='file' accept='image/*' multiple className='hidden' onChange={handleUploadImages} />
                                                    <button onClick={() => imageInputRef.current?.click()}
                                                        className='flex items-center gap-1.5 px-3 py-1.5 border-2 border-dashed border-rose-300 dark:border-rose-700 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition'>
                                                        <HiOutlinePlus className='w-3.5 h-3.5' />
                                                        Incluir
                                                    </button>
                                                </div>
                                            }
                                        >
                                            {patientImages.length === 0 ? (
                                                <p className='text-gray-500 text-sm'>Nenhuma imagem cadastrada.</p>
                                            ) : imageViewMode === 'list' ? (
                                                <div className='space-y-2'>
                                                    {patientImages.map((img) => (
                                                        <div key={img.id} className='p-3 rounded-xl border border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/40 flex items-center gap-3'>
                                                            <img src={img.url} alt={img.name} className='w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-600 flex-shrink-0' />
                                                            <div className='min-w-0 flex-1'>
                                                                <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate'>{img.name}</p>
                                                                <p className='text-xs text-gray-500 mt-1'>Adicionado em {formatDate(img.createdAt)} · {formatFileSize(img.size)}</p>
                                                            </div>
                                                            <FilePermissionPopover
                                                                permissions={img.permissions || []}
                                                                onChange={(perms) => handleSetFilePermissions(img.id, 'image', perms)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                    {patientImages.map((img) => (
                                                        <div key={img.id} className='rounded-xl border border-gray-200 dark:border-gray-700/50 overflow-hidden bg-gray-50 dark:bg-gray-800/40'>
                                                            <img src={img.url} alt={img.name} className='w-full h-36 object-cover' />
                                                            <div className='p-2.5'>
                                                                <div className='flex items-start justify-between gap-1'>
                                                                    <p className='text-sm font-semibold text-gray-800 dark:text-gray-200 truncate min-w-0'>{img.name}</p>
                                                                    <FilePermissionPopover
                                                                        permissions={img.permissions || []}
                                                                        onChange={(perms) => handleSetFilePermissions(img.id, 'image', perms)}
                                                                    />
                                                                </div>
                                                                <p className='text-xs text-gray-500'>Adicionado em {formatDate(img.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </SectionCard>
                                    </div>
                                </TabContent>

                            </div>
                        </Tabs>
                    </Card>
                </>
            )}

            {/* ── Empty state ── */}
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
