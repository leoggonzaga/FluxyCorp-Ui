import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

// Rotas acessíveis sem autenticação e sem redirecionamento para autenticados
export const openRoutes: Routes = [
    {
        key: 'monitorDisplay',
        path: '/monitor/display',
        component: lazy(() => import('@/views/monitor/MonitorDisplay')),
        authority: [],
        meta: { layout: 'blank', pageContainerType: 'gutterless' },
    },
]

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
        key: 'services_catalog',
        path: '/services-catalog',
        component: lazy(() => import('@/views/services_catalog/ServicesCatalogIndex')),
        authority: [],
    },
    {
        key: 'catalog',
        path: '/catalog/:id',
        component: lazy(() => import('@/views/catalog/catalogView')),
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
        key: 'estabelecimento',
        path: '/settings/estabelecimento',
        component: lazy(() => import('@/views/settings/EstabelecimentoIndex')),
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
        key: 'paymentMethods',
        path: '/settings/payment-methods',
        component: lazy(() => import('@/views/settings/PaymentMethodsIndex')),
        authority: [],
    },
    {
        key: 'rooms',
        path: '/settings/rooms',
        component: lazy(() => import('@/views/settings/RoomsIndex')),
        authority: [],
    },
    {
        key: 'chartOfAccounts',
        path: '/settings/chart-of-accounts',
        component: lazy(() => import('@/views/settings/ChartOfAccountsIndex')),
        authority: [],
    },
    {
        key: 'comissionamento',
        path: '/settings/comissionamento',
        component: lazy(() => import('@/views/settings/ComissionamentoIndex')),
        authority: [],
    },
    {
        key: 'monitorSettings',
        path: '/settings/monitor',
        component: lazy(() => import('@/views/settings/MonitorSettingsIndex')),
        authority: [],
    },
    {
        key: 'financialAccounts',
        path: '/finance/accounts',
        component: lazy(() => import('@/views/finance/FinancialAccountsIndex')),
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
        key: 'returnControl',
        path: '/return-control',
        component: lazy(() => import('@/views/returnControl/ReturnControlIndex')),
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
        key: 'costCenterGoals',
        path: '/finance/cost-center-goals',
        component: lazy(() => import('@/views/finance/CostCenterGoalsIndex')),
        authority: [],
    },
    {
        key: 'clinicalAudit',
        path: '/reports/clinical-audit',
        component: lazy(() => import('@/views/reports/clinicalAudit/ClinicalAuditIndex')),
        authority: [],
    },
    {
        key: 'professionalPerformance',
        path: '/reports/professional-performance',
        component: lazy(() => import('@/views/reports/professionalPerformance/ProfessionalPerformanceIndex')),
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
