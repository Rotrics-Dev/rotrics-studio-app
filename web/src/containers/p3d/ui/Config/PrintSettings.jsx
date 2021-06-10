import React from 'react';
import {Radio, Collapse} from 'antd';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dPrintSettingsActions} from "../../../../reducers/p3dPrintSettings";
import Line from "../../../../components/Line/Index.jsx";

const tooltipId = getUuid();
const radioStyle = {
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
};

/**
 * 3D打印工作区，Print Settings
 * 优化 3D打印功能 打印设定区参数显示
 */
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
        const {settings, selected, printSettingsFilter, printSettingsCategoryFilter, t} = this.props;
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
                style={{padding: "3px 0 3px 8px"}}
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
                            {t(itemName)}
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
                const elements4settings = renderCategoryChildren(category.children, categoryKey, printSettingsFilter, tCura, tooltipId, actions.updateSetting, editable);
                collapsePanels = collapsePanels.concat(wrapCollapsePanel(header, icon, elements4settings));
            }
        }
        const line = <Line key="line"/>;
        const elements = [radioGroup, line, ...collapsePanels];
        // console.log(elements)

        // 所有选项
        const collapse = wrapCollapse(elements);

        // console.log('所有选项')
        // console.log(collapse)
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <Collapse expandIconPosition="right">
                    <Collapse.Panel
                        forceRender={true}
                        key="1"
                        header={t("Print Settings")}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PrintSettings));


