import React from 'react';
import ReactDom from 'react-dom';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next'
import Index from './containers/Index.jsx';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './reducers';
import styles from './styles.css';
import i18next from 'i18next'

const i18nOptions = {
    // lng: "zh-CN",
    backend: {
        /* translation file path */
        loadPath: './asset/i18n/{{ns}}/{{lng}}.json'
    },
    /**
     * Array of allowed languages
     * @default false
     */
    supportedLngs: ['en', 'zh-CN'],
    /**
     * Language codes to lookup, given set language is
     * 'en-US': 'all' --> ['en-US', 'en', 'dev'],
     * 'currentOnly' --> 'en-US',
     * 'languageOnly' --> 'en'
     * @default 'all'
     */
    load: 'currentOnly',
    fallbackLng: 'en',
    debug: false,
    ns: ['common', 'cura'],
    defaultNS: 'common',
    keySeparator: false,
    nsSeparator: "#",
    interpolation: {
        escapeValue: false,
        formatSeparator: ','
    },
    react: {
        useSuspense: false,
        wait: true
    }
};

i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nOptions)
    .then(
        (t) => {
            const reduxStore = createStore(reducer, applyMiddleware(thunk));
            ReactDom.render(
                <Provider store={reduxStore}>
                    <Index/>
                </Provider>,
                document.getElementById('content')
            );
        }
    );
