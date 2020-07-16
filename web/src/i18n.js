import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import {initReactI18next} from 'react-i18next'

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: 'en',
        backend: {
            /* translation file path */
            loadPath: './asset/i18n/{{ns}}/{{lng}}.json'
        },
        fallbackLng: 'en',
        debug: false,
        ns: ['translations'],
        defaultNS: 'translations',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
            formatSeparator: ','
        },
        react: {
            useSuspense: false,
            wait: true
        }
    });

export default i18n
