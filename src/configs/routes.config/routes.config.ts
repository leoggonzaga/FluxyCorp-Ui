import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'calendar',
        path: '/calendar',
        component: lazy(() => import('@/views/calendar/calendarPage')),
        authority: [],
    },
    {
        key: 'employees',
        path: '/employees',
        component: lazy(() => import('@/views/employee/employeeList')),
        authority: [],
    },
    {
        key: 'employeeView',
        path: '/employee-view/:id',
        component: lazy(() => import('@/views/employee/view/employeeView')),
        authority: [],
    },
    {
        key: 'consultationType',
        path: '/consultation-type',
        component: lazy(() => import('@/views/consultationType/consultationTypeList')),
        authority: [],
    },
    {
        key: 'receivables',
        path: '/receivables',
        component: lazy(() => import('@/views/receivable/receivableIndex')),
        authority: [],
    },
    {
        key: 'bankTransaction',
        path: '/bank-transactions',
        component: lazy(() => import('@/views/bankTransaction/bankTransactionIndex')),
        authority: [],
    },
    {
        key: 'serviceTables',
        path: '/service-tables',
        component: lazy(() => import('@/views/serviceTable/serviceTableIndex')),
        authority: [],
    },
    {
        key: 'serviceTable',
        path: '/service-tables/:id',
        component: lazy(() => import('@/views/serviceTable/serviceTableView')),
        authority: [],
    },
    /** Example purpose only, please remove */
    // {
    //     key: 'singleMenuItem',
    //     path: '/single-menu-view',
    //     component: lazy(() => import('@/views/demo/SingleMenuView')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item1',
    //     path: '/collapse-menu-item-view-1',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView1')),
    //     authority: [],
    // },
    // {
    //     key: 'collapseMenu.item2',
    //     path: '/collapse-menu-item-view-2',
    //     component: lazy(() => import('@/views/demo/CollapseMenuItemView2')),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.single',
    //     path: '/group-single-menu-item-view',
    //     component: lazy(() => import('@/views/demo/GroupSingleMenuItemView')),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item1',
    //     path: '/group-collapse-menu-item-view-1',
    //     component: lazy(
    //         () => import('@/views/demo/GroupCollapseMenuItemView1'),
    //     ),
    //     authority: [],
    // },
    // {
    //     key: 'groupMenu.collapse.item2',
    //     path: '/group-collapse-menu-item-view-2',
    //     component: lazy(
    //         () => import('@/views/demo/GroupCollapseMenuItemView2'),
    //     ),
    //     authority: [],
    // },
]
