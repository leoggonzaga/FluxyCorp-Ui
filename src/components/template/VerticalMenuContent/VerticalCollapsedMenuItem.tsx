import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import { Link } from 'react-router-dom'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Trans } from 'react-i18next'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    userAuthority: string[]
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const NavMenuItem = ({
    subNav,
    onLinkClick,
    userAuthority,
}: {
    subNav: NavigationTree
    onLinkClick?: DefaultItemProps['onLinkClick']
    userAuthority: string[]
}) => {
    // Nested collapse
    if (subNav.subMenu && subNav.subMenu.length > 0) {
        return (
            <MenuCollapse
                label={
                    <div className="flex items-center gap-2">
                        <VerticalMenuIcon icon={subNav.icon} />
                        <span>
                            <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                        </span>
                    </div>
                }
                eventKey={subNav.key}
                expanded={false}
                className="mb-1"
            >
                {subNav.subMenu.map((deepNav) => (
                    <AuthorityCheck
                        key={deepNav.key}
                        userAuthority={userAuthority}
                        authority={deepNav.authority}
                    >
                        <NavMenuItem
                            subNav={deepNav}
                            onLinkClick={onLinkClick}
                            userAuthority={userAuthority}
                        />
                    </AuthorityCheck>
                ))}
            </MenuCollapse>
        )
    }

    // Leaf item
    return (
        <MenuItem eventKey={subNav.key}>
            {subNav.path ? (
                <Link
                    className="h-full w-full flex items-center gap-2"
                    to={subNav.path}
                    target={subNav.isExternalLink ? '_blank' : ''}
                    onClick={() =>
                        onLinkClick?.({
                            key: subNav.key,
                            title: subNav.title,
                            path: subNav.path,
                        })
                    }
                >
                    <VerticalMenuIcon icon={subNav.icon} />
                    <span>
                        <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                    </span>
                </Link>
            ) : (
                <span>
                    <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                </span>
            )}
        </MenuItem>
    )
}

const DefaultItem = ({ nav, onLinkClick, userAuthority }: DefaultItemProps) => {
    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuCollapse
                key={nav.key}
                label={
                    <div className="flex items-center gap-2">
                        <VerticalMenuIcon icon={nav.icon} />
                        <span>
                            <Trans
                                i18nKey={nav.translateKey}
                                defaults={nav.title}
                            />
                        </span>
                    </div>
                }
                eventKey={nav.key}
                expanded={false}
                className="mb-1"
            >
                {nav.subMenu.map((subNav) => (
                    <AuthorityCheck
                        key={subNav.key}
                        userAuthority={userAuthority}
                        authority={subNav.authority}
                    >
                        <NavMenuItem
                            subNav={subNav}
                            onLinkClick={onLinkClick}
                            userAuthority={userAuthority}
                        />
                    </AuthorityCheck>
                ))}
            </MenuCollapse>
        </AuthorityCheck>
    )
}

const CollapsedItem = ({
    nav,
    onLinkClick,
    userAuthority,
    direction,
}: CollapsedItemProps) => {
    const menuItem = (
        <MenuItem key={nav.key} eventKey={nav.key} className="mb-1">
            <VerticalMenuIcon icon={nav.icon} />
        </MenuItem>
    )

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <Dropdown
                trigger="hover"
                renderTitle={menuItem}
                placement={
                    direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'
                }
            >
                {nav.subMenu.map((subNav) => (
                    <AuthorityCheck
                        key={subNav.key}
                        userAuthority={userAuthority}
                        authority={subNav.authority}
                    >
                        {subNav.subMenu && subNav.subMenu.length > 0 ? (
                            <>
                                <Dropdown.Item
                                    key={`${subNav.key}-label`}
                                    eventKey={`${subNav.key}-label`}
                                    disabled
                                    className="text-[10px] font-bold uppercase tracking-widest opacity-50 cursor-default px-3 pt-3 pb-1"
                                >
                                    <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                                </Dropdown.Item>
                                {subNav.subMenu.map((deepNav) => (
                                    <AuthorityCheck
                                        key={deepNav.key}
                                        userAuthority={userAuthority}
                                        authority={deepNav.authority}
                                    >
                                        <Dropdown.Item eventKey={deepNav.key}>
                                            {deepNav.path ? (
                                                <Link
                                                    className="h-full w-full flex items-center pl-2"
                                                    to={deepNav.path}
                                                    target={deepNav.isExternalLink ? '_blank' : ''}
                                                    onClick={() =>
                                                        onLinkClick?.({
                                                            key: deepNav.key,
                                                            title: deepNav.title,
                                                            path: deepNav.path,
                                                        })
                                                    }
                                                >
                                                    <span>
                                                        <Trans i18nKey={deepNav.translateKey} defaults={deepNav.title} />
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span>
                                                    <Trans i18nKey={deepNav.translateKey} defaults={deepNav.title} />
                                                </span>
                                            )}
                                        </Dropdown.Item>
                                    </AuthorityCheck>
                                ))}
                            </>
                        ) : (
                            <Dropdown.Item eventKey={subNav.key}>
                                {subNav.path ? (
                                    <Link
                                        className="h-full w-full flex items-center"
                                        to={subNav.path}
                                        target={subNav.isExternalLink ? '_blank' : ''}
                                        onClick={() =>
                                            onLinkClick?.({
                                                key: subNav.key,
                                                title: subNav.title,
                                                path: subNav.path,
                                            })
                                        }
                                    >
                                        <span>
                                            <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                                        </span>
                                    </Link>
                                ) : (
                                    <span>
                                        <Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
                                    </span>
                                )}
                            </Dropdown.Item>
                        )}
                    </AuthorityCheck>
                ))}
            </Dropdown>
        </AuthorityCheck>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} />
    ) : (
        <DefaultItem {...rest} />
    )
}

export default VerticalCollapsedMenuItem
