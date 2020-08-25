import React, {PureComponent} from 'react';
import {Radio} from 'antd';
import {actions as p3dMaterialSettingsActions} from "../../../../reducers/p3dMaterialSettings";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";

const tooltipId = getUuid();

class MaterialSettings extends PureComponent {
    actions = {
        updateParameter: (keyChain, value) => {
            this.props.update(`${keyChain}.default_value`, value);
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

        const {materialSettingsFilter} = this.props;

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

        const header = tCura("Material Settings");
        const icon = null;
        const categoryKey = "material.children";
        const allowUpdateParameter = !isOfficial;
        const elements4categoryChildren = renderCategoryChildren(selected.material.children, categoryKey, materialSettingsFilter, tCura, tooltipId, actions.updateParameter, allowUpdateParameter);

        const elements = [elements4Radio, ...elements4categoryChildren];
        const panels = wrapCollapsePanel(header, icon, elements);
        const collapse = wrapCollapse(panels);
        return (
            <div>
                <Tooltip
                    id={tooltipId}
                    place="left"
                />
                <div>
                    {collapse}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {settings, selected} = state.p3dMaterialSettings;
    const {materialSettingsFilter} = state.p3dSettingVisibility;
    return {
        settings,
        selected,
        materialSettingsFilter
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dMaterialSettingsActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dMaterialSettingsActions.rename(newName)),
        delete: (name) => dispatch(p3dMaterialSettingsActions.delete(name)),
        clone: (name) => dispatch(p3dMaterialSettingsActions.clone(name)),
        select: (name) => dispatch(p3dMaterialSettingsActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(MaterialSettings));
