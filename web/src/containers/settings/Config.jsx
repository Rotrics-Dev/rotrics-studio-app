import React from 'react';
import {Row, Col, Button, Steps, message, Modal, Result} from 'antd';
import {connect} from 'react-redux';
import styles from './styles.css';
import {actions as firmwareUpgradeActions} from '../../reducers/firmwareUpgrade.js';
import {withTranslation} from 'react-i18next';
import {Select} from 'antd'
import ConfigSelect from '../../components/Config/ConfigSelect/Index.jsx';
import language from "./lib/language.json";

class Config extends React.Component {
    state = {};

    // componentDidMount() {
    //     setInterval(() => {
    //         const languages = this.props.i18n.languages;
    //         const language = this.props.i18n.language;
    //         console.log("languages: " + languages)
    //         console.log("language: " + language)
    //     }, 2000)
    // }

    actions = {
        changeLanguage: (lng) => {
            console.log("lng: " + lng)
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

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Config));

