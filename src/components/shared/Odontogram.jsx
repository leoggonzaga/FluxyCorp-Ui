import { useState } from 'react'
import { Card, Dialog, Select, Button } from '@/components/ui'
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi'

const PROCEDURES = [
    { id: 1, name: 'Cárie', color: '#f59e0b' },
    { id: 2, name: 'Restauração', color: '#3b82f6' },
    { id: 3, name: 'Canal', color: '#8b5cf6' },
    { id: 4, name: 'Extração', color: '#ef4444' },
    { id: 5, name: 'Implante', color: '#10b981' },
    { id: 6, name: 'Clareamento', color: '#f0f9ff' },
    { id: 7, name: 'Limpeza', color: '#fbbf24' },
    { id: 8, name: 'Selante', color: '#06b6d4' },
]

const Odontogram = ({ selectedTeeth = {}, onTeethChange, genderColor = 'blue' }) => {
    const [selectedTooth, setSelectedTooth] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProcedure, setSelectedProcedure] = useState(null)

    // Dentes da arcada superior (18-11 esq, 21-28 dir)
    const UPPER_LEFT = [18, 17, 16, 15, 14, 13, 12, 11]
    const UPPER_RIGHT = [21, 22, 23, 24, 25, 26, 27, 28]

    // Dentes da arcada inferior (38-31 esq, 41-48 dir)
    const LOWER_LEFT = [38, 37, 36, 35, 34, 33, 32, 31]
    const LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48]

    const handleToothClick = (tooth) => {
        setSelectedTooth(tooth)
        setSelectedProcedure(null)
        setIsModalOpen(true)
    }

    const handleAddProcedure = () => {
        if (selectedProcedure && selectedTooth) {
            const key = `tooth_${selectedTooth}`
            onTeethChange({
                ...selectedTeeth,
                [key]: {
                    tooth: selectedTooth,
                    procedure: selectedProcedure.name,
                    procedureId: selectedProcedure.id,
                    color: selectedProcedure.color,
                },
            })
            setIsModalOpen(false)
            setSelectedTooth(null)
            setSelectedProcedure(null)
        }
    }

    const handleRemoveProcedure = (tooth) => {
        const key = `tooth_${tooth}`
        const updated = { ...selectedTeeth }
        delete updated[key]
        onTeethChange(updated)
    }

    const getToothColor = (tooth) => {
        const key = `tooth_${tooth}`
        return selectedTeeth[key]?.color || 'white'
    }

    const getToothProcedure = (tooth) => {
        const key = `tooth_${tooth}`
        return selectedTeeth[key]?.procedure
    }

    const colorClass = genderColor === 'female' ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'
    const borderColor = genderColor === 'female' ? 'border-red-200' : 'border-blue-200'

    return (
        <div className='space-y-4'>
            <div className={`rounded-xl border ${borderColor} bg-gradient-to-br ${
                genderColor === 'female'
                    ? 'from-red-50 via-rose-50 to-pink-50'
                    : 'from-blue-50 via-indigo-50 to-purple-50'
            } p-6 shadow-sm`}>
                {/* Título */}
                <h3 className='mb-6 text-lg font-semibold text-gray-800'>Odontograma</h3>

                {/* Legenda */}
                <div className='mb-6 flex flex-wrap gap-3 text-xs'>
                    {PROCEDURES.map(proc => (
                        <div key={proc.id} className='flex items-center gap-2'>
                            <div
                                className='h-3 w-3 rounded'
                                style={{ backgroundColor: proc.color }}
                            />
                            <span className='text-gray-700'>{proc.name}</span>
                        </div>
                    ))}
                </div>

                {/* Arcada Dentária */}
                <div className='space-y-8'>
                    {/* Arcada Superior */}
                    <div className='space-y-2'>
                        <p className='text-center text-xs font-semibold uppercase tracking-widest text-gray-600'>Arcada Superior</p>
                        <div className='flex flex-row-reverse items-center justify-center gap-1'>
                            {/* Superior Esquerdo (reverso) */}
                            <div className='flex gap-1'>
                                {UPPER_LEFT.map(tooth => (
                                    <ToothComponent
                                        key={tooth}
                                        tooth={tooth}
                                        procedure={getToothProcedure(tooth)}
                                        color={getToothColor(tooth)}
                                        onClick={() => handleToothClick(tooth)}
                                        onRemove={() => handleRemoveProcedure(tooth)}
                                    />
                                ))}
                            </div>

                            {/* Separador central */}
                            <div className='mx-2 h-12 border-l-2 border-gray-300' />

                            {/* Superior Direito */}
                            <div className='flex gap-1'>
                                {UPPER_RIGHT.map(tooth => (
                                    <ToothComponent
                                        key={tooth}
                                        tooth={tooth}
                                        procedure={getToothProcedure(tooth)}
                                        color={getToothColor(tooth)}
                                        onClick={() => handleToothClick(tooth)}
                                        onRemove={() => handleRemoveProcedure(tooth)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Arcada Inferior */}
                    <div className='space-y-2'>
                        <p className='text-center text-xs font-semibold uppercase tracking-widest text-gray-600'>Arcada Inferior</p>
                        <div className='flex flex-row-reverse items-center justify-center gap-1'>
                            {/* Inferior Esquerdo (reverso) */}
                            <div className='flex gap-1'>
                                {LOWER_LEFT.map(tooth => (
                                    <ToothComponent
                                        key={tooth}
                                        tooth={tooth}
                                        procedure={getToothProcedure(tooth)}
                                        color={getToothColor(tooth)}
                                        onClick={() => handleToothClick(tooth)}
                                        onRemove={() => handleRemoveProcedure(tooth)}
                                    />
                                ))}
                            </div>

                            {/* Separador central */}
                            <div className='mx-2 h-12 border-l-2 border-gray-300' />

                            {/* Inferior Direito */}
                            <div className='flex gap-1'>
                                {LOWER_RIGHT.map(tooth => (
                                    <ToothComponent
                                        key={tooth}
                                        tooth={tooth}
                                        procedure={getToothProcedure(tooth)}
                                        color={getToothColor(tooth)}
                                        onClick={() => handleToothClick(tooth)}
                                        onRemove={() => handleRemoveProcedure(tooth)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dentes com procedimentos */}
                {Object.keys(selectedTeeth).length > 0 && (
                    <div className='mt-6 rounded-lg border border-gray-200 bg-white p-4'>
                        <p className='mb-3 text-sm font-semibold text-gray-700'>Dentes com Procedimentos:</p>
                        <div className='space-y-2'>
                            {Object.values(selectedTeeth).map(item => (
                                <div
                                    key={`${item.tooth}-${item.procedureId}`}
                                    className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
                                >
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className='h-3 w-3 rounded'
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className='text-sm text-gray-700'>
                                            Dente <strong>#{item.tooth}</strong> - {item.procedure}
                                        </span>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => handleRemoveProcedure(item.tooth)}
                                        className='text-red-500 hover:text-red-700 transition'
                                    >
                                        <HiOutlineTrash className='h-4 w-4' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para selecionar procedimento */}
            <Dialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRequestClose={() => setIsModalOpen(false)}
                width={400}
                title={`Procedimento para Dente #${selectedTooth}`}
            >
                <div className='space-y-4'>
                    <div>
                        <label className='mb-2 block text-sm font-medium text-gray-700'>
                            Selecione o Procedimento
                        </label>
                        <Select
                            options={PROCEDURES.map(p => ({ label: p.name, value: p.id }))}
                            isSearchable
                            onChange={(opt) => {
                                setSelectedProcedure(PROCEDURES.find(p => p.id === opt.value))
                            }}
                            value={selectedProcedure ? { label: selectedProcedure.name, value: selectedProcedure.id } : null}
                        />
                    </div>

                    <div className='flex gap-3 pt-4'>
                        <Button
                            block
                            variant='plain'
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            block
                            variant='solid'
                            onClick={handleAddProcedure}
                            disabled={!selectedProcedure}
                        >
                            Adicionar
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

const ToothComponent = ({ tooth, procedure, color, onClick, onRemove }) => {
    return (
        <div className='relative group'>
            <button
                type='button'
                onClick={onClick}
                className='h-14 w-10 rounded-b-2xl rounded-t-sm border-2 border-gray-300 transition hover:scale-110 hover:shadow-md focus:outline-none'
                style={{
                    backgroundColor: color,
                    borderColor: procedure ? '#1f2937' : '#d1d5db',
                }}
                title={`Dente #${tooth}${procedure ? ` - ${procedure}` : ''}`}
            >
                <span className='text-xs font-bold text-gray-700'>{tooth}</span>
            </button>

            {procedure && (
                <button
                    type='button'
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className='absolute -top-2 -right-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition'
                >
                    ×
                </button>
            )}
        </div>
    )
}

export default Odontogram
