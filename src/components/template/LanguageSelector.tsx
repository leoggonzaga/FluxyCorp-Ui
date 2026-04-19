import { useState } from 'react'
import Spinner from '@/components/ui/Spinner'
import { setLang, useAppSelector, useAppDispatch } from '@/store'
import { dateLocales } from '@/locales'
import dayjs from 'dayjs'
// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next'

const LANGUAGES = [
    { value: 'pt-BR', flag: '🇧🇷', label: 'Português (BR)' },
    { value: 'pt-PT', flag: '🇵🇹', label: 'Português (PT)' },
    { value: 'en',    flag: '🇺🇸', label: 'English' },
    { value: 'es',    flag: '🇪🇸', label: 'Español' },
]

const LanguageSelector = () => {
    const [loading, setLoading] = useState(false)
    const locale = useAppSelector((state) => state.locale.currentLang)
    const dispatch = useAppDispatch()

    const onSelect = (lang: string) => {
        if (lang === locale || loading) return
        const formatted = lang.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
        setLoading(true)

        const apply = () => {
            i18n.changeLanguage(formatted)
            dispatch(setLang(lang))
            setLoading(false)
        }

        const loader = dateLocales[formatted] ?? dateLocales[lang]
        if (loader) {
            loader().then(() => { dayjs.locale(formatted); apply() }).catch(apply)
        } else {
            apply()
        }
    }

    if (loading) {
        return (
            <div className="flex items-center px-2">
                <Spinner size={18} />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-0.5 px-1">
            {LANGUAGES.map((lang) => {
                const active = locale === lang.value
                return (
                    <button
                        key={lang.value}
                        title={lang.label}
                        onClick={() => onSelect(lang.value)}
                        className={[
                            'flex items-center justify-center w-8 h-8 rounded-lg text-lg transition-all duration-150 select-none',
                            active
                                ? 'bg-white dark:bg-gray-700 shadow-sm ring-1 ring-black/5 scale-110'
                                : 'opacity-40 hover:opacity-80 hover:bg-black/5 dark:hover:bg-white/10',
                        ].join(' ')}
                    >
                        {lang.flag}
                    </button>
                )
            })}
        </div>
    )
}

export default LanguageSelector
