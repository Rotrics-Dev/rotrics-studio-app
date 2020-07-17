import React from 'react';
import {Row, Col, Button, Steps, message, Modal, Result} from 'antd';
import {connect} from 'react-redux';
import styles from './styles.css';
import {actions as firmwareUpgradeActions} from '../../reducers/settingsGeneral.js';
import {withTranslation} from 'react-i18next';

class Config extends React.Component {
    state = {};

    componentDidMount() {
        setInterval(() => {
            const languages = this.props.i18n.languages;
            const language = this.props.i18n.language;
            console.log("languages: " + languages)
            console.log("language: " + language)
        }, 2000)
    }

    actions = {
        changeLanguage: (lng) => {
            console.log("lng: " + lng)
            this.props.i18n.changeLanguage(lng);
        }
    };

    render() {
        const state = this.state;
        const actions = this.actions;

        return (
            <div className={styles.div_content}>
                <h2>{this.props.t("hello")}</h2>
                <button onClick={() => actions.changeLanguage("de")}>de</button>
                <button onClick={() => actions.changeLanguage("en")}>en</button>
                <button onClick={() => actions.changeLanguage("zh-CN")}>zh-CN</button>
                {/*<Select*/}
                    {/*style={{width: 300}}*/}
                    {/*value={selectedPath}*/}
                    {/*onChange={actions.selectPath}*/}
                    {/*placeholder="Choose a port"*/}
                    {/*options={options}/>*/}
            </div>
        )
    }
}

export default withTranslation()(Config);

