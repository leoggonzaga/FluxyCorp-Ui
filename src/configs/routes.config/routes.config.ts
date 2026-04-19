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
        key: 'catalog',
        path: '/catalog',
        component: lazy(() => import('@/views/catalog/catalogIndex')),
        authority: [],
    },
    {
        key: 'catalog',
        path: '/catalog/:id',
        component: lazy(() => import('@/views/catalog/catalogView')),
        authority: [],
    },
    {
        key: 'service_product',
        path: '/service-product',
        component: lazy(() => import('@/views/service_product/service_productIndex')),
        authority: [],
    },
    {
        key: 'clinicProducts',
        path: '/clinic-products',
        component: lazy(() => import('@/views/clinicProducts/clinicProductsIndex')),
        authority: [],
    },
    {
        key: 'inventory',
        path: '/inventory',
        component: lazy(() => import('@/views/inventory/inventoryDashboard')),
        authority: [],
    },
    {
        key: 'inventoryCategories',
        path: '/inventory/categories',
        component: lazy(() => import('@/views/inventory/categoriesIndex')),
        authority: [],
    },
    {
        key: 'inventorySuppliers',
        path: '/inventory/suppliers',
        component: lazy(() => import('@/views/inventory/suppliersIndex')),
        authority: [],
    },
    {
        key: 'inventoryRequest',
        path: '/inventory/request',
        component: lazy(() => import('@/views/inventory/inventoryRequestView')),
        authority: [],
    },
    {
        key: 'inventoryMovements',
        path: '/inventory/movements',
        component: lazy(() => import('@/views/inventory/stockOperationsView')),
        authority: [],
    },
    {
        key: 'settings',
        path: '/settings',
        component: lazy(() => import('@/views/settings')),
        authority: [],
    },
    {
        key: 'settingsTemplates',
        path: '/settings/templates',
        component: lazy(() => import('@/views/settings/SettingsTemplates')),
        authority: [],
    },
    {
        key: 'operadoras',
        path: '/settings/operadoras',
        component: lazy(() => import('@/views/settings/operadorasIndex')),
        authority: [],
    },
    {
        key: 'appointmentFlow',
        path: '/appointment-flow',
        component: lazy(() => import('@/views/appointmentFlow/appointmentFlowIndex')),
        authority: [],
    },
    {
        key: 'patients',
        path: '/patients',
        component: lazy(() => import('@/views/patient/patientRecordIndex')),
        authority: [],
    },
    {
        key: 'attendanceToday',
        path: '/attendance-today',
        component: lazy(() => import('@/views/attendance/attendanceTodayIndex')),
        authority: [],
    },
    {
        key: 'attendance',
        path: '/attendance',
        component: lazy(() => import('@/views/attendance/AttendanceIndex')),
        authority: [],
    },
    {
        key: 'leads',
        path: '/leads',
        component: lazy(() => import('@/views/leads/leadsIndex')),
        authority: [],
    },
    {
        key: 'cashFlowDashboard',
        path: '/cash-flow',
        component: lazy(() => import('@/views/cashFlow/cashFlowDashboard')),
        authority: [],
    },
    {
        key: 'cashClosing',
        path: '/cash-closing',
        component: lazy(() => import('@/views/cashFlow/cashClosingIndex')),
        authority: [],
    },
    {
        key: 'accountsReceivable',
        path: '/accounts-receivable',
        component: lazy(() => import('@/views/cashFlow/accountsReceivableIndex')),
        authority: [],
    },
    {
        key: 'accountsPayable',
        path: '/accounts-payable',
        component: lazy(() => import('@/views/cashFlow/accountsPayableIndex')),
        authority: [],
    },
    {
        key: 'prosthesis',
        path: '/prosthesis',
        component: lazy(() => import('@/views/prosthesis/prosthesisDashboard')),
        authority: [],
    },
    {
        key: 'prosthesisRequestDetail',
        path: '/prosthesis/requests/:id',
        component: lazy(() => import('@/views/prosthesis/prosthesisRequestDetail')),
        authority: [],
    },
    {
        key: 'prosthesisTypes',
        path: '/prosthesis/types',
        component: lazy(() => import('@/views/prosthesis/prosthesisTypesIndex')),
        authority: [],
    },
    {
        key: 'prosthesisLaboratories',
        path: '/prosthesis/laboratories',
        component: lazy(() => import('@/views/prosthesis/laboratoriesIndex')),
        authority: [],
    },
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
