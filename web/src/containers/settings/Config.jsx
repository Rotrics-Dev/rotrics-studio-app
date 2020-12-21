import React from 'react';
import {withTranslation} from 'react-i18next';
import ConfigSelect from '../../components/Config/ConfigSelect/Index.jsx';
import language from "./lib/language.json";
import {Switch, Space} from 'antd';
import {connect} from 'react-redux';
import {actions as appConfigActions} from "../../reducers/appConfig";

class Config extends React.Component {
    actions = {
        changeLanguage: (lng) => {
            this.props.i18n.changeLanguage(lng);
        },
        toggleShowTips: (checked) => {
            this.props.changeIsShowTip(checked)
        }
    };

    render() {
        const actions = this.actions;
        const {t, i18n, is_show_tip} = this.props;

        const languageOptions = [];
        Object.keys(language).forEach((key) => {
            languageOptions.push({value: key, label: language[key]})
        });

        return (
            <Space direction={"vertical"} size={20}>
                <div>
                    <h3 style={{marginBottom: "3px"}}>{t("Language")}</h3>
                    <ConfigSelect
                        style={{width: "200px"}}
                        value={i18n.language}
                        onChange={actions.changeLanguage}
                        options={languageOptions}/>
                </div>
                <div>
                    <h3 style={{marginBottom: "3px"}}>{t("Show Tips")}</h3>
                    <Switch
                        size="small"
                        checked={is_show_tip}
                        onChange={actions.toggleShowTips}/>
                </div>
            </Space>
        )
    }
}

const mapStateToProps = (state) => {
    const {is_show_tip} = state.appConfig;
    return {
        is_show_tip
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeIsShowTip: (value) => dispatch(appConfigActions.changeIsShowTip(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Config));



