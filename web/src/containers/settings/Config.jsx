import React from 'react';
import {connect} from 'react-redux';
import styles from './styles.css';
import {withTranslation} from 'react-i18next';
import ConfigSelect from '../../components/Config/ConfigSelect/Index.jsx';
import language from "./lib/language.json";
import {actions as codeActions} from "../../reducers/code";

class Config extends React.Component {
    state = {};

    actions = {
        changeLanguage: (lng) => {
            this.props.i18n.changeLanguage(lng);
            this.props.changeLanguage4code(lng)
        }
    };

    render() {
        const {t} = this.props;
        const languageOptions = [];
        Object.keys(language).forEach((key) => {
            languageOptions.push({value: key, label: language[key]})
        });

        return (
            <div className={styles.div_content}>
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

const mapDispatchToProps = (dispatch) => {
    return {
        changeLanguage4code: (lng) => dispatch(codeActions.changeLanguage(lng))
    };
};

export default connect(null, mapDispatchToProps)(withTranslation()(Config));

