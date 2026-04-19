import { useEffect, useState } from 'react'
import { HiOutlineCheck, HiOutlinePencil, HiOutlinePlus, HiOutlineTag } from 'react-icons/hi'
import { Notification, toast } from '@/components/ui'
import {
    consultationTypeApiCreate,
    consultationTypeApiUpdate,
    consultationCategoryApiGetAll,
} from '@/api/consultation/consultationService'

const PRESET_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#3b82f6', '#64748b', '#1e293b',
]

const ConsultationTypeUpsert = ({ data, onClose, onSaved }) => {
    const isEdit = !!data

    const [title, setTitle]       = useState(data?.name ?? data?.title ?? '')
    const [color, setColor]       = useState(data?.color ?? '#6366f1')
    const [categoryId, setCategoryId] = useState(data?.categoryId ?? '')
    const [categories, setCategories] = useState([])
    const [catsLoading, setCatsLoading] = useState(true)
    const [saving, setSaving]     = useState(false)
    const [errors, setErrors]     = useState({})

    useEffect(() => {
        consultationCategoryApiGetAll()
            .then((res) => setCategories(Array.isArray(res) ? res : []))
            .catch(() => {})
            .finally(() => setCatsLoading(false))
    }, [])

    const validate = () => {
        const e = {}
        if (!title.trim()) e.title = 'O título é obrigatório'
        if (!categoryId)   e.category = 'Selecione uma categoria'
        return e
    }

    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setSaving(true)
        try {
            const payload = { name: title.trim(), color, categoryId: Number(categoryId) }
            if (isEdit) {
                await consultationTypeApiUpdate(data.id ?? data.publicId, payload)
            } else {
                await consultationTypeApiCreate(payload)
            }
            toast.push(
                <Notification type='success' title={isEdit ? 'Tipo atualizado' : 'Tipo criado'} />,
                { placement: 'top-center' }
            )
            onSaved?.()
        } catch {
            toast.push(
                <Notification type='danger' title='Erro ao salvar' />,
                { placement: 'top-center' }
            )
        } finally {
            setSaving(false)
        }
    }

    const selectedCat = categories.find((c) => c.id === Number(categoryId))

    return (
        <div className='p-1'>
            {/* Header */}
            <div className='flex items-center gap-3 mb-6'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                    {isEdit
                        ? <HiOutlinePencil className='w-5 h-5 text-amber-600' />
                        : <HiOutlinePlus className='w-5 h-5 text-violet-600' />
                    }
                </div>
                <div>
                    <h4 className='font-bold text-gray-800 dark:text-gray-100'>
                        {isEdit ? 'Editar Tipo' : 'Novo Tipo de Atendimento'}
                    </h4>
                    <p className='text-xs text-gray-400 mt-0.5'>
                        {isEdit ? `Editando: ${data.name ?? data.title}` : 'Preencha os dados abaixo'}
                    </p>
                </div>
            </div>

            {/* Preview */}
            <div
                className='flex items-center gap-3 px-4 py-3 rounded-xl mb-5 border'
                style={{ backgroundColor: `${color}18`, borderColor: `${color}40` }}
            >
                <div className='w-8 h-8 rounded-lg flex-shrink-0 shadow-sm' style={{ backgroundColor: color }} />
                <div className='min-w-0'>
                    <span className='text-sm font-semibold block truncate' style={{ color }}>
                        {title.trim() || 'Prévia do tipo…'}
                    </span>
                    {selectedCat && (
                        <span className='text-[11px] text-gray-400 flex items-center gap-1 mt-0.5'>
                            <HiOutlineTag className='w-3 h-3' />
                            {selectedCat.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className='mb-4'>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                    Título <span className='text-rose-500'>*</span>
                </label>
                <input
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })) }}
                    placeholder='Ex: Avaliação, Cirurgia, Retorno…'
                    className={[
                        'w-full px-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900',
                        'text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all',
                        errors.title
                            ? 'border-rose-400 focus:ring-rose-400/30'
                            : 'border-gray-200 dark:border-gray-700 focus:ring-violet-400/30 focus:border-violet-400',
                    ].join(' ')}
                    autoFocus
                />
                {errors.title && <p className='text-xs text-rose-500 mt-1'>{errors.title}</p>}
            </div>

            {/* Category */}
            <div className='mb-4'>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'>
                    Categoria <span className='text-rose-500'>*</span>
                </label>
                {catsLoading ? (
                    <div className='h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse' />
                ) : categories.length === 0 ? (
                    <div className='px-3 py-2.5 text-sm rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'>
                        Nenhuma categoria cadastrada. Crie uma categoria primeiro.
                    </div>
                ) : (
                    <select
                        value={categoryId}
                        onChange={(e) => { setCategoryId(e.target.value); setErrors((p) => ({ ...p, category: '' })) }}
                        className={[
                            'w-full px-3 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900',
                            'text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer',
                            errors.category
                                ? 'border-rose-400 focus:ring-rose-400/30'
                                : 'border-gray-200 dark:border-gray-700 focus:ring-violet-400/30 focus:border-violet-400',
                        ].join(' ')}
                    >
                        <option value=''>Selecione uma categoria…</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}
                {errors.category && <p className='text-xs text-rose-500 mt-1'>{errors.category}</p>}
            </div>

            {/* Color picker */}
            <div className='mb-6'>
                <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                    Cor de identificação
                </label>
                <div className='flex flex-wrap gap-2'>
                    {PRESET_COLORS.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className='w-8 h-8 rounded-lg transition-all hover:scale-110 relative'
                            style={{ backgroundColor: c }}
                            title={c}
                        >
                            {color === c && (
                                <span className='absolute inset-0 flex items-center justify-center'>
                                    <HiOutlineCheck className='w-4 h-4 text-white drop-shadow' />
                                </span>
                            )}
                        </button>
                    ))}
                    <label
                        className='w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 transition overflow-hidden'
                        title='Cor personalizada'
                    >
                        <input
                            type='color'
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className='opacity-0 absolute w-0 h-0'
                        />
                        <div className='w-4 h-4 rounded-sm' style={{ backgroundColor: !PRESET_COLORS.includes(color) ? color : 'transparent' }} />
                    </label>
                </div>
            </div>

            {/* Footer */}
            <div className='flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800'>
                <button
                    onClick={onClose}
                    disabled={saving}
                    className='px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition'
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving || (categories.length === 0 && !catsLoading)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition shadow-sm ${
                        isEdit ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                    }`}
                >
                    {saving ? (
                        <><div className='w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin' /> Salvando…</>
                    ) : (
                        <><HiOutlineCheck className='w-4 h-4' /> {isEdit ? 'Salvar Alterações' : 'Criar Tipo'}</>
                    )}
                </button>
            </div>
        </div>
    )
}

export default ConsultationTypeUpsert
