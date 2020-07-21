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
};

export default i18nOptions
