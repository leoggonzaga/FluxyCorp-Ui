import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Card, Input, Notification, Tabs, Badge, toast } from "@/components/ui"
import CreateButton from "@/components/ui/Button/CreateButton"
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from "react-icons/hi"

const initialTemplates = [
    {
        id: 1,
        type: "contract",
        title: "Contrato Padrao de Atendimento",
        description: "Contrato completo para servicos continuados",
        content: `# Contrato de Prestacao de Servicos

Pelo presente instrumento particular, as partes abaixo identificadas:

**CONTRATADA:** [CLINICA_NOME]
**CNPJ:** [CLINICA_CNPJ]

**CONTRATANTE:** [PACIENTE_NOME]
**CPF:** [PACIENTE_CPF]

## 1. Objeto
A CONTRATADA prestara os servicos clinicos acordados no plano de tratamento do paciente.

## 2. Condicoes Financeiras
Valor total estimado: [VALOR_TOTAL]
Forma de pagamento: [FORMA_PAGAMENTO]

## 3. Vigencia
Este contrato possui vigencia de [VIGENCIA_CONTRATO] a partir da assinatura.

Assinaturas:

__________________________________
[PACIENTE_NOME]

__________________________________
Responsavel tecnico - [PROFISSIONAL_NOME]`,
        updatedAt: "2026-04-16",
        active: true,
    },
    {
        id: 2,
        type: "prescription",
        title: "Receita Medica Simples",
        description: "Modelo para prescricoes de uso continuo",
        content: `# Receita Medica

Paciente: [PACIENTE_NOME]
Data: [DATA_ATUAL]
Profissional: [PROFISSIONAL_NOME]

## Prescricao
- [MEDICAMENTO_1] - [POSOLOGIA_1]
- [MEDICAMENTO_2] - [POSOLOGIA_2]

## Orientacoes
- Retornar em [RETORNO_DIAS] dias
- Em caso de reacao adversa, procurar atendimento imediato

Assinatura e carimbo:

__________________________________
[PROFISSIONAL_NOME]`,
        updatedAt: "2026-04-16",
        active: true,
    },
]

const variableTokens = [
    "[PACIENTE_NOME]",
    "[PACIENTE_CPF]",
    "[PACIENTE_NASCIMENTO]",
    "[PROFISSIONAL_NOME]",
    "[CLINICA_NOME]",
    "[CLINICA_CNPJ]",
    "[DATA_ATUAL]",
    "[VALOR_TOTAL]",
    "[FORMA_PAGAMENTO]",
    "[VIGENCIA_CONTRATO]",
]

const templateTypes = [
    { value: "contract", label: "Contrato" },
    { value: "prescription", label: "Receita" },
]

const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-")
    return `${d}/${m}/${y}`
}

const TemplateManagement = () => {
    const { TabNav, TabList, TabContent } = Tabs

    const [templates, setTemplates] = useState(initialTemplates)
    const [activeTab, setActiveTab] = useState("contract")
    const [selectedId, setSelectedId] = useState(initialTemplates[0]?.id || null)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        id: null,
        type: "contract",
        title: "",
        description: "",
        content: "",
    })

    const editorRef = useRef(null)

    useEffect(() => {
        const raw = localStorage.getItem("patient_record_templates")
        if (!raw) return

        try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
                setTemplates(parsed)
                setSelectedId(parsed[0]?.id || null)
            }
        } catch (error) {
            // Keep defaults if parsing fails.
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("patient_record_templates", JSON.stringify(templates))
    }, [templates])

    const filteredTemplates = useMemo(
        () => templates.filter((item) => item.type === activeTab),
        [templates, activeTab],
    )

    const selectedTemplate = useMemo(
        () => templates.find((item) => item.id === selectedId) || null,
        [templates, selectedId],
    )

    const startCreate = () => {
        setIsEditing(true)
        setFormData({
            id: null,
            type: activeTab,
            title: "",
            description: "",
            content: "",
        })
    }

    const startEdit = (template) => {
        setIsEditing(true)
        setFormData({
            id: template.id,
            type: template.type,
            title: template.title,
            description: template.description,
            content: template.content,
        })
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setFormData({ id: null, type: "contract", title: "", description: "", content: "" })
    }

    const saveTemplate = () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Informe titulo e conteudo do template.
                </Notification>,
            )
            return
        }

        if (formData.id) {
            setTemplates((prev) =>
                prev.map((item) =>
                    item.id === formData.id
                        ? {
                            ...item,
                            type: formData.type,
                            title: formData.title,
                            description: formData.description,
                            content: formData.content,
                            updatedAt: new Date().toISOString().slice(0, 10),
                        }
                        : item,
                ),
            )
            setSelectedId(formData.id)
            toast.push(
                <Notification type='success' title='Sucesso'>
                    Template atualizado com sucesso.
                </Notification>,
            )
        } else {
            const nextId = Math.max(...templates.map((item) => item.id), 0) + 1
            const newTemplate = {
                id: nextId,
                type: formData.type,
                title: formData.title,
                description: formData.description,
                content: formData.content,
                updatedAt: new Date().toISOString().slice(0, 10),
                active: true,
            }

            setTemplates((prev) => [newTemplate, ...prev])
            setSelectedId(nextId)
            toast.push(
                <Notification type='success' title='Sucesso'>
                    Template criado com sucesso.
                </Notification>,
            )
        }

        setIsEditing(false)
    }

    const removeTemplate = (id) => {
        setTemplates((prev) => prev.filter((item) => item.id !== id))
        if (selectedId === id) {
            const next = templates.find((item) => item.id !== id && item.type === activeTab)
            setSelectedId(next?.id || null)
        }
        toast.push(
            <Notification type='success' title='Sucesso'>
                Template removido.
            </Notification>,
        )
    }

    const insertAtCursor = (text) => {
        const editor = editorRef.current
        if (!editor) {
            setFormData((prev) => ({ ...prev, content: `${prev.content}${text}` }))
            return
        }

        const start = editor.selectionStart
        const end = editor.selectionEnd

        setFormData((prev) => {
            const newContent = `${prev.content.slice(0, start)}${text}${prev.content.slice(end)}`
            return { ...prev, content: newContent }
        })

        setTimeout(() => {
            editor.focus()
            const cursorPos = start + text.length
            editor.setSelectionRange(cursorPos, cursorPos)
        }, 0)
    }

    const applyFormat = (type) => {
        const editor = editorRef.current
        if (!editor) return

        const start = editor.selectionStart
        const end = editor.selectionEnd
        const selectedText = formData.content.slice(start, end)

        let replacement = selectedText
        if (type === "bold") replacement = `**${selectedText || "texto"}**`
        if (type === "title") replacement = `## ${selectedText || "Titulo"}`
        if (type === "list") replacement = `- ${selectedText || "Item"}`
        if (type === "number") replacement = `1. ${selectedText || "Item"}`
        if (type === "section") replacement = `\n---\n${selectedText}`
        if (type === "signature") replacement = `\n\n__________________________________\nAssinatura\n`

        setFormData((prev) => {
            const newContent = `${prev.content.slice(0, start)}${replacement}${prev.content.slice(end)}`
            return { ...prev, content: newContent }
        })

        setTimeout(() => {
            editor.focus()
            const cursorPos = start + replacement.length
            editor.setSelectionRange(cursorPos, cursorPos)
        }, 0)
    }

    const renderTemplateEditor = () => (
        <Card>
            <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Tipo do Template</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                            className='px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold w-full'
                        >
                            {templateTypes.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Titulo</label>
                        <Input
                            value={formData.title}
                            placeholder='Ex: Contrato de Prestacao de Servico Premium'
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        />
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Descricao</label>
                    <Input
                        value={formData.description}
                        placeholder='Resumo para facilitar identificacao do modelo'
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Ferramentas de Formatacao</label>
                    <div className='flex flex-wrap gap-2'>
                        <Button size='xs' onClick={() => applyFormat("title")}>Titulo</Button>
                        <Button size='xs' onClick={() => applyFormat("bold")}>Negrito</Button>
                        <Button size='xs' onClick={() => applyFormat("list")}>Lista</Button>
                        <Button size='xs' onClick={() => applyFormat("number")}>Numeracao</Button>
                        <Button size='xs' onClick={() => applyFormat("section")}>Secao</Button>
                        <Button size='xs' onClick={() => applyFormat("signature")}>Assinatura</Button>
                    </div>
                </div>

                <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-2'>Variaveis do Prontuario</label>
                    <div className='flex flex-wrap gap-2'>
                        {variableTokens.map((token) => (
                            <button
                                key={token}
                                onClick={() => insertAtCursor(token)}
                                className='px-2 py-1 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition'
                            >
                                {token}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Conteudo do Template</label>
                        <Input
                            textArea
                            rows={18}
                            ref={editorRef}
                            value={formData.content}
                            placeholder='Escreva o template completo com paragrafos, clausulas e variaveis.'
                            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Preview</label>
                        <Card className='bg-gray-50 border border-gray-200 h-[100%]'>
                            <div className='whitespace-pre-wrap text-sm text-gray-700 leading-relaxed min-h-[350px]'>
                                {formData.content || "O preview aparecera aqui conforme voce digita o template."}
                            </div>
                        </Card>
                    </div>
                </div>

                <div className='flex justify-end gap-2'>
                    <Button onClick={cancelEdit} icon={<HiOutlineX />}>Cancelar</Button>
                    <Button variant='solid' onClick={saveTemplate} icon={<HiOutlineCheck />}>Salvar Template</Button>
                </div>
            </div>
        </Card>
    )

    return (
        <div className='space-y-6'>
            <Card>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-800'>Templates de Contrato e Receita</h2>
                        <p className='text-sm text-gray-600 mt-1'>Crie modelos formatados para uso no prontuario do paciente.</p>
                    </div>
                    {!isEditing && (
                        <CreateButton onClick={startCreate}>
                            Novo Template
                        </CreateButton>
                    )}
                </div>
            </Card>

            <Tabs value={activeTab} onChange={(val) => setActiveTab(val)}>
                <TabList>
                    <div className='flex items-center gap-2'>
                        <TabNav value='contract'>Contratos</TabNav>
                        <TabNav value='prescription'>Receitas</TabNav>
                    </div>
                </TabList>

                <div className='pt-4'>
                    <TabContent value='contract'>
                        {isEditing ? (
                            renderTemplateEditor()
                        ) : (
                            <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                                <Card className='xl:col-span-1'>
                                    <h3 className='text-lg font-bold text-gray-800 mb-3'>Modelos Cadastrados</h3>
                                    <div className='space-y-2 max-h-[520px] overflow-y-auto pr-1'>
                                        {filteredTemplates.length === 0 ? (
                                            <p className='text-sm text-gray-500'>Nenhum template cadastrado para esta aba.</p>
                                        ) : (
                                            filteredTemplates.map((template) => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => setSelectedId(template.id)}
                                                    className={`w-full text-left p-3 rounded-lg border transition ${selectedId === template.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                                                >
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <p className='font-semibold text-sm text-gray-800'>{template.title}</p>
                                                        <Badge color={template.active ? "green" : "red"}>
                                                            {template.active ? "Ativo" : "Inativo"}
                                                        </Badge>
                                                    </div>
                                                    <p className='text-xs text-gray-500 mt-1'>{template.description}</p>
                                                    <p className='text-xs text-gray-500 mt-1'>Atualizado em {formatDate(template.updatedAt)}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </Card>

                                <Card className='xl:col-span-2'>
                                    {selectedTemplate ? (
                                        <div className='space-y-4'>
                                            <div className='flex items-start justify-between gap-3'>
                                                <div>
                                                    <h3 className='text-lg font-bold text-gray-800'>{selectedTemplate.title}</h3>
                                                    <p className='text-sm text-gray-600'>{selectedTemplate.description}</p>
                                                    <p className='text-xs text-gray-500 mt-1'>Atualizado em {formatDate(selectedTemplate.updatedAt)}</p>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button size='xs' icon={<HiOutlinePencil />} onClick={() => startEdit(selectedTemplate)}>
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size='xs'
                                                        icon={<HiOutlineTrash />}
                                                        className='text-red-600 hover:text-red-700'
                                                        onClick={() => removeTemplate(selectedTemplate.id)}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            </div>

                                            <Card className='bg-gray-50 border border-gray-200'>
                                                <div className='whitespace-pre-wrap text-sm text-gray-700 leading-relaxed'>
                                                    {selectedTemplate.content}
                                                </div>
                                            </Card>
                                        </div>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Selecione um template na lista para visualizar.</p>
                                    )}
                                </Card>
                            </div>
                        )}
                    </TabContent>

                    <TabContent value='prescription'>
                        {isEditing ? (
                            renderTemplateEditor()
                        ) : (
                            <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                                <Card className='xl:col-span-1'>
                                    <h3 className='text-lg font-bold text-gray-800 mb-3'>Modelos Cadastrados</h3>
                                    <div className='space-y-2 max-h-[520px] overflow-y-auto pr-1'>
                                        {filteredTemplates.length === 0 ? (
                                            <p className='text-sm text-gray-500'>Nenhum template cadastrado para esta aba.</p>
                                        ) : (
                                            filteredTemplates.map((template) => (
                                                <button
                                                    key={template.id}
                                                    onClick={() => setSelectedId(template.id)}
                                                    className={`w-full text-left p-3 rounded-lg border transition ${selectedId === template.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                                                >
                                                    <div className='flex items-center justify-between gap-2'>
                                                        <p className='font-semibold text-sm text-gray-800'>{template.title}</p>
                                                        <Badge color={template.active ? "green" : "red"}>
                                                            {template.active ? "Ativo" : "Inativo"}
                                                        </Badge>
                                                    </div>
                                                    <p className='text-xs text-gray-500 mt-1'>{template.description}</p>
                                                    <p className='text-xs text-gray-500 mt-1'>Atualizado em {formatDate(template.updatedAt)}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </Card>

                                <Card className='xl:col-span-2'>
                                    {selectedTemplate ? (
                                        <div className='space-y-4'>
                                            <div className='flex items-start justify-between gap-3'>
                                                <div>
                                                    <h3 className='text-lg font-bold text-gray-800'>{selectedTemplate.title}</h3>
                                                    <p className='text-sm text-gray-600'>{selectedTemplate.description}</p>
                                                    <p className='text-xs text-gray-500 mt-1'>Atualizado em {formatDate(selectedTemplate.updatedAt)}</p>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button size='xs' icon={<HiOutlinePencil />} onClick={() => startEdit(selectedTemplate)}>
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size='xs'
                                                        icon={<HiOutlineTrash />}
                                                        className='text-red-600 hover:text-red-700'
                                                        onClick={() => removeTemplate(selectedTemplate.id)}
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            </div>

                                            <Card className='bg-gray-50 border border-gray-200'>
                                                <div className='whitespace-pre-wrap text-sm text-gray-700 leading-relaxed'>
                                                    {selectedTemplate.content}
                                                </div>
                                            </Card>
                                        </div>
                                    ) : (
                                        <p className='text-sm text-gray-500'>Selecione um template na lista para visualizar.</p>
                                    )}
                                </Card>
                            </div>
                        )}
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

export default TemplateManagement
