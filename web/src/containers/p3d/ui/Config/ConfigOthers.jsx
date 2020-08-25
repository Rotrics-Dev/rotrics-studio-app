import React from 'react';
import {Radio, Collapse} from 'antd';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";
import {actions as p3dConfigOthersActions} from "../../../../reducers/p3dConfigOthers";

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

        const {configOthersParameter} = this.props;
        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        const {name, isOfficial, settings} = selected;
        const elements4Radio =
            <Radio.Group
                style={{padding: "3px 0 0 8px"}}
                key="2"
                size="small"
                defaultValue={name}
                onChange={actions.onChange}
            >
                {configs.map(item => {
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
        for (let key in settings) {
            if (displayedCategories.includes(key)) {
                const category = settings[key];
                const header = tCura(category.label);
                const icon = category.icon;
                const categoryKey = `${key}.children`;
                const allowUpdateParameter = !isOfficial;
                const elements = renderCategoryChildren(category.children, categoryKey, configOthersParameter, tCura, tooltipId, actions.updateParameter, allowUpdateParameter);
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
                            header="Printing Settings"
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
    const {configs, selected} = state.p3dConfigOthers;
    const {configOthersParameter} = state.p3dConfigVisibility;
    return {
        configs,
        selected,
        configOthersParameter
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


