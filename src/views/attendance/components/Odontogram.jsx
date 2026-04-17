import classNames from 'classnames'

// FDI notation — displayed from patient's perspective
const QUADRANTS = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
}

const toothType = (num) => {
    const d = num % 10
    if (d <= 2) return 'incisor'
    if (d === 3) return 'canine'
    if (d <= 5) return 'premolar'
    return 'molar'
}

const HEIGHT = { molar: 'h-9', premolar: 'h-8', canine: 'h-8', incisor: 'h-7' }

const Tooth = ({ num, selected, procedures = [], onToggle }) => {
    const type = toothType(num)
    const procedureCount = procedures.length
    const proceduresText = procedures.map((proc) => `${proc.name}${proc.faces ? ` (${proc.faces.join(', ')})` : ''}`).join('\n')

    // Determina a cor de fundo baseada no estado
    let baseColor = 'bg-gradient-to-b from-white to-blue-50 dark:from-gray-300 dark:to-gray-200'
    let borderColor = 'border-gray-300 dark:border-gray-500'
    let shadowColor = 'shadow-gray-300/60 dark:shadow-gray-700/60'
    let textColor = 'text-gray-600 dark:text-gray-800'

    if (selected && procedureCount > 0) {
        baseColor = 'bg-gradient-to-b from-indigo-200 to-indigo-100 dark:from-indigo-600 dark:to-indigo-700'
        borderColor = 'border-indigo-400 dark:border-indigo-700'
        shadowColor = 'shadow-indigo-400/60 dark:shadow-indigo-900/60'
        textColor = 'text-indigo-900 dark:text-white'
    } else if (selected) {
        baseColor = 'bg-gradient-to-b from-indigo-100 to-indigo-50 dark:from-indigo-500 dark:to-indigo-600'
        borderColor = 'border-indigo-300 dark:border-indigo-600'
        shadowColor = 'shadow-indigo-300/50 dark:shadow-indigo-800/50'
        textColor = 'text-indigo-700 dark:text-indigo-100'
    } else if (procedureCount > 0) {
        baseColor = 'bg-gradient-to-b from-emerald-100 to-emerald-50 dark:from-emerald-600 dark:to-emerald-700'
        borderColor = 'border-emerald-400 dark:border-emerald-700'
        shadowColor = 'shadow-emerald-400/60 dark:shadow-emerald-900/60'
        textColor = 'text-emerald-900 dark:text-white'
    }

    return (
        <button
            onClick={() => onToggle(num)}
            title={`Dente ${num}${procedureCount > 0 ? ` · ${procedureCount} procedimento(s):\n${proceduresText}` : ''}`}
            className={classNames(
                'relative flex-1 flex flex-col items-center justify-start pt-1 px-0.5 pb-0.5 rounded-t-2xl rounded-b-sm border-2 transition-all active:scale-90 select-none overflow-hidden group',
                HEIGHT[type],
                baseColor,
                borderColor,
                'hover:shadow-lg',
                shadowColor && `shadow-md ${shadowColor}`,
            )}
        >
            {/* Brilho/reflexo no topo (coroa do dente) */}
            <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/60 to-transparent rounded-t-2xl' />

            {/* Número do dente */}
            <span className={classNames('leading-none text-[8px] font-bold mt-0.5', textColor)}>
                {num}
            </span>

            {/* Raiz (fundo mais escuro) */}
            <div className='flex-1 w-full bg-gradient-to-b from-transparent via-gray-100/20 to-gray-300/30 dark:via-gray-600/10 dark:to-gray-700/30 rounded-b-sm' />

            {/* Dot indicator per procedure count */}
            {procedureCount > 0 && (
                <div className='flex gap-[2px] items-center justify-center h-1.5 mb-1'>
                    {Array.from({ length: Math.min(procedureCount, 3) }).map((_, i) => (
                        <div key={i} className='w-0.5 h-0.5 rounded-full bg-emerald-500 dark:bg-emerald-400' />
                    ))}
                    {procedureCount > 3 && <span className='text-[6px] text-emerald-600 dark:text-emerald-400 font-bold leading-none'>+</span>}
                </div>
            )}
        </button>
    )
}

const Odontogram = ({ selectedTeeth = [], onToggleTooth, proceduresByTooth = {} }) => {
    const allSelected = [...QUADRANTS.upperRight, ...QUADRANTS.upperLeft,
                         ...QUADRANTS.lowerLeft, ...QUADRANTS.lowerRight]
        .every((n) => selectedTeeth.includes(n))

    const handleSelectAll = () => {
        const all = [...QUADRANTS.upperRight, ...QUADRANTS.upperLeft,
                     ...QUADRANTS.lowerLeft, ...QUADRANTS.lowerRight]
        all.forEach((n) => {
            if (!selectedTeeth.includes(n)) onToggleTooth(n)
        })
    }

    const Row = ({ left, right, position }) => (
        <div className='flex items-end gap-0.5'>
            {/* Left quadrant */}
            <div className={classNames(
                'flex gap-0.5 flex-1',
                position === 'upper' ? 'items-end' : 'items-start',
            )}>
                {left.map((n) => (
                    <Tooth
                        key={n}
                        num={n}
                        selected={selectedTeeth.includes(n)}
                        procedures={proceduresByTooth[n] || []}
                        onToggle={onToggleTooth}
                    />
                ))}
            </div>

            {/* Midline */}
            <div className='w-px self-stretch bg-gray-200 dark:bg-gray-700 flex-shrink-0' />

            {/* Right quadrant */}
            <div className={classNames(
                'flex gap-0.5 flex-1',
                position === 'upper' ? 'items-end' : 'items-start',
            )}>
                {right.map((n) => (
                    <Tooth
                        key={n}
                        num={n}
                        selected={selectedTeeth.includes(n)}
                        procedures={proceduresByTooth[n] || []}
                        onToggle={onToggleTooth}
                    />
                ))}
            </div>
        </div>
    )

    return (
        <div className='space-y-1.5'>
            {/* Labels */}
            <div className='flex justify-between text-[9px] text-gray-400 uppercase tracking-widest font-bold px-0.5'>
                <span>Dir.</span>
                <span>Esq.</span>
            </div>

            {/* Upper jaw */}
            <Row left={QUADRANTS.upperRight} right={QUADRANTS.upperLeft} position='upper' />

            {/* Horizontal midline */}
            <div className='flex items-center gap-2 py-0.5'>
                <div className='flex-1 h-px bg-gray-200 dark:bg-gray-700' />
                <span className='text-[9px] text-gray-300 dark:text-gray-600 font-mono tracking-widest flex-shrink-0'>── ──</span>
                <div className='flex-1 h-px bg-gray-200 dark:bg-gray-700' />
            </div>

            {/* Lower jaw */}
            <Row left={QUADRANTS.lowerRight} right={QUADRANTS.lowerLeft} position='lower' />

            {/* Footer: count + actions */}
            <div className='flex items-center justify-between pt-1'>
                <span className='text-[10px] text-gray-400'>
                    {selectedTeeth.length > 0
                        ? <><span className='font-bold text-indigo-500'>{selectedTeeth.length}</span> dente(s) selecionado(s)</>
                        : 'Clique nos dentes para selecionar'}
                </span>
                <div className='flex gap-2'>
                    {selectedTeeth.length > 0 && (
                        <button
                            onClick={() => selectedTeeth.forEach((n) => onToggleTooth(n))}
                            className='text-[10px] text-gray-400 hover:text-red-500 transition font-medium'
                        >
                            Limpar
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Odontogram
