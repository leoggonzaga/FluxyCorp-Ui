import classNames from 'classnames'
import ScrollBar from '@/components/ui/ScrollBar'
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

    const { larger } = useResponsive()

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
            navigationTree={navigationConfig}
            routeKey={currentRouteKey}
            userAuthority={userAuthority as string[]}
            direction={direction}
        />
    )

    return (
        <>
            {larger.md && (
                <div
                    style={{
                        ...(sideNavCollapse ? sideNavCollapseStyle : sideNavStyle),
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px 0 rgba(31,38,135,0.08)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 60%, rgba(230,240,255,0.85) 100%)',
                        border: '1px solid #f3f4f6',
                        margin: '18px 8px',
                        padding: sideNavCollapse ? '8px' : '18px 8px',
                        minHeight: 'calc(100vh - 36px)',
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
                    <hr className="border-t border-gray-200 mb-4" />
                    {sideNavCollapse ? (
                        menuContent
                    ) : (
                        <div className="side-nav-content">
                            <ScrollBar autoHide direction={direction}>
                                <div className="space-y-2">
                                    {menuContent}
                                </div>
                            </ScrollBar>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default SideNav
