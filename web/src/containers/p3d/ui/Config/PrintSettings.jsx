import React from 'react';
import {Radio, Collapse} from 'antd';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dPrintSettingsActions} from "../../../../reducers/p3dPrintSettings";

const tooltipId = getUuid();

const category_all = [
    "resolution",
    "shell",
    "infill",
    // "material",
    "speed",
    "travel",
    "cooling",
    "support",
    "platform_adhesion",
    "dual",
    "meshfix",
    "blackmagic",
    "experimental"
];

const displayedCategories = category_all;

class PrintSettings extends React.Component {
    actions = {
        updateParameter: (keyChain, value) => {
            this.props.update(`settings.${keyChain}.default_value`, value);
        },
        onChange: (e) => {
            this.props.select(e.target.value)
        }
    };

    render() {
        const {settings, selected} = this.props;
        if (!settings || settings.length === 0 || !selected) {
            return null;
        }

        const {printSettingsFilter} = this.props;
        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        const {name, isOfficial} = selected;
        const elements4Radio =
            <Radio.Group
                style={{padding: "3px 0 0 8px"}}
                key="2"
                size="small"
                defaultValue={name}
                onChange={actions.onChange}
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

        let panels = [];
        for (let key in selected.settings) {
            if (displayedCategories.includes(key)) {
                const category = selected.settings[key];
                const header = tCura(category.label);
                const icon = category.icon;
                const categoryKey = `${key}.children`;
                const allowUpdateParameter = !isOfficial;
                const elements = renderCategoryChildren(category.children, categoryKey, printSettingsFilter, tCura, tooltipId, actions.updateParameter, allowUpdateParameter);
                panels = panels.concat(wrapCollapsePanel(header, icon, elements));
            }
        }
        const elements = [elements4Radio, ...panels];
        const collapse = wrapCollapse(elements);

        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <div>
                    <Collapse expandIconPosition="right">
                        <Collapse.Panel
                            key="1"
                            header="Print Settings"
                            style={{
                                fontSize: "13px",
                            }}>
                            {collapse}
                        </Collapse.Panel>
                    </Collapse>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {settings, selected} = state.p3dPrintSettings;
    const {printSettingsFilter} = state.p3dSettingVisibility;
    return {
        settings,
        selected,
        printSettingsFilter
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


