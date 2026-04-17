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
    const proceduresText = procedures.map((proc) => proc.name).join(', ')

    const button = (
        <button
            onClick={() => onToggle(num)}
            title={`Dente ${num}${procedureCount > 0 ? ` · ${procedureCount} procedimento(s): ${proceduresText}` : ''}`}
            className={classNames(
                'relative flex-1 flex flex-col items-center justify-between pb-1 pt-0.5 rounded-md border text-[9px] font-bold transition-all active:scale-90 select-none',
                HEIGHT[type],
                selected && procedureCount > 0
                    ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-200 dark:shadow-indigo-900'
                    : selected
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500/70 text-indigo-600 dark:text-indigo-400'
                    : procedureCount > 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600/50 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20',
            )}
        >
            <span className='leading-none'>{num}</span>

            {/* Dot indicator per procedure count */}
            <div className='flex gap-[2px] items-center justify-center h-2'>
                {procedureCount > 0 && Array.from({ length: Math.min(procedureCount, 3) }).map((_, i) => (
                    <div key={i} className='w-1 h-1 rounded-full bg-emerald-400 dark:bg-emerald-500' />
                ))}
                {procedureCount > 3 && <span className='text-[7px] text-emerald-500 font-bold leading-none'>+</span>}
            </div>
        </button>
    )

    return button
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
