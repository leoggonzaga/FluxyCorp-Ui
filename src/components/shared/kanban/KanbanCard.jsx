/**
 * KanbanCard — card base do padrão kanban da aplicação.
 *
 * Aceita props opcionais de drag-and-drop (dnd-kit) quando necessário.
 * Sem elas, funciona como card estático normal.
 *
 * Props:
 *   isDragging      — boolean, aplica anel + rotação
 *   dragRef         — ref do useSortable / useDroppable
 *   dragAttributes  — atributos do useSortable
 *   dragListeners   — listeners do useSortable
 *   dragStyle       — style CSS transform do useSortable
 *   className       — classes extras
 *   children        — conteúdo do card
 */
const KanbanCard = ({
    isDragging = false,
    dragRef,
    dragAttributes,
    dragListeners,
    dragStyle,
    className = '',
    children,
}) => (
    <div
        ref={dragRef}
        {...dragAttributes}
        {...dragListeners}
        style={dragStyle}
        className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 border border-white dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-150 ${
            dragRef ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
            isDragging ? 'shadow-xl ring-2 ring-indigo-300 opacity-90 rotate-1' : ''
        } ${className}`}
    >
        {children}
    </div>
)

export default KanbanCard
