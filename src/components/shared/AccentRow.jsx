/**
 * AccentRow — <tr> com acento lateral esquerdo.
 *
 * Uso básico:
 *   <AccentRow accent="#6366f1">…</AccentRow>
 *
 * Com variante semântica (mapeia automaticamente para cor):
 *   <AccentRow variant="success">…</AccentRow>
 *
 * Props:
 *   accent    — cor hex/rgb direta (ex: "#f97316")
 *   variant   — "primary" | "success" | "warning" | "danger" | "info" | "neutral"
 *   width     — espessura do acento em px (padrão: 3)
 *   active    — boolean, aplica background tintado
 *   className — classes extras no <tr>
 *   ...rest   — quaisquer outros atributos de <tr> (onClick, title, etc.)
 */

const VARIANT_COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger:  '#ef4444',
    info:    '#3b82f6',
    neutral: '#94a3b8',
}

const AccentRow = ({
    accent,
    variant,
    width = 3,
    active = false,
    className = '',
    children,
    ...rest
}) => {
    const color = accent ?? VARIANT_COLORS[variant] ?? VARIANT_COLORS.neutral

    return (
        <tr
            {...rest}
            className={className}
            style={{
                boxShadow: `inset ${width}px 0 0 ${color}`,
                background: active ? `${color}0f` : undefined,
                transition: 'background 150ms ease, box-shadow 150ms ease',
                ...rest.style,
            }}
        >
            {children}
        </tr>
    )
}

export default AccentRow

/**
 * Utilitário para obter a cor de um variant sem usar o componente.
 * Útil quando você precisa da cor para outros fins (badge, ícone, etc.)
 *
 *   const color = accentColor('success')  // "#10b981"
 */
export const accentColor = (variant) => VARIANT_COLORS[variant] ?? VARIANT_COLORS.neutral
