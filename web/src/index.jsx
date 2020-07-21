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
import styles from './styles.css'//可以做一些样式覆盖
import i18nOptions from "./i18n";
import i18n from 'i18next'

console.time('i18n');
i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(i18nOptions)
    .then(
        (t) => {
            console.timeEnd('i18n');
            const reduxStore = createStore(reducer, applyMiddleware(thunk));
            ReactDom.render(
                <Provider store={reduxStore}>
                    <Index/>
                </Provider>,
                document.getElementById('content')
            );
        }
    );