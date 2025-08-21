import {
    HiOutlineColorSwatch,
    HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineCog,
    HiOutlineClipboardList
} from 'react-icons/hi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    singleMenu: <HiOutlineViewGridAdd />,
    collapseMenu: <HiOutlineTemplate />,
    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
    currencyDolar: <HiOutlineCurrencyDollar />,
    calendar: <HiOutlineCalendar/>,
    gear: <HiOutlineCog/>,
    clipboarList: <HiOutlineClipboardList/>
}

export default navigationIcon
