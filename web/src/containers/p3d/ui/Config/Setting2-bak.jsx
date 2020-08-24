import React from 'react';
import {Radio} from 'antd';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dSettingActions} from "../../../../reducers/p3dSetting";

const tooltipId = getUuid();

const category_basic = ["resolution", "shell", "infill"];
const parameter_basic = [
    "resolution.layer_height", "resolution.layer_height_0",
    "resolution.line_width", "resolution.line_width.wall_line_width.wall_line_width_0", "resolution.line_width.wall_line_width.wall_line_width_x",
    "resolution.layer_height",
    "shell",
    "infill"];

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
const parameter_all = [];

const displayedCategories = category_all;

class Setting extends React.Component {
    actions = {
        updateParameter: (keyChain, value) => {
            console.log(keyChain, value)
            this.props.update(`${keyChain}.default_value`, value);
        },
        onChange: (e) => {
            console.log("onChange: " + e.target.value)
            this.props.select(e.target.value)
        }
    };

    render() {
        const {settings, setting} = this.props;
        if (!settings || settings.length === 0 || !setting) {
            return null;
        }

        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const nameSelected = setting.name;
        const elements4Radio =
            <Radio.Group
                style={{margin: "3px 0 0 3px"}}
                key="2"
                size="small"
                defaultValue={nameSelected}
                onChange={actions.onChange}
            >
                {settings.map(item => {
                    const {name} = item;
                    return (
                        <Radio.Button
                            key={name}
                            size="small"
                            checked={nameSelected === name}
                            value={name}>
                            {name}
                        </Radio.Button>
                    );
                })}
            </Radio.Group>;

        let panels = [];
        for (let key in settings) {
            if (displayedCategories.includes(key)) {
                const category = settings[key];
                const header = tCura(category.label);
                const icon = category.icon;
                const categoryKey = `${key}.children`;
                const allowUpdateParameter = !material.isOfficial;
                const elements = renderCategoryChildren(category.children, categoryKey, ".", tCura, tooltipId, actions.updateParameter, allowUpdateParameter);
                panels = panels.concat(wrapCollapsePanel(header, icon, elements));
            }
        }
        const elements = [elements4Radio, ...panels];
        const collapse = wrapCollapse(elements);

        return (
            <div style={{backgroundColor: "#e0e0e0", width: "100%"}}>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <div>
                    {collapse}
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const {settings, setting} = state.p3dSetting;
    return {
        settings,
        setting
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dSettingActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dSettingActions.rename(newName)),
        delete: (name) => dispatch(p3dSettingActions.delete(name)),
        clone: (name) => dispatch(p3dSettingActions.clone(name)),
        select: (name) => dispatch(p3dSettingActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(Setting));


