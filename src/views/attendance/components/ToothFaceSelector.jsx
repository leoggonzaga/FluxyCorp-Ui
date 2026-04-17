import classNames from 'classnames'

const FACES = [
    { id: 'oclusal', label: 'Oclusal', position: 'top', icon: '⊙' },
    { id: 'mesial', label: 'Mesial', position: 'left', icon: '◀' },
    { id: 'distal', label: 'Distal', position: 'right', icon: '▶' },
    { id: 'vestibular', label: 'Vestibular', position: 'bottom-left', icon: '◢' },
    { id: 'lingual', label: 'Lingual', position: 'bottom-right', icon: '◣' },
]

const ToothFaceSelector = ({ selectedFaces = [], onFaceToggle }) => {
    const handleToggle = (faceId) => {
        onFaceToggle(
            selectedFaces.includes(faceId)
                ? selectedFaces.filter((f) => f !== faceId)
                : [...selectedFaces, faceId]
        )
    }

    return (
        <div className='space-y-3'>
            <label className='block text-sm font-medium text-gray-700'>Selecione a(s) face(s) do dente</label>

            {/* Visualização em rosácea */}
            <div className='flex justify-center items-center py-8 relative w-48 h-48 mx-auto'>
                {/* Círculo central com número do dente */}
                <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='w-20 h-20 rounded-full bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-600 dark:to-blue-700 border-2 border-blue-300 dark:border-blue-500 flex items-center justify-center shadow-lg'>
                        <svg className='w-12 h-12 text-blue-600 dark:text-white' viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M12 2c3.3 0 6 2.7 6 6v4c0 .5.4 1 1 1h.5c.8 0 1.5.7 1.5 1.5v1c0 .8-.7 1.5-1.5 1.5H5.5c-.8 0-1.5-.7-1.5-1.5v-1c0-.8.7-1.5 1.5-1.5H6c.5 0 1-.4 1-1V8c0-3.3 2.7-6 6-6z' />
                        </svg>
                    </div>
                </div>

                {/* Botões das faces ao redor */}
                {FACES.map((face) => {
                    const isSelected = selectedFaces.includes(face.id)

                    // Posição dos botões em um padrão radial
                    const positions = {
                        top: 'top-0 left-1/2 -translate-x-1/2',
                        left: 'left-0 top-1/2 -translate-y-1/2',
                        right: 'right-0 top-1/2 -translate-y-1/2',
                        'bottom-left': 'bottom-0 left-1/4 -translate-x-1/2 translate-y-2',
                        'bottom-right': 'bottom-0 right-1/4 translate-x-1/2 translate-y-2',
                    }

                    return (
                        <button
                            key={face.id}
                            onClick={() => handleToggle(face.id)}
                            title={face.label}
                            className={classNames(
                                'absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all active:scale-90',
                                positions[face.position],
                                isSelected
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-400/60 border-2 border-indigo-600 scale-110'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
                            )}
                        >
                            <span className='text-xl leading-none'>{face.icon}</span>
                        </button>
                    )
                })}
            </div>

            {/* Legenda textual */}
            <div className='grid grid-cols-2 gap-2 pt-2'>
                {FACES.map((face) => {
                    const isSelected = selectedFaces.includes(face.id)
                    return (
                        <button
                            key={face.id}
                            onClick={() => handleToggle(face.id)}
                            className={classNames(
                                'px-3 py-2 rounded-lg text-sm font-medium transition text-left',
                                isSelected
                                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-400 dark:border-indigo-500'
                                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600',
                            )}
                        >
                            {face.label}
                            {isSelected && <span className='ml-1'>✓</span>}
                        </button>
                    )
                })}
            </div>

            {/* Resumo */}
            {selectedFaces.length > 0 && (
                <div className='bg-indigo-50 dark:bg-indigo-900/20 rounded-lg px-3 py-2 border border-indigo-200 dark:border-indigo-700/50 text-sm'>
                    <p className='text-indigo-700 dark:text-indigo-300'>
                        <strong>{selectedFaces.length}</strong> face(s) selecionada(s): <br />
                        <span className='text-indigo-600 dark:text-indigo-400'>
                            {selectedFaces.map((faceId) => FACES.find((f) => f.id === faceId)?.label).join(', ')}
                        </span>
                    </p>
                </div>
            )}
        </div>
    )
}

export default ToothFaceSelector
