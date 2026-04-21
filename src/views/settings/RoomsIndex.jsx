import { useEffect, useState } from 'react'
import { Card, Notification, toast } from '@/components/ui'
import { Pattern1 } from '@/components/shared/listPatterns'
import {
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineHome,
    HiOutlineX,
    HiOutlineCheckCircle,
    HiOutlineLightningBolt,
    HiOutlineUserGroup,
} from 'react-icons/hi'
import { roomsGetAll, roomsCreate, roomsUpdate, roomsDelete } from '@/api/enterprise/EnterpriseService'

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ icon, message, sub, action }) => (
    <div className='flex flex-col items-center justify-center py-10 gap-2.5 select-none'>
        <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600'>
            <span className='text-2xl'>{icon}</span>
        </div>
        <div className='text-center'>
            <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>{message}</p>
            {sub && <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{sub}</p>}
        </div>
        {action && <div className='mt-1'>{action}</div>}
    </div>
)

// ─── helpers ─────────────────────────────────────────────────────────────────

const inputCls =
    'w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition'

const inputClsAmber =
    'w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition'

const EMPTY_FORM = { name: '', number: '', capacity: '', timeInterval: '', isAvailable: true }

// ─── RoomDialog ───────────────────────────────────────────────────────────────

const RoomDialog = ({ open, onClose, onSaved, initial }) => {
    const isEdit = !!initial
    const accent = isEdit ? 'amber' : 'violet'
    const ic = isEdit ? inputClsAmber : inputCls

    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setForm(
                initial
                    ? {
                          name: initial.name ?? '',
                          number: String(initial.number ?? ''),
                          capacity: String(initial.capacity ?? ''),
                          timeInterval: String(initial.timeInterval ?? ''),
                          isAvailable: initial.isAvailable ?? true,
                      }
                    : EMPTY_FORM,
            )
        }
    }, [open, initial])

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

    const valid = form.name.trim() && form.number !== ''

    const submit = async () => {
        if (!valid) return
        setSaving(true)
        const payload = {
            name: form.name.trim(),
            number: Number(form.number),
            capacity: Number(form.capacity) || 0,
            timeInterval: Number(form.timeInterval) || 0,
            isAvailable: form.isAvailable,
        }
        const result = isEdit
            ? await roomsUpdate(initial.publicId, payload)
            : await roomsCreate(payload)
        setSaving(false)
        if (result !== null && result !== undefined) {
            onSaved(isEdit ? { ...initial, ...payload } : result)
            onClose()
        }
    }

    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !saving && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden'>
                {/* Header */}
                <div className='flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEdit ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-violet-100 dark:bg-violet-900/30'}`}>
                        <HiOutlineHome className={`w-5 h-5 ${isEdit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-600 dark:text-violet-400'}`} />
                    </div>
                    <div className='flex-1'>
                        <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>
                            {isEdit ? 'Editar Sala' : 'Nova Sala'}
                        </h3>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            {isEdit ? 'Atualize os dados da sala' : 'Preencha os dados para cadastrar a sala'}
                        </p>
                    </div>
                    <button
                        onClick={() => !saving && onClose()}
                        className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition'
                    >
                        <HiOutlineX className='w-4 h-4' />
                    </button>
                </div>

                {/* Body */}
                <div className='px-6 py-5 space-y-4'>
                    {/* Nome */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                            Nome da sala <span className='text-red-400'>*</span>
                        </label>
                        <input
                            className={ic}
                            placeholder='Ex: Consultório 1, Sala de Raio-X…'
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Número + Capacidade */}
                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                                Número <span className='text-red-400'>*</span>
                            </label>
                            <input
                                className={ic}
                                type='number'
                                min='1'
                                placeholder='101'
                                value={form.number}
                                onChange={(e) => set('number', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                                Capacidade (pessoas)
                            </label>
                            <input
                                className={ic}
                                type='number'
                                min='0'
                                placeholder='0'
                                value={form.capacity}
                                onChange={(e) => set('capacity', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Intervalo de tempo */}
                    <div>
                        <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5'>
                            Intervalo de tempo (min)
                        </label>
                        <input
                            className={ic}
                            type='number'
                            min='0'
                            step='5'
                            placeholder='Ex: 30'
                            value={form.timeInterval}
                            onChange={(e) => set('timeInterval', e.target.value)}
                        />
                        <p className='text-[11px] text-gray-400 mt-1'>Tempo de intervalo entre atendimentos nesta sala</p>
                    </div>

                    {/* Disponível toggle */}
                    <div className='flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50'>
                        <div className='flex items-center gap-2.5'>
                            <HiOutlineCheckCircle className={`w-4 h-4 ${form.isAvailable ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`} />
                            <div>
                                <p className='text-sm font-medium text-gray-700 dark:text-gray-200'>Disponível para agendamento</p>
                                <p className='text-[11px] text-gray-400'>Sala aparece como opção ao criar agendamentos</p>
                            </div>
                        </div>
                        <button
                            type='button'
                            onClick={() => set('isAvailable', !form.isAvailable)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.isAvailable ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex justify-end gap-2 px-6 pb-5'>
                    <button
                        onClick={() => !saving && onClose()}
                        disabled={saving}
                        className='px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={submit}
                        disabled={!valid || saving}
                        className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                            isEdit
                                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/20'
                                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-violet-900/20'
                        }`}
                    >
                        {saving && <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />}
                        {isEdit ? 'Salvar alterações' : 'Criar sala'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── DeleteDialog ─────────────────────────────────────────────────────────────

const DeleteDialog = ({ room, onClose, onDeleted }) => {
    const [deleting, setDeleting] = useState(false)

    const confirm = async () => {
        setDeleting(true)
        const result = await roomsDelete(room.publicId)
        setDeleting(false)
        if (result !== null && result !== undefined) {
            onDeleted(room.publicId)
            onClose()
        }
    }

    if (!room) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => !deleting && onClose()} />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden'>
                <div className='px-6 pt-6 pb-2 text-center'>
                    <div className='w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3'>
                        <HiOutlineTrash className='w-6 h-6 text-red-500' />
                    </div>
                    <h3 className='font-bold text-gray-800 dark:text-gray-100 text-base'>Remover sala</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1.5'>
                        Deseja remover <strong className='text-gray-700 dark:text-gray-200'>{room.name}</strong>? Esta ação não pode ser desfeita.
                    </p>
                </div>
                <div className='flex gap-2 px-6 pb-5 pt-4'>
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className='flex-1 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition'
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirm}
                        disabled={deleting}
                        className='flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition shadow-sm flex items-center justify-center gap-2'
                    >
                        {deleting && <span className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin' />}
                        Remover
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const RoomsIndex = () => {
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [createOpen, setCreateOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState(null)
    const [deletingRoom, setDeletingRoom] = useState(null)

    const load = async () => {
        setLoading(true)
        const data = await roomsGetAll().catch(() => null)
        setLoading(false)
        if (Array.isArray(data)) setRooms(data)
    }

    useEffect(() => { load() }, [])

    const filtered = rooms.filter((r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.number).includes(search),
    )

    const toItem = (r) => ({
        id: r.publicId,
        name: r.name,
        email: `Sala nº ${r.number}`,
        emailIcon: HiOutlineHome,
        meta: r.capacity > 0 ? `${r.capacity} pessoa${r.capacity !== 1 ? 's' : ''}` : 'Sem limite de capacidade',
        metaIcon: HiOutlineUserGroup,
        badge: r.timeInterval > 0 ? `${r.timeInterval} min intervalo` : null,
        badgeIcon: HiOutlineLightningBolt,
        status: r.isAvailable ? 'ativo' : 'inativo',
        _raw: r,
    })

    const actions = [
        {
            key: 'edit',
            icon: <HiOutlinePencil />,
            tooltip: 'Editar',
            onClick: (item) => setEditingRoom(item._raw),
        },
        {
            key: 'delete',
            icon: <HiOutlineTrash />,
            tooltip: 'Remover',
            onClick: (item) => setDeletingRoom(item._raw),
        },
    ]

    const handleCreated = (room) => {
        setRooms((prev) => [room, ...prev])
        toast.push(
            <Notification type='success' title='Sala criada'>
                <strong>{room.name}</strong> cadastrada com sucesso.
            </Notification>,
            { placement: 'top-center' },
        )
    }

    const handleUpdated = (updated) => {
        setRooms((prev) => prev.map((r) => (r.publicId === updated.publicId ? { ...r, ...updated } : r)))
        toast.push(
            <Notification type='success' title='Sala atualizada'>
                Dados de <strong>{updated.name}</strong> salvos.
            </Notification>,
            { placement: 'top-center' },
        )
    }

    const handleDeleted = (publicId) => {
        setRooms((prev) => prev.filter((r) => r.publicId !== publicId))
        toast.push(
            <Notification type='success' title='Sala removida' />,
            { placement: 'top-center' },
        )
    }

    return (
        <div className='space-y-4'>
            <RoomDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSaved={handleCreated}
            />
            <RoomDialog
                open={!!editingRoom}
                initial={editingRoom}
                onClose={() => setEditingRoom(null)}
                onSaved={handleUpdated}
            />
            <DeleteDialog
                room={deletingRoom}
                onClose={() => setDeletingRoom(null)}
                onDeleted={handleDeleted}
            />

            {/* Barra de busca + ação */}
            <div className='flex items-center gap-3'>
                <div className='flex-1 relative'>
                    <HiOutlineHome className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                    <input
                        className='w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none transition'
                        placeholder='Buscar por nome ou número…'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className='flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition shadow-sm shadow-violet-200 whitespace-nowrap'
                >
                    <HiOutlinePlus className='w-4 h-4' />
                    Nova Sala
                </button>
            </div>

            {/* Lista */}
            <Card className='border border-gray-100 dark:border-gray-700/50'>
                {!loading && filtered.length === 0 && search ? (
                    <EmptyState
                        icon={<HiOutlineHome />}
                        message='Nenhuma sala encontrada'
                        sub={`Não há salas com "${search}"`}
                    />
                ) : !loading && rooms.length === 0 ? (
                    <EmptyState
                        icon={<HiOutlineHome />}
                        message='Nenhuma sala cadastrada'
                        sub='Crie a primeira sala para começar a organizar os atendimentos'
                        action={
                            <button
                                onClick={() => setCreateOpen(true)}
                                className='px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition shadow-sm'
                            >
                                Criar primeira sala
                            </button>
                        }
                    />
                ) : (
                    <Pattern1
                        items={filtered.map(toItem)}
                        loading={loading}
                        actions={actions}
                        onItemClick={(item) => setEditingRoom(item._raw)}
                        emptyMessage='Nenhuma sala encontrada'
                    />
                )}
            </Card>
        </div>
    )
}

export default RoomsIndex
