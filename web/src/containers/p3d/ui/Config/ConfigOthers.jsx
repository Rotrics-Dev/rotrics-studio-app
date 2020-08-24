import React from 'react';
import {Radio, Collapse} from 'antd';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dConfigOthersActions} from "../../../../reducers/p3dConfigOthers";

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

class ConfigOthers extends React.Component {
    actions = {
        updateParameter: (keyChain, value) => {
            this.props.update(`settings.${keyChain}.default_value`, value);
        },
        onChange: (e) => {
            this.props.select(e.target.value)
        }
    };

    render() {
        const {configs, selected} = this.props;
        if (!configs || configs.length === 0 || !selected) {
            return null;
        }

        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const {name, isOfficial, settings} = selected;
        const elements4Radio =
            <Radio.Group
                style={{margin: "3px 0 0 3px", backgroundColor: "#eeeeee"}}
                key="2"
                size="small"
                defaultValue={name}
                onChange={actions.onChange}
            >
                {configs.map(item => {
                    const {name: itemName} = item;
                    return (
                        <Radio.Button
                            key={itemName}
                            size="small"
                            checked={itemName === name}
                            value={itemName}>
                            {itemName}
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
                const allowUpdateParameter = !isOfficial;
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
                    <Collapse expandIconPosition="right">
                        <Collapse.Panel
                            key="1"
                            header="Printing Settings"
                            style={{
                                fontSize: "13px",
                                background: "#eeeeee"
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
    const {configs, selected} = state.p3dConfigOthers;
    return {
        configs,
        selected
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dConfigOthersActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dConfigOthersActions.rename(newName)),
        delete: (name) => dispatch(p3dConfigOthersActions.delete(name)),
        clone: (name) => dispatch(p3dConfigOthersActions.clone(name)),
        select: (name) => dispatch(p3dConfigOthersActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(ConfigOthers));


