// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import ptBR from './lang/pt-BR.json'
import appConfig from '@/configs/app.config'

const resources = {
    en: {
        translation: en,
    },
    'pt-BR': {
        translation: ptBR,
    },
    'pt-PT': {
        translation: ptBR,
    },
    es: {
        translation: en,
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: appConfig.locale,
    lng: appConfig.locale,
    interpolation: {
        escapeValue: false,
    },
})

export const dateLocales: {
    [key: string]: () => Promise<ILocale>
} = {
    en:      () => import('dayjs/locale/en'),
    'pt-BR': () => import('dayjs/locale/pt-br'),
    ptBR:    () => import('dayjs/locale/pt-br'),
    'pt-PT': () => import('dayjs/locale/pt'),
    ptPT:    () => import('dayjs/locale/pt'),
    es:      () => import('dayjs/locale/es'),
}

export default i18n
