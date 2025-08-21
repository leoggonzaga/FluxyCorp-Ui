import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    /** Example purpose only, please remove */
    // {
    //     key: 'singleMenuItem',
    //     path: '/single-menu-view',
    //     title: 'Single menu item',
    //     translateKey: 'nav.singleMenuItem',
    //     icon: 'singleMenu',
    //     type: NAV_ITEM_TYPE_ITEM,
    //     authority: [],
    //     subMenu: [],
    // },
    {
        key: 'groupMenu',
        path: '',
        title: 'Equipe',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'employees',
                path: '/employees',
                title: 'Funcionários',
                translateKey: '',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'comission',
                path: '/comission',
                title: 'Comissionamento',
                translateKey: '',
                icon: 'currencyDolar',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            }
        ],
    },

    {
        key: 'crm',
        path: '',
        title: 'CRM',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'calendar',
                path: '/calendar',
                title: 'Calendário',
                translateKey: '',
                icon: 'calendar',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'patients',
                path: '/patients',
                title: 'Prontuários',
                translateKey: '',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            }
        ],
    },
    {
        key: 'finance',
        path: '',
        title: 'Financeiro',
        translateKey: '',
        icon: 'currencyDolar',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'receivables',
                path: '/receivables',
                title: 'Recebíveis',
                translateKey: '',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'bankTransactions',
                path: '/bank-transactions',
                title: 'Transações Bancárias',
                translateKey: '',
                icon: 'groupSingleMenu',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            }
        ],
    },
    {
        key: 'config',
        path: '',
        title: 'Configurações',
        translateKey: '',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'configs',
                path: '',
                title: 'Configurações',
                translateKey: '',
                icon: 'gear',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [],
                subMenu: [
                    {
                        key: 'consultationType',
                        path: '/consultation-type',
                        title: 'Tipos de Atendimento',
                        translateKey: '',
                        icon: 'clipboarList',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [],
                        subMenu: [],
                    },
                    {
                        key: 'serviceTables',
                        path: '/service-tables',
                        title: 'Tabelas de Serviços',
                        translateKey: '',
                        icon: 'clipboarList',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [],
                        subMenu: [],
                    },
                ],
            },
        ],
    },
]

export default navigationConfig
