import React from 'react';
import {withTranslation} from 'react-i18next';
import ConfigSelect from '../../components/Config/ConfigSelect/Index.jsx';
import language from "./lib/language.json";
import {Switch, Space} from 'antd';
import {actions as persistentDataActions} from "../../reducers/persistentData";
import {connect} from 'react-redux';

class Config extends React.Component {
    actions = {
        changeLanguage: (lng) => {
            this.props.i18n.changeLanguage(lng);
        },
        toggleIsTooltipDisplayed: (checked) => {
            this.props.setIsTooltipDisplayed(checked)
        }
    };

    render() {
        const actions = this.actions;
        const {t} = this.props;
        const {isTooltipDisplayed} = this.props;
        const languageOptions = [];
        Object.keys(language).forEach((key) => {
            languageOptions.push({value: key, label: language[key]})
        });
        return (
            <div>
                <Space direction={"vertical"} size={20}>
                    <div>
                        <h3 style={{marginBottom: "3px"}}>{t("Language")}</h3>
                        <ConfigSelect
                            style={{width: "200px"}}
                            value={this.props.i18n.language}
                            onChange={this.actions.changeLanguage}
                            options={languageOptions}/>
                    </div>
                    <div>
                        <h3 style={{marginBottom: "3px"}}>{t("Show Tooltip")}</h3>
                        <Switch
                            style={{}}
                            checked={isTooltipDisplayed}
                            onChange={actions.toggleIsTooltipDisplayed}/>
                    </div>
                </Space>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {isTooltipDisplayed} = state.persistentData;
    return {
        isTooltipDisplayed
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setIsTooltipDisplayed: (value) => dispatch(persistentDataActions.setIsTooltipDisplayed(value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Config));



