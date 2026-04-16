import { HiOutlineCheckCircle, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi"
import { Button, Card, Input, Checkbox, Select, Notification, toast } from "../../../../components/ui"
import { useState } from "react"

const EmployeeTabPermissions = ({ data }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [selectedRoles, setSelectedRoles] = useState(data?.roles || [])
    const [availableRoles, setAvailableRoles] = useState([
        { id: 1, name: 'Administrador', description: 'Acesso total ao sistema' },
        { id: 2, name: 'Gerente', description: 'Gerenciamento de equipes e recursos' },
        { id: 3, name: 'Supervisor', description: 'Supervisão de processos' },
        { id: 4, name: 'Operador', description: 'Execução de tarefas operacionais' },
        { id: 5, name: 'Visualizador', description: 'Apenas leitura de dados' },
        { id: 6, name: 'Consultor', description: 'Acesso a relatórios e consultas' },
    ])
    const [selectedRoleId, setSelectedRoleId] = useState('')

    const handleAddRole = () => {
        if (!selectedRoleId) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Selecione um perfil!
                </Notification>
            )
            return
        }

        const roleToAdd = availableRoles.find(r => r.id === parseInt(selectedRoleId))
        if (selectedRoles.some(r => r.id === roleToAdd.id)) {
            toast.push(
                <Notification type='warning' title='Aviso'>
                    Este perfil já foi adicionado!
                </Notification>
            )
            return
        }

        setSelectedRoles([...selectedRoles, roleToAdd])
        setSelectedRoleId('')
        toast.push(
            <Notification type='success' title='Sucesso'>
                Perfil adicionado!
            </Notification>
        )
    }

    const handleRemoveRole = (roleId) => {
        setSelectedRoles(selectedRoles.filter(r => r.id !== roleId))
        toast.push(
            <Notification type='success' title='Sucesso'>
                Perfil removido!
            </Notification>
        )
    }

    const handleSave = async () => {
        console.log('Permissões salvas:', selectedRoles)
        toast.push(
            <Notification type='success' title='Sucesso'>
                Permissões do funcionário atualizadas com sucesso!
            </Notification>
        )
        setIsEditing(false)
    }

    const handleReset = () => {
        setSelectedRoles(data?.roles || [])
        setSelectedRoleId('')
    }

    return (
        <Card className='flex flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between w-full mb-4 pb-4 border-b border-gray-200'>
                <div>
                    <p className='font-semibold text-gray-700'>
                        Perfis Atribuídos: <span className='text-primary'>{selectedRoles.length}</span>
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        size="sm"
                        onClick={() => {
                            if (isEditing) handleReset()
                            setIsEditing(prev => !prev)
                        }}
                    >
                        {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                    {isEditing && (
                        <Button
                            size="sm"
                            variant="solid"
                            icon={<HiOutlineCheckCircle />}
                            onClick={handleSave}
                        >
                            Salvar
                        </Button>
                    )}
                </div>
            </div>

            {/* Formulário de Adição */}
            {isEditing && (
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6'>
                    <div className='space-y-3'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-700 mb-2'>
                                Adicionar Perfil
                            </label>
                            <div className='flex gap-2'>
                                <div className='flex-1'>
                                    <Select
                                        value={selectedRoleId}
                                        onChange={(e) => setSelectedRoleId(e.target.value)}
                                    >
                                        <option value=''>-- Selecione um perfil --</option>
                                        {availableRoles
                                            .filter(role => !selectedRoles.some(r => r.id === role.id))
                                            .map(role => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name} - {role.description}
                                                </option>
                                            ))}
                                    </Select>
                                </div>
                                <Button
                                    size='sm'
                                    variant='solid'
                                    icon={<HiOutlinePlus />}
                                    onClick={handleAddRole}
                                    className='self-end'
                                >
                                    Adicionar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de Perfis */}
            {selectedRoles.length > 0 ? (
                <div className='space-y-3'>
                    <p className='font-semibold text-gray-700'>Perfis do Usuário</p>
                    {selectedRoles.map((role) => (
                        <div
                            key={role.id}
                            className='flex items-center justify-between p-4 bg-indigo-50 border border-indigo-200 rounded-lg'
                        >
                            <div>
                                <p className='font-semibold text-gray-800'>{role.name}</p>
                                <p className='text-sm text-gray-600'>{role.description}</p>
                            </div>
                            {isEditing && (
                                <Button
                                    size='xs'
                                    variant='plain'
                                    onClick={() => handleRemoveRole(role.id)}
                                    className='text-red-600 hover:text-red-800'
                                    icon={<HiOutlineTrash />}
                                >
                                    Remover
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-6 text-center bg-gray-50 border border-gray-200 rounded-lg'>
                    <p className='text-gray-600'>Nenhum perfil atribuído ao usuário</p>
                    {isEditing && <p className='text-sm text-gray-500 mt-2'>Use o formulário acima para adicionar perfis</p>}
                </div>
            )}

            {!isEditing && selectedRoles.length > 0 && (
                <div className='mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
                    <p className='text-sm text-gray-700'>
                        <strong>Nota:</strong> Cada perfil possui um conjunto de permissões pré-definidas. Os perfis podem ser gerenciados nas configurações do sistema.
                    </p>
                </div>
            )}
        </Card>
    )
}

export default EmployeeTabPermissions
