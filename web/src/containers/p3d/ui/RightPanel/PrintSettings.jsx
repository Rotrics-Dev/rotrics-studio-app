import React from 'react';
import {Radio, Collapse} from 'antd';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dPrintSettingsActions} from "../../../../reducers/p3dPrintSettings";
import Line from "../../../../components/Line/Index.jsx";

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
};

class PrintSettings extends React.Component {
    actions = {
        updateSetting: (keyChain, value) => {
            this.props.update(`settings.${keyChain}.default_value`, value);
        },
        selectSettings: (e) => {
            this.props.select(e.target.value)
        }
    };

    render() {
        const {settings, selected, printSettingsFilter, printSettingsCategoryFilter} = this.props;
        if (!settings || settings.length === 0 || !selected) {
            return null;
        }

        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const {name, isOfficial} = selected;
        const radioGroup =
            <Radio.Group
                style={{padding: "3px 0 0 8px"}}
                key="2"
                size="small"
                defaultValue={name}
                onChange={actions.selectSettings}
            >
                {settings.map(item => {
                    const {name: itemName} = item;
                    return (
                        <Radio
                            style={radioStyle}
                            key={itemName}
                            size="small"
                            checked={itemName === name}
                            value={itemName}>
                            {itemName}
                        </Radio>
                    );
                })}
            </Radio.Group>;

        let collapsePanels = [];
        for (let key in selected.settings) {
            if (printSettingsCategoryFilter.includes(key)) {
                const category = selected.settings[key];
                const header = tCura(category.label);
                const icon = category.icon;
                const categoryKey = `${key}.children`;
                const editable = !isOfficial;
                const elements4settings = renderCategoryChildren(category.children, categoryKey, printSettingsFilter, tCura, actions.updateSetting, editable);
                collapsePanels = collapsePanels.concat(wrapCollapsePanel(header, icon, elements4settings));
            }
        }
        const line = <Line key="line"/>;
        const elements = [radioGroup, line, ...collapsePanels];
        const collapse = wrapCollapse(elements);
        return (
            <div>
                <Collapse expandIconPosition="right">
                    <Collapse.Panel
                        forceRender={true}
                        key="1"
                        header="Print Settings"
                        style={{
                            fontSize: "13px",
                        }}>
                        {collapse}
                    </Collapse.Panel>
                </Collapse>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {settings, selected} = state.p3dPrintSettings;
    const {printSettingsFilter, printSettingsCategoryFilter} = state.p3dSettingVisibility;
    return {
        settings,
        selected,
        printSettingsFilter,
        printSettingsCategoryFilter
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dPrintSettingsActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dPrintSettingsActions.rename(newName)),
        delete: (name) => dispatch(p3dPrintSettingsActions.delete(name)),
        clone: (name) => dispatch(p3dPrintSettingsActions.clone(name)),
        select: (name) => dispatch(p3dPrintSettingsActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(PrintSettings));


