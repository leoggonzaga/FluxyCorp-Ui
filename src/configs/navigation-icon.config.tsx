import {
    HiOutlineColorSwatch,
    HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome,
    HiOutlineCurrencyDollar,
    HiOutlineCalendar,
    HiOutlineCog,
    HiOutlineClipboardList,
    HiOutlineClipboard,
    HiOutlineCash,
    HiOutlineChartBar,
    HiOutlineArrowCircleDown,
    HiOutlineArrowCircleUp,
    HiOutlineFilter,
    HiOutlineBeaker,
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
    clipboarList: <HiOutlineClipboardList/>,
    clipboard:    <HiOutlineClipboard/>,
    cash:            <HiOutlineCash/>,
    chartBar:        <HiOutlineChartBar/>,
    arrowCircleDown: <HiOutlineArrowCircleDown/>,
    arrowCircleUp:   <HiOutlineArrowCircleUp/>,
    funnel:          <HiOutlineFilter/>,
    beaker:          <HiOutlineBeaker/>,
}

export default navigationIcon
