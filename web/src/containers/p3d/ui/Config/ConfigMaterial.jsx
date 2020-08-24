import React, {PureComponent} from 'react';
import {Radio} from 'antd';
import {actions as p3dConfigMaterialActions} from "../../../../reducers/p3dConfigMaterial";
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import Tooltip from '../../../Tooltip/Index.jsx';
import {getUuid} from "../../../../utils";
import {renderCategoryChildren, wrapCollapse, wrapCollapsePanel} from "./renderUtils.jsx";

const tooltipId = getUuid();

class ConfigMaterial extends PureComponent {
    actions = {
        updateParameter: (keyChain, value) => {
            this.props.update(`${keyChain}.default_value`, value);
        },
        onChange: (e) => {
            this.props.select(e.target.value)
        }
    };

    render() {
        const {materials, selected} = this.props;
        if (!materials || materials.length === 0 || !selected) {
            return null;
        }

        const actions = this.actions;
        const tCura = (key) => {
            return this.props.t("cura#" + key);
        };

        const {name, isOfficial, settings} = selected;

        const elements4Radio =
            <Radio.Group
                style={{margin: "3px 0 0 3px"}}
                key="2"
                size="small"
                defaultValue={nameSelected}
                onChange={actions.onChange}
            >
                {materials.map(item => {
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

        const header = tCura(selected.material.label);
        const icon = null;
        const categoryKey = "material.children";
        const allowUpdateParameter = !selected.isOfficial;
        const elements4categoryChildren = renderCategoryChildren(selected.material.children, categoryKey, ".", tCura, tooltipId, actions.updateParameter, allowUpdateParameter);

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
    const {materials, selected} = state.p3dConfigMaterial;
    return {
        materials,
        selected
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        update: (keyChain, value) => dispatch(p3dConfigMaterialActions.update(keyChain, value)),
        rename: (newName) => dispatch(p3dConfigMaterialActions.rename(newName)),
        delete: (name) => dispatch(p3dConfigMaterialActions.delete(name)),
        clone: (name) => dispatch(p3dConfigMaterialActions.clone(name)),
        select: (name) => dispatch(p3dConfigMaterialActions.select(name)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['cura'])(ConfigMaterial));
