import React from 'react';
import {withTranslation} from 'react-i18next';
import ConfigSelect from '../../components/Config/ConfigSelect/Index.jsx';
import language from "./lib/language.json";

class Config extends React.Component {
    state = {};

    actions = {
        changeLanguage: (lng) => {
            this.props.i18n.changeLanguage(lng);
        }
    };

    render() {
        const {t} = this.props;
        const languageOptions = [];
        Object.keys(language).forEach((key) => {
            languageOptions.push({value: key, label: language[key]})
        });

        return (
            <div>
                <h2>{t("Language")}</h2>
                <ConfigSelect
                    style={{width: "200px"}}
                    value={this.props.i18n.language}
                    onChange={this.actions.changeLanguage}
                    options={languageOptions}/>
            </div>
        )
    }
}

export default withTranslation()(Config);

