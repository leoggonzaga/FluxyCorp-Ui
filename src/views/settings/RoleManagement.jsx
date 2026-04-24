import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineChevronDown } from "react-icons/hi"
import { Button, Card, Input, Notification, toast } from "@/components/ui"
import CreateButton from '@/components/ui/Button/CreateButton'
import { useState } from "react"

const RoleManagement = () => {
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: 'Administrador',
            description: 'Acesso total ao sistema',
            menus: [
                { id: 'dashboard', name: 'Dashboard', access: 'full' },
                { id: 'employees', name: 'Funcionários', access: 'full' },
                { id: 'settings', name: 'Configurações', access: 'full' },
                { id: 'reports', name: 'Relatórios', access: 'full' },
            ]
        },
        {
            id: 2,
            name: 'Gerente',
            description: 'Gerenciamento de equipes',
            menus: [
                { id: 'dashboard', name: 'Dashboard', access: 'read' },
                { id: 'employees', name: 'Funcionários', access: 'write' },
                { id: 'reports', name: 'Relatórios', access: 'read' },
            ]
        },
    ])

    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [expandedId, setExpandedId] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [allMenus] = useState([
        { id: 'dashboard', name: 'Dashboard' },
        { id: 'employees', name: 'Funcionários' },
        { id: 'payroll', name: 'Folha de Pagamento' },
        { id: 'attendance', name: 'Presença' },
        { id: 'schedule', name: 'Escala' },
        { id: 'settings', name: 'Configurações' },
        { id: 'reports', name: 'Relatórios' },
        { id: 'audit', name: 'Auditoria' },
    ])

    const accessLevels = [
        { value: 'none', label: 'Sem Acesso' },
        { value: 'read', label: 'Leitura' },
        { value: 'write', label: 'Leitura e Escrita' },
        { value: 'full', label: 'Acesso Total' },
    ]

    const handleAddRole = () => {
        if (!formData.name) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Preencha o nome do perfil!
                </Notification>
            )
            return
        }

        const newRole = {
            id: Math.max(...roles.map(r => r.id), 0) + 1,
            name: formData.name,
            description: formData.description,
            menus: allMenus.map(menu => ({ ...menu, access: 'none' }))
        }

        setRoles([...roles, newRole])
        setFormData({ name: '', description: '' })
        setIsAdding(false)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Perfil criado com sucesso!
            </Notification>
        )
    }

    const handleUpdateRole = (id) => {
        if (!formData.name) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Preencha o nome do perfil!
                </Notification>
            )
            return
        }

        setRoles(roles.map(r =>
            r.id === id
                ? { ...r, name: formData.name, description: formData.description }
                : r
        ))
        setFormData({ name: '', description: '' })
        setEditingId(null)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Perfil atualizado com sucesso!
            </Notification>
        )
    }

    const handleDeleteRole = (id) => {
        setRoles(roles.filter(r => r.id !== id))
        toast.push(
            <Notification type='success' title='Sucesso'>
                Perfil removido com sucesso!
            </Notification>
        )
    }

    const handleUpdateMenuAccess = (roleId, menuId, access) => {
        setRoles(roles.map(r =>
            r.id === roleId
                ? {
                    ...r,
                    menus: r.menus.map(m =>
                        m.id === menuId ? { ...m, access } : m
                    )
                }
                : r
        ))
    }

    const handleStartEdit = (role) => {
        setEditingId(role.id)
        setFormData({ name: role.name, description: role.description })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData({ name: '', description: '' })
    }

    return (
        <div className='space-y-6'>
            {/* Header */}
            <Card>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-800'>Gerenciamento de Perfis</h2>
                        <p className='text-sm text-gray-600 mt-1'>Configure os perfis de acesso e suas permissões de menu</p>
                    </div>
                    {!isAdding && (
                        <CreateButton onClick={() => setIsAdding(true)}>
                            Novo Perfil
                        </CreateButton>
                    )}
                </div>
            </Card>

            {/* Formulário de Adição */}
            {isAdding && (
                <Card className='bg-blue-50 border border-blue-200'>
                    <div className='space-y-4'>
                        <h3 className='font-bold text-base text-gray-800'>Criar Novo Perfil</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>Nome do Perfil</label>
                                <Input
                                    placeholder='Ex: Supervisor'
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-semibold text-gray-700 mb-2'>Descrição</label>
                                <Input
                                    placeholder='Ex: Supervisão de processos'
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className='flex gap-2 justify-end'>
                            <Button size='sm' onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button size='sm' variant='solid' onClick={handleAddRole}>Criar Perfil</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Lista de Perfis */}
            <div className='space-y-4'>
                {roles.map((role) => (
                    <Card key={role.id} className=''>
                        {/* Header do Perfil */}
                        <div className='flex items-center justify-between mb-4 pb-4 border-b border-gray-200'>
                            <div className='flex-1'>
                                {editingId === role.id ? (
                                    <div className='space-y-3'>
                                        <div>
                                            <label className='block text-sm font-semibold text-gray-700 mb-1'>Nome</label>
                                            <Input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className='block text-sm font-semibold text-gray-700 mb-1'>Descrição</label>
                                            <Input
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            />
                                        </div>
                                        <div className='flex gap-2'>
                                            <Button size='sm' onClick={handleCancelEdit}>Cancelar</Button>
                                            <Button size='sm' variant='solid' onClick={() => handleUpdateRole(role.id)}>Salvar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className='text-lg font-bold text-gray-800'>{role.name}</h3>
                                        <p className='text-sm text-gray-600'>{role.description}</p>
                                    </div>
                                )}
                            </div>
                            {editingId !== role.id && (
                                <div className='flex gap-2'>
                                    <Button
                                        size='xs'
                                        variant='plain'
                                        onClick={() => setExpandedId(expandedId === role.id ? null : role.id)}
                                        icon={<HiOutlineChevronDown className={`transition-transform ${expandedId === role.id ? 'rotate-180' : ''}`} />}
                                    >
                                        {expandedId === role.id ? 'Ocultar' : 'Expandir'}
                                    </Button>
                                    <Button
                                        size='xs'
                                        variant='plain'
                                        onClick={() => handleStartEdit(role)}
                                        icon={<HiOutlinePencil />}
                                        className='text-blue-600 hover:text-blue-800'
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size='xs'
                                        variant='plain'
                                        onClick={() => handleDeleteRole(role.id)}
                                        icon={<HiOutlineTrash />}
                                        className='text-red-600 hover:text-red-800'
                                    >
                                        Deletar
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Permissões de Menu */}
                        {expandedId === role.id && editingId !== role.id && (
                            <div className='space-y-3'>
                                <h4 className='font-semibold text-gray-800 mb-4'>Permissões de Menu</h4>
                                {role.menus && role.menus.length > 0 ? (
                                    <div className='space-y-3'>
                                        {role.menus.map((menu) => (
                                            <div key={menu.id} className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'>
                                                <span className='font-semibold text-gray-700'>{menu.name}</span>
                                                <select
                                                    value={menu.access}
                                                    onChange={(e) => handleUpdateMenuAccess(role.id, menu.id, e.target.value)}
                                                    className='px-3 py-1 border border-gray-300 rounded-lg text-sm font-semibold'
                                                >
                                                    {accessLevels.map(level => (
                                                        <option key={level.value} value={level.value}>
                                                            {level.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-sm text-gray-500'>Nenhum menu atribuído</p>
                                )}
                            </div>
                        )}

                        {/* Expandir para adicionar menus */}
                        {expandedId === role.id && editingId !== role.id && role.menus.length < allMenus.length && (
                            <div className='mt-4 pt-4 border-t border-gray-200'>
                                <p className='text-sm text-gray-600 mb-3'>Menus disponíveis:</p>
                                <div className='space-y-2'>
                                    {allMenus
                                        .filter(m => !role.menus.some(rm => rm.id === m.id))
                                        .map(menu => (
                                            <Button
                                                key={menu.id}
                                                size='sm'
                                                variant='plain'
                                                onClick={() => {
                                                    setRoles(roles.map(r =>
                                                        r.id === role.id
                                                            ? {
                                                                ...r,
                                                                menus: [...r.menus, { ...menu, access: 'read' }]
                                                            }
                                                            : r
                                                    ))
                                                }}
                                                className='w-full justify-start text-blue-600 hover:text-blue-800'
                                                icon={<HiOutlinePlus />}
                                            >
                                                Adicionar {menu.name}
                                            </Button>
                                        ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {roles.length === 0 && !isAdding && (
                <Card className='p-8 text-center'>
                    <p className='text-gray-600'>Nenhum perfil criado ainda</p>
                    <CreateButton onClick={() => setIsAdding(true)} className='mt-4'>
                        Criar Primeiro Perfil
                        </CreateButton>
                </Card>
            )}
        </div>
    )
}

export default RoleManagement
