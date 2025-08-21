// Floating.jsx
import { useEffect } from "react"
import classNames from "classnames"
import {
  useFloating,
  autoUpdate,
  offset as flOffset,
  flip,
  shift,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react"

export default function Floating({
  isOpen,
  onClose,
  anchorRef,
  placement = "bottom",
  offset = 8,
  className,
  contentClassName,
  width,
  height,
  closable = true,
  style,
  children,
}) {
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: (o) => { if (!o) onClose?.() },
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [flOffset(offset), flip(), shift()],
  })

  useEffect(() => {
    if (anchorRef?.current) refs.setReference(anchorRef.current)
  }, [anchorRef, refs])

  const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true })
  const { getFloatingProps } = useInteractions([dismiss])

  const contentStyle = { ...floatingStyles, ...(width ? { width } : {}), ...(height ? { height } : {}), ...style }

  return (
    <FloatingPortal>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={contentStyle}
          {...getFloatingProps()}
          className={classNames("floating", className)}
        >
          <div className={classNames("floating-content relative flex w-full justify-center", contentClassName)}>
            {children}
          </div>
        </div>
      )}
    </FloatingPortal>
  )
}
