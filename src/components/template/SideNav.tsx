import classNames from 'classnames'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    NAV_MODE_DARK,
    NAV_MODE_THEMED,
    NAV_MODE_TRANSPARENT,
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import Logo from '@/components/template/Logo'
import navigationConfig from '@/configs/navigation.config'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useAppSelector } from '@/store'
import {
    HiOutlineUserGroup,
    HiOutlineClipboardList,
    HiOutlineCurrencyDollar,
    HiOutlineBeaker,
    HiOutlineCube,
    HiOutlineCog,
    HiChevronLeft,
    HiChevronRight,
} from 'react-icons/hi'

const SECTIONS = [
    { key: 'groupMenu',      label: 'Equipe',      Icon: HiOutlineUserGroup,      neon: '#22d3ee' },
    { key: 'crm',            label: 'CRM',         Icon: HiOutlineClipboardList,  neon: '#a78bfa' },
    { key: 'finance',        label: 'Financeiro',  Icon: HiOutlineCurrencyDollar, neon: '#34d399' },
    { key: 'prostheticsNav', label: 'Próteses',    Icon: HiOutlineBeaker,         neon: '#f472b6' },
    { key: 'inventoryNav',   label: 'Estoque',     Icon: HiOutlineCube,           neon: '#fb923c' },
    { key: 'config',         label: 'Adm',         Icon: HiOutlineCog,            neon: '#60a5fa' },
]

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}

const SideNav = () => {
    const themeColor = useAppSelector((state) => state.theme.themeColor)
    const primaryColorLevel = useAppSelector(
        (state) => state.theme.primaryColorLevel,
    )
    const navMode = useAppSelector((state) => state.theme.navMode)
    const mode = useAppSelector((state) => state.theme.mode)
    const direction = useAppSelector((state) => state.theme.direction)
    const currentRouteKey = useAppSelector(
        (state) => state.base.common.currentRouteKey,
    )
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse,
    )
    const userAuthority = useAppSelector((state) => state.auth.user.authority)
    const permissions   = useAppSelector((state) => state.auth.user.permissions)

    const permissionedNav = useMemo(() => {
        const hasPermissions = permissions && Object.keys(permissions).length > 0
        if (!hasPermissions) return navigationConfig

        function filterItems(items: typeof navigationConfig): typeof navigationConfig {
            return items.reduce<typeof navigationConfig>((acc, item) => {
                if ('subMenu' in item && item.subMenu) {
                    const children = filterItems(item.subMenu as typeof navigationConfig)
                    if (children.length > 0) acc.push({ ...item, subMenu: children } as typeof item)
                } else {
                    // show if key not in permissions dict (not a controlled feature) OR explicitly true
                    if (!(item.key in permissions!) || permissions![item.key]) acc.push(item)
                }
                return acc
            }, [])
        }

        return filterItems(navigationConfig)
    }, [permissions])

    const { larger } = useResponsive()

    const [activeSection, setActiveSection] = useState<string | null>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)
    const carouselRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
    const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

    const updateScrollState = useCallback(() => {
        const el = carouselRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 4)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }, [])

    useEffect(() => {
        const el = carouselRef.current
        if (!el) return
        updateScrollState()
        el.addEventListener('scroll', updateScrollState, { passive: true })
        const ro = new ResizeObserver(updateScrollState)
        ro.observe(el)
        return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect() }
    }, [updateScrollState])

    const scrollCarousel = (dir: 'left' | 'right') => {
        const el = carouselRef.current
        if (!el) return
        el.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
    }

    const onDragStart = (e: React.MouseEvent) => {
        const el = carouselRef.current
        if (!el) return
        dragRef.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false }
        el.style.cursor = 'grabbing'
    }

    const onDragEnd = () => {
        const el = carouselRef.current
        if (!el) return
        dragRef.current.active = false
        el.style.cursor = 'grab'
    }

    const onDragMove = (e: React.MouseEvent) => {
        const el = carouselRef.current
        if (!el || !dragRef.current.active) return
        const x = e.pageX - el.offsetLeft
        const delta = x - dragRef.current.startX
        if (Math.abs(delta) > 4) {
            dragRef.current.moved = true
            e.preventDefault()
            el.scrollLeft = dragRef.current.scrollLeft - delta * 1.2
        }
    }

    const onCarouselClick = (key: string) => (e: React.MouseEvent) => {
        if (dragRef.current.moved) { e.preventDefault(); return }
        toggleSection(key)
    }

    const centerItem = useCallback((key: string) => {
        const el = carouselRef.current
        const btn = itemRefs.current.get(key)
        if (!el || !btn) return
        const target = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2
        el.scrollTo({ left: target, behavior: 'smooth' })
    }, [])

    const toggleSection = (key: string) =>
        setActiveSection((prev) => (prev === key ? null : key))

    useEffect(() => {
        if (activeSection) centerItem(activeSection)
    }, [activeSection, centerItem])

    const filteredNav = activeSection
        ? permissionedNav.filter(
              (item) => item.key === 'home' || item.key === activeSection,
          )
        : permissionedNav
    // sidebar only on screens ≥ 1024px; below that uses MobileNav drawer

    const sideNavColor = () => {
        if (navMode === NAV_MODE_THEMED) {
            return `bg-${themeColor}-${primaryColorLevel} side-nav-${navMode}`
        }
        return `side-nav-${navMode}`
    }

    const logoMode = () => {
        if (navMode === NAV_MODE_THEMED) {
            return NAV_MODE_DARK
        }

        if (navMode === NAV_MODE_TRANSPARENT) {
            return mode
        }

        return navMode
    }

    const menuContent = (
        <VerticalMenuContent
            navMode={navMode}
            collapsed={sideNavCollapse}
            navigationTree={filteredNav}
            routeKey={currentRouteKey}
            userAuthority={userAuthority as string[]}
            direction={direction}
        />
    )

    return (
        <>
            {larger.lg && (
                <div
                    style={{
                        ...(sideNavCollapse ? sideNavCollapseStyle : sideNavStyle),
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px 0 rgba(31,38,135,0.08)',
                        border: '1px solid #f3f4f6',
                        margin: '18px 8px',
                        padding: sideNavCollapse ? '8px' : '18px 8px',
                        minHeight: 'calc(100vh - 36px)',
                        height: 'fit-content',
                        alignSelf: 'flex-start',
                        position: 'sticky',
                        top: '18px',
                        transition: 'all 0.3s',
                    }}
                    className={classNames(
                        'side-nav',
                        sideNavColor(),
                        !sideNavCollapse && 'side-nav-expand',
                        'backdrop-blur-md',
                    )}
                >
                    <div className="side-nav-header flex items-center justify-center mb-4">
                        <Logo
                            mode={['light','dark'].includes(logoMode()) ? logoMode() : 'light'}
                            type={sideNavCollapse ? 'streamline' : 'full'}
                            className={sideNavCollapse ? SIDE_NAV_CONTENT_GUTTER : LOGO_X_GUTTER}
                           
                           
                        />
                    </div>
                    <hr className="border-t mb-3 mx-2" style={{ borderColor: 'rgba(156,163,175,0.25)' }} />

                    {/* Section picker carousel — only visible in expanded mode */}
                    {!sideNavCollapse && (
                        <div className="relative flex items-center mb-3 px-1">
                            {/* Left arrow */}
                            <button
                                onClick={() => scrollCarousel('left')}
                                className="shrink-0 z-10 flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200"
                                style={{
                                    opacity: canScrollLeft ? 1 : 0,
                                    pointerEvents: canScrollLeft ? 'auto' : 'none',
                                    color: 'rgba(255,255,255,0.6)',
                                    background: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <HiChevronLeft className="w-3 h-3" />
                            </button>

                            {/* Scrollable track */}
                            <div
                                ref={carouselRef}
                                className="flex items-center gap-1 flex-1 px-1 select-none"
                                onMouseDown={onDragStart}
                                onMouseUp={onDragEnd}
                                onMouseLeave={onDragEnd}
                                onMouseMove={onDragMove}
                                style={{
                                    overflowX: 'auto',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch',
                                    cursor: 'grab',
                                } as React.CSSProperties}
                            >
                                {SECTIONS.map(({ key, label, Icon }) => {
                                    const isActive = activeSection === key
                                    return (
                                        <button
                                            key={key}
                                            ref={(node) => {
                                                if (node) itemRefs.current.set(key, node)
                                                else itemRefs.current.delete(key)
                                            }}
                                            title={label}
                                            onClick={onCarouselClick(key)}
                                            className="relative flex flex-col items-center gap-1 py-2 px-3 shrink-0 rounded-lg transition-all duration-200"
                                            style={isActive ? {
                                                background: 'rgba(255,255,255,0.14)',
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: '0 1px 8px rgba(0,0,0,0.18)',
                                            } : {
                                                background: 'transparent',
                                            }}
                                        >
                                            <Icon
                                                className="w-[18px] h-[18px] transition-all duration-200"
                                                style={{
                                                    color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
                                                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                                }}
                                            />
                                            <span
                                                className="text-[10px] font-semibold leading-none tracking-wide whitespace-nowrap transition-all duration-200"
                                                style={{ color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)' }}
                                            >
                                                {label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Right arrow */}
                            <button
                                onClick={() => scrollCarousel('right')}
                                className="shrink-0 z-10 flex items-center justify-center w-5 h-5 rounded-full transition-all duration-200"
                                style={{
                                    opacity: canScrollRight ? 1 : 0,
                                    pointerEvents: canScrollRight ? 'auto' : 'none',
                                    color: 'rgba(255,255,255,0.6)',
                                    background: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <HiChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <hr className="border-t mb-3 mx-2" style={{ borderColor: 'rgba(156,163,175,0.25)' }} />

                    {sideNavCollapse ? (
                        menuContent
                    ) : (
                        <div className={`side-nav-content flex flex-col flex-1 min-h-0 overflow-y-auto${activeSection ? ' section-filtered' : ''}`}>
                            {(() => {
                                const section = SECTIONS.find(s => s.key === activeSection)
                                if (!section) return null
                                const { Icon, label, neon } = section
                                return (
                                    <div
                                        className="flex items-center gap-2 px-3 mb-3"
                                        style={{ animation: 'fadeSlideIn 0.22s ease' }}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: neon }} />
                                        <span
                                            className="text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                                            style={{ color: neon }}
                                        >
                                            {label}
                                        </span>
                                        <div className="flex-1 h-px rounded-full" style={{ background: `${neon}44` }} />
                                    </div>
                                )
                            })()}
                            <div className="space-y-1">
                                {menuContent}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default SideNav
